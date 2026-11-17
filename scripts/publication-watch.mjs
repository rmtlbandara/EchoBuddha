#!/usr/bin/env node
// Publication watch: runs on GitHub Actions, independent of any Claude Code session.
// It never publishes and needs no credentials. It reads the watch manifest and the
// append-only ledger on main, checks YouTube public status through oEmbed, and exits
// non-zero when something needs a person. A failed scheduled run is the alert.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const DONE = new Set(["PUBLISHED_VERIFIED", "ALREADY_PUBLISHED_VERIFIED"]);
export const CLOSED = new Set(["CANCELLED_DUPLICATE", "NOT_APPROVED"]);

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i += 1; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(field); field = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i += 1;
      row.push(field); field = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else field += ch;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  const [header, ...body] = rows;
  return body.map((cells) => Object.fromEntries(header.map((name, index) => [name, cells[index] ?? ""])));
}

// The ledger is append-only: the last row for a retry_key is its current state.
export function latestByKey(rows) {
  const latest = new Map();
  for (const row of rows) latest.set(row.retry_key, row);
  return latest;
}

export function evaluate({ manifest, ledgerRows, now, youtube = {} }) {
  const latest = latestByKey(ledgerRows);
  const t = manifest.thresholds_minutes;
  const minutes = (item) => (now.getTime() - Date.parse(item.due_utc)) / 60000;
  const alerts = [];
  const status = [];
  if (now.getTime() > Date.parse(manifest.watch_until_utc)) return { alerts, status, expired: true };
  for (const item of manifest.items) {
    const row = latest.get(item.retry_key);
    const ledgerStatus = row?.status || "MISSING_FROM_LEDGER";
    const since = minutes(item);
    status.push({ retry_key: item.retry_key, due_utc: item.due_utc, mode: item.mode, ledger_status: ledgerStatus });
    if (DONE.has(ledgerStatus) || CLOSED.has(ledgerStatus)) continue;
    if (item.mode === "manual_native" && since >= -t.manual_reminder_before_due && since < 0) {
      alerts.push({ kind: "MANUAL_DUE_SOON", item, detail: `Due in ${Math.round(-since)} min. Publish natively on Instagram (account echobuddha, AI label on), then record it.` });
    }
    if (item.youtube_id && since >= t.youtube_public_after_due) {
      const live = youtube[item.youtube_id];
      if (live && !live.public) alerts.push({ kind: "YOUTUBE_NOT_PUBLIC", item, detail: `oEmbed returned HTTP ${live.http} ${Math.round(since)} min after due.` });
    }
    const liveConfirmed = item.youtube_id && youtube[item.youtube_id]?.public;
    if (since >= t.unrecorded_after_due && !liveConfirmed) {
      alerts.push({ kind: "NOT_VERIFIED_IN_LEDGER", item, detail: `Ledger on main says ${ledgerStatus} ${Math.round(since / 60)} h after due. Verify on the platform and append a ledger row.` });
    }
  }
  return { alerts, status, expired: false };
}

export async function checkYouTube(id, fetchImpl = fetch) {
  const url = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/shorts/${id}`)}`;
  try {
    const response = await fetchImpl(url, { redirect: "follow" });
    return { public: response.status === 200, http: response.status };
  } catch (error) {
    return { public: false, http: `network error: ${error.message}` };
  }
}

function argValue(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

async function main() {
  const root = process.cwd();
  const manifestPath = argValue("--manifest") || "docs/marketing/2026-11/publication-watch.json";
  const manifest = JSON.parse(fs.readFileSync(path.join(root, manifestPath), "utf8"));
  const ledgerRows = parseCsv(fs.readFileSync(path.join(root, manifest.ledger), "utf8"));
  const now = argValue("--now") ? new Date(argValue("--now")) : new Date();
  const offline = process.argv.includes("--offline");
  const youtube = {};
  for (const item of manifest.items) {
    if (!item.youtube_id || offline) continue;
    if (now.getTime() - Date.parse(item.due_utc) < manifest.thresholds_minutes.youtube_public_after_due * 60000) continue;
    youtube[item.youtube_id] = await checkYouTube(item.youtube_id);
  }
  const result = evaluate({ manifest, ledgerRows, now, youtube });
  const lines = [`# Publication watch`, ``, `Run at ${now.toISOString()} (UTC). Ledger: \`${manifest.ledger}\` on this commit.`, ``];
  if (result.expired) lines.push(`Watch window ended ${manifest.watch_until_utc}. Nothing to check.`);
  else if (result.alerts.length === 0) lines.push(`No alerts.`);
  else {
    lines.push(`## ${result.alerts.length} alert(s)`, ``, `| Kind | Retry key | Due (UTC) | Mode | Detail |`, `|---|---|---|---|---|`);
    for (const alert of result.alerts) lines.push(`| ${alert.kind} | ${alert.item.retry_key} | ${alert.item.due_utc} | ${alert.item.mode} | ${alert.detail} |`);
  }
  const checked = Object.entries(youtube);
  if (checked.length) {
    lines.push(``, `## YouTube public checks`, ``);
    for (const [id, live] of checked) lines.push(`- ${id}: ${live.public ? "public" : "not public"} (HTTP ${live.http})`);
  }
  const text = `${lines.join("\n")}\n`;
  process.stdout.write(text);
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, text);
  if (result.alerts.length) {
    for (const alert of result.alerts) console.log(`::error title=${alert.kind}::${alert.item.retry_key}: ${alert.detail}`);
    process.exitCode = 1;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) await main();

const workersCi = ["1", "true"].includes(
  (process.env.WORKERS_CI ?? "").trim().toLowerCase(),
);
const branch = (process.env.WORKERS_CI_BRANCH ?? "")
  .trim()
  .replace(/^refs\/heads\//, "");

if (workersCi && (!branch || branch === "main")) {
  console.error(
    "Blocked the legacy Cloudflare Git production build. Use the governed GitHub Deploy Production workflow with an authorized exact main SHA.",
  );
  process.exit(42);
}

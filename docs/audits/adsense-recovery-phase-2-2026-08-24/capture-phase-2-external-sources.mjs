import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const outDir = path.dirname(fileURLToPath(import.meta.url));
const outputPath = path.join(outDir, "ECHO_BUDDHA_PHASE_2_EXTERNAL_SOURCE_SNAPSHOT.json");

// This registry contains only public policy/benchmark pages. No EchoBuddha content,
// query, source excerpt, identifier, or private evidence is sent to these hosts.
const sources = [
  { id: "GOOGLE_ADSENSE_CONTENT_UX", kind: "GOOGLE_POLICY", url: "https://support.google.com/adsense/answer/10015918?hl=en", authority: "Official Google AdSense guidance", strengths: "Unique and valuable publisher content, navigation, repeated-content, and user-experience guidance." },
  { id: "GOOGLE_PUBLISHER_POLICIES", kind: "GOOGLE_POLICY", url: "https://support.google.com/adsense/answer/10502938?hl=en", authority: "Official Google Publisher Policies", strengths: "Inventory value, replicated content, misrepresentation, and monetization restrictions." },
  { id: "GOOGLE_PUBLISHER_SEARCH_SPAM", kind: "GOOGLE_POLICY", url: "https://support.google.com/publisherpolicies/answer/11035931?hl=en", authority: "Official Google Publisher Policies", strengths: "Publisher-policy incorporation of Google Search spam policies." },
  { id: "GOOGLE_SEARCH_SPAM", kind: "GOOGLE_POLICY", url: "https://developers.google.com/search/docs/essentials/spam-policies", authority: "Official Google Search Central documentation", strengths: "Scaled-content, doorway, scraping, keyword-stuffing, and other spam-policy definitions." },
  { id: "GOOGLE_PEOPLE_FIRST", kind: "GOOGLE_POLICY", url: "https://developers.google.com/search/docs/fundamentals/creating-helpful-content", authority: "Official Google Search Central documentation", strengths: "Originality, completeness, sourcing, Who/How/Why, audience, and satisfying people-first experience." },

  { id: "TRICYCLE_BEGINNERS", kind: "BENCHMARK", url: "https://tricycle.org/beginners/", authority: "Established Buddhist educational publisher", strengths: "Beginner-oriented curriculum, editorial organization, and accessible topical breadth." },
  { id: "ATI_BEFRIENDING", kind: "BENCHMARK", url: "https://www.accesstoinsight.org/befriending.html", authority: "Established Theravada text and study archive", strengths: "Curated beginner path with direct links into translations and practice material." },
  { id: "SC_START", kind: "BENCHMARK", url: "https://suttacentral.net/start", authority: "Primary-text translation platform", strengths: "Direct canonical-text access, translation context, and structured study entry points." },
  { id: "ATI_GLOSSARY", kind: "BENCHMARK", url: "https://www.accesstoinsight.org/glossary.html", authority: "Established Theravada text and study archive", strengths: "Compact terminology definitions connected to primary-text context." },
  { id: "SC_DEFINE_DHAMMA", kind: "BENCHMARK", url: "https://suttacentral.net/define/dhamma", authority: "Primary-text translation platform", strengths: "Corpus-linked terminology evidence and contextual occurrences." },
  { id: "PALI_TEXT_SOCIETY", kind: "BENCHMARK", url: "https://palitextsociety.org/", authority: "Established Pali scholarship organization", strengths: "Scholarly language, edition, dictionary, and translation context." },

  { id: "SC_SN56_11", kind: "BENCHMARK", url: "https://suttacentral.net/sn56.11/en/sujato", authority: "Primary Buddhist text translation", strengths: "Primary discourse context for the Four Noble Truths." },
  { id: "ATI_SN56_11", kind: "BENCHMARK", url: "https://www.accesstoinsight.org/tipitaka/sn/sn56/sn56.011.than.html", authority: "Recognized Buddhist text translation archive", strengths: "Primary discourse translation with editorial notes." },
  { id: "SC_SN45_8", kind: "BENCHMARK", url: "https://suttacentral.net/sn45.8/en/sujato", authority: "Primary Buddhist text translation", strengths: "Primary definition of the Noble Eightfold Path factors." },
  { id: "ATI_SN45_8", kind: "BENCHMARK", url: "https://www.accesstoinsight.org/tipitaka/sn/sn45/sn45.008.than.html", authority: "Recognized Buddhist text translation archive", strengths: "Primary Path-factor translation and explanatory framing." },
  { id: "DHAMMA_SN45_8", kind: "BENCHMARK", url: "https://www.dhammatalks.org/suttas/SN/SN45_8.html", authority: "Recognized monastic translation resource", strengths: "Independent translation of the Eightfold Path discourse." },

  { id: "SC_MN10", kind: "BENCHMARK", url: "https://suttacentral.net/mn10/en/sujato", authority: "Primary Buddhist text translation", strengths: "Primary mindfulness-framework discourse." },
  { id: "ATI_DN22", kind: "BENCHMARK", url: "https://www.accesstoinsight.org/tipitaka/dn/dn.22.0.than.html", authority: "Recognized Buddhist text translation archive", strengths: "Detailed primary mindfulness discourse and practice context." },
  { id: "NHS_MINDFULNESS", kind: "BENCHMARK", url: "https://www.nhs.uk/mental-health/self-help/tips-and-support/mindfulness/", authority: "UK National Health Service", strengths: "Accessible secular mindfulness guidance and health-context boundaries." },
  { id: "SC_MN118", kind: "BENCHMARK", url: "https://suttacentral.net/mn118/en/sujato", authority: "Primary Buddhist text translation", strengths: "Primary mindfulness-of-breathing discourse." },
  { id: "ATI_MN118", kind: "BENCHMARK", url: "https://www.accesstoinsight.org/tipitaka/mn/mn.118.than.html", authority: "Recognized Buddhist text translation archive", strengths: "Independent translation and practice context for breath meditation." },
  { id: "NCCIH_MEDITATION", kind: "BENCHMARK", url: "https://www.nccih.nih.gov/health/meditation-and-mindfulness-effectiveness-and-safety", authority: "US National Center for Complementary and Integrative Health", strengths: "Evidence and safety context for meditation and mindfulness claims." },

  { id: "SC_SNP1_8", kind: "BENCHMARK", url: "https://suttacentral.net/snp1.8/en/sujato", authority: "Primary Buddhist text translation", strengths: "Primary Metta Sutta translation." },
  { id: "ATI_SNP1_8", kind: "BENCHMARK", url: "https://www.accesstoinsight.org/tipitaka/kn/snp/snp.1.08.than.html", authority: "Recognized Buddhist text translation archive", strengths: "Independent Metta Sutta translation and context." },
  { id: "DHAMMA_KHP5", kind: "BENCHMARK", url: "https://www.dhammatalks.org/suttas/KN/Khp/khp5.html", authority: "Recognized monastic translation resource", strengths: "Primary loving-kindness text in an independent translation." },

  { id: "SC_DHAMMAPADA", kind: "BENCHMARK", url: "https://suttacentral.net/dhp1-20/en/sujato", authority: "Primary Buddhist text translation", strengths: "Primary Dhammapada verse translation with source context." },
  { id: "ATI_DHAMMAPADA", kind: "BENCHMARK", url: "https://www.accesstoinsight.org/tipitaka/kn/dhp/dhp.01.budd.html", authority: "Recognized Buddhist text translation archive", strengths: "Independent Dhammapada translation." },
  { id: "SC_DHAMMAPADA_INTRO", kind: "BENCHMARK", url: "https://suttacentral.net/edition/dhp/en/sujato/introduction", authority: "Primary-text translation platform", strengths: "Translation-method and textual-context introduction." },

  { id: "SC_AN6_63", kind: "BENCHMARK", url: "https://suttacentral.net/an6.63/en/sujato", authority: "Primary Buddhist text translation", strengths: "Primary discourse context for intention and kamma." },
  { id: "ATI_AN3_65", kind: "BENCHMARK", url: "https://www.accesstoinsight.org/tipitaka/an/an03/an03.065.than.html", authority: "Recognized Buddhist text translation archive", strengths: "Primary Kalama Sutta translation and epistemic context." },
  { id: "ATI_FIVE_PRECEPTS", kind: "BENCHMARK", url: "https://www.accesstoinsight.org/ptf/dhamma/sila/pancasila.html", authority: "Established Theravada study archive", strengths: "Precept definitions with links to canonical context." },
  { id: "ATI_RIGHT_LIVELIHOOD", kind: "BENCHMARK", url: "https://www.accesstoinsight.org/ptf/dhamma/sacca/sacca4/samma-ajivo/index.html", authority: "Established Theravada study archive", strengths: "Focused canonical/contextual treatment of right livelihood." },
  { id: "ATI_RIGHT_SPEECH", kind: "BENCHMARK", url: "https://www.accesstoinsight.org/ptf/dhamma/sacca/sacca4/samma-vaca/index.html", authority: "Established Theravada study archive", strengths: "Focused canonical/contextual treatment of right speech." },

  { id: "SC_SN22_59", kind: "BENCHMARK", url: "https://suttacentral.net/sn22.59/en/sujato", authority: "Primary Buddhist text translation", strengths: "Primary discourse on not-self and the aggregates." },
  { id: "ATI_SN22_59", kind: "BENCHMARK", url: "https://www.accesstoinsight.org/tipitaka/sn/sn22/sn22.059.than.html", authority: "Recognized Buddhist text translation archive", strengths: "Independent not-self discourse translation." },
  { id: "ATI_DEPENDENT_ORIGINATION", kind: "BENCHMARK", url: "https://www.accesstoinsight.org/tipitaka/sn/sn12/sn12.002.than.html", authority: "Recognized Buddhist text translation archive", strengths: "Primary dependent-origination discourse translation." },

  { id: "ATI_SUTTA_GUIDE", kind: "BENCHMARK", url: "https://www.accesstoinsight.org/tipitaka/sutta.html", authority: "Established Theravada text and study archive", strengths: "Structured guide to the Sutta Pitaka and its collections." },
  { id: "SC_INTRODUCTION", kind: "BENCHMARK", url: "https://suttacentral.net/introduction", authority: "Primary-text translation platform", strengths: "Text collection, translation, and navigation context." },
  { id: "EIGHTY_FOUR_THOUSAND", kind: "BENCHMARK", url: "https://84000.co/", authority: "Nonprofit Buddhist translation initiative", strengths: "Scholarly translation project context and primary-text access." },

  { id: "ATI_PATIENCE", kind: "BENCHMARK", url: "https://www.accesstoinsight.org/lib/authors/nyanaponika/wheel006.html", authority: "Established Theravada study archive", strengths: "Long-form doctrinal and practical treatment from a recognized author archive." },
  { id: "DHAMMA_AN4_28", kind: "BENCHMARK", url: "https://www.dhammatalks.org/suttas/AN/AN4_28.html", authority: "Recognized monastic translation resource", strengths: "Primary discourse translation useful for comparative doctrinal context." },
  { id: "LIONS_ROAR", kind: "BENCHMARK", url: "https://www.lionsroar.com/", authority: "Established Buddhist editorial publication", strengths: "Contemporary Buddhist teaching, editorial curation, and audience-oriented application." }
];

const stripTags = (html) => html
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/&nbsp;/gi, " ")
  .replace(/&amp;/gi, "&")
  .replace(/&quot;/gi, '"')
  .replace(/&#39;|&apos;/gi, "'")
  .replace(/\s+/g, " ")
  .trim();

const extractTitle = (html) => stripTags(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "").slice(0, 240);
const extractDescription = (html) => {
  const match = html.match(/<meta[^>]+(?:name|property)=["'](?:description|og:description)["'][^>]+content=["']([^"']*)["']/i)
    ?? html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+(?:name|property)=["'](?:description|og:description)["']/i);
  return stripTags(match?.[1] ?? "").slice(0, 500);
};

const fetchSource = async (source) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  const started = Date.now();
  try {
    const response = await fetch(source.url, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "EchoBuddha-Private-Audit/1.0 (+https://echobuddha.com/)" }
    });
    const html = await response.text();
    return {
      ...source,
      http_status: response.status,
      accessible: response.ok,
      final_url: response.url,
      title: extractTitle(html),
      description: extractDescription(html),
      response_bytes: Buffer.byteLength(html),
      response_sha256: crypto.createHash("sha256").update(html).digest("hex"),
      elapsed_ms: Date.now() - started,
      error: ""
    };
  } catch (error) {
    return {
      ...source,
      http_status: 0,
      accessible: false,
      final_url: source.url,
      title: "",
      description: "",
      response_bytes: 0,
      response_sha256: "",
      elapsed_ms: Date.now() - started,
      error: error?.name === "AbortError" ? "TIMEOUT" : "FETCH_FAILED"
    };
  } finally {
    clearTimeout(timer);
  }
};

const captured = [];
for (const source of sources) {
  captured.push(await fetchSource(source));
}

const snapshot = {
  schema_version: 1,
  captured_at: new Date().toISOString(),
  method: "Direct GET of public policy/benchmark URLs; status, metadata, size, and SHA-256 only. Full third-party content is not retained.",
  privacy: "No private repository content or internal evidence was transmitted.",
  source_count: captured.length,
  accessible_count: captured.filter((row) => row.accessible).length,
  google_policy_accessible_count: captured.filter((row) => row.kind === "GOOGLE_POLICY" && row.accessible).length,
  sources: captured
};

fs.writeFileSync(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(JSON.stringify({ output: outputPath, source_count: snapshot.source_count, accessible_count: snapshot.accessible_count, google_policy_accessible_count: snapshot.google_policy_accessible_count }, null, 2));

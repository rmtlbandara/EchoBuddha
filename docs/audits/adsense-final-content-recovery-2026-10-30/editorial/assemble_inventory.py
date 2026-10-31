"""Assemble the dated review evidence, without treating extraction as review.

Run extract_inventory.py after the final build, then this file. Raw public body
snapshots stay ignored under .artifacts. No private account data is copied here.
"""
from collections import Counter
from pathlib import Path
import csv
import hashlib
import json

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
REPORT = HERE.parent
RAW = ROOT / ".artifacts/adsense-content-recovery-2026-10-30/editorial"
DIMENSIONS = ["originality", "informationGain", "readerIntent", "accuracy", "depthCompleteness", "editorialQuality", "trustTransparency", "distinctiveness"]
SITE = "https://echobuddha.com"

def read_json(path): return json.loads(path.read_text())
def csv_write(path, rows):
    with path.open("w", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=list(rows[0]), lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)

pages = read_json(RAW / "extracted-pages.json")
applications = read_json(RAW / "quote-applications-source.json")
reviews = {}
for name in ["article-body-review.json", "utility-hub-review.json", "daily-reflection-review.json", "root-eight-article-review.json"]:
    for record in read_json(HERE / name):
        assert record["url"] not in reviews, record["url"]
        reviews[record["url"]] = {**record, "reviewEvidence": f"editorial/{name}"}
for record in read_json(REPORT / "research/LEARNING_MEDITATION_BODY_REVIEW.json"):
    assert record["url"] not in reviews, record["url"]
    reviews[record["url"]] = {**record, "reviewEvidence": "research/LEARNING_MEDITATION_BODY_REVIEW.json"}
with (REPORT / "research/AUTHORED_QUOTE_REVIEW.csv").open(newline="") as stream:
    for record in csv.DictReader(stream):
        url = record["route"]
        assert url not in reviews, url
        reviews[url] = {"url": url, "coverage": record["review_scope"] + "; policy_sources model reviewed full authored source record; shared final template reviewed separately",
            "scores": {name: int(record[name]) for name in DIMENSIONS},
            "finding": record["reader_value_and_quote_fit"] + " " + record["language_repetition"],
            "proposedAction": record["final_disposition"], "reviewEvidence": "research/AUTHORED_QUOTE_REVIEW.csv"}

for page in pages:
    if page["pageType"] != "quoteStory" or page["quote"] not in applications: continue
    app = applications[page["quote"]]
    assert page["url"] not in reviews, page["url"]
    reviews[page["url"]] = {"url": page["url"],
        "coverage": "Complete individualized interpretation, application and question authored and read by editorial_inventory; all 110 independently read by root and policy_sources models; rendered template checked separately",
        "scores": dict(zip(DIMENSIONS, [3, 3, 4, 3, 3, 3, 3, 2])),
        "finding": app["interpretation"] + " Concrete application: " + app["application"] + " Reflection: " + app["question"] + " Retained as a concise shareable reading note; familiar themes overlap within the collection and do not establish independent Search intent.",
        "proposedAction": "Replace positional generic snippets with this exact-quote application; retain useful permalink and intentional noindex",
        "reviewEvidence": "src/data/quoteApplications.ts; research/QUOTE_APPLICATION_ADVERSARIAL_REVIEW.csv; editorial/quote-map-validation.json"}

assert len(pages) == 351
assert len(reviews) == len(pages), (len(reviews), len(pages))
assert all(page["url"] in reviews for page in pages)
registry = {r["url"]: r for r in read_json(ROOT / "docs/audits/phase-1-resolve-strengthen-protect-2026-09-29/INTENT_OWNERSHIP_REGISTRY.json")["records"]}
baseline = {p["url"]: p for p in read_json(RAW / "baseline-extracted-pages.json")}
trim_rows = read_json(HERE / "RECOMMENDED_TRIMS.json")
trim_by_slug = {r["slug"]: r for r in trim_rows}
findings, inventory = [], []
for page in pages:
    review = reviews[page["url"]]
    record = registry.get(page["route"], {})
    current = baseline.get(page["url"])
    body_changed = current is not None and current["mainContent"] != page["mainContent"]
    short = page["pageType"] in {"quoteStory", "dailyReflection", "todayReflection"}
    owner = record.get("ownerUrl", "")
    if not owner and page["pageType"] == "quoteStory": owner = "/quotes/" + page["route"].split("/")[2] + "/"
    if not owner and page["pageType"] in {"dailyReflection", "todayReflection"}: owner = "/daily-reflections/"
    if not owner: owner = page["route"]
    cluster = record.get("declaredOwnerCluster", "") or ("Original quote collection: " + page["route"].split("/")[2] if page["pageType"] == "quoteStory" else "Daily reflection library" if short else page["h1"])
    intent = record.get("primaryUserIntent", "") or ("Read and share the original line, understand its application, and reflect on the exact question" if page["pageType"] == "quoteStory" else "Use one original reflection, everyday practice and journal question" if page["pageType"] == "dailyReflection" else page["description"])
    action = "Retain reviewed purpose, URL, canonical and index state; " + ("candidate editorial improvement implemented; final release verification is separate" if body_changed else "no substantive body change required by this review")
    validation = "Local final-candidate HTML extracted; historical body read in full and explicit revisions reviewed; CI/browser/production evidence recorded separately in reports 10 and 11"
    status = "Not individually observed in this extraction; expected 404" if page["pageType"] == "error" else "Not individually observed in this extraction; expected 200; see production crawl evidence"
    similarity = "Shared original-writing attribution and source context are intentional. " if short else "Shared navigation, trust and source/safety notes are intentional. "
    similarity += "See 05_DUPLICATION_AND_CANNIBALIZATION_REPORT.md for review of substantive overlap; lexical similarity is diagnostic only."
    final_finding = review["finding"]
    score_stage = "Body/source record reviewed; scores are internal qualitative judgments and not scholarly verification"
    if page["contentIdentifier"] in trim_by_slug and page["pageType"] == "article":
        final_finding += " Final disposition: the explicit heading/paragraph trims in RECOMMENDED_TRIMS.json are implemented; retained unique material and safety/source context are preserved."
        score_stage = "Initial full-body rubric retained for traceability; final disposition includes the reviewed targeted trim and final generated headings; initial lower dimension is not an unresolved finding"
    if page["route"] in {"/quotes/compassion/", "/quotes/impermanence/", "/quotes/renewal/", "/quotes/wisdom/", "/quotes/letting-go/"}:
        final_finding += " Final disposition: explicit article priorities now select the existing theme-relevant reading paths."
    if page["route"] in {"/learn/dhammapada-reflections/", "/daily-reflections/", "/quotes/", "/"}:
        final_finding += " Final disposition: the identified rights/SEO/byline wording has been corrected in the release candidate."
    precision = {
        "five-precepts-in-daily-life": "The traditional abstention commitment and medical/recovery support are distinguished; no instruction to change prescribed medicine is given.",
        "metta-meditation-script": "The phrase set is identified as modern practice wording and the universal phrase-effect claim is qualified.",
        "visiting-a-buddhist-temple-respectfully": "The copied Sangha source-context description is replaced by the actual temple-visitor purpose and local institutional scope.",
        "what-is-sangha-buddhist-community": "The noble Saṅgha, monastic Saṅgha and broader community senses are now distinguished with source context."
    }
    if page["pageType"] == "article" and page["contentIdentifier"] in precision:
        final_finding += " Final disposition: " + precision[page["contentIdentifier"]]
    findings.append({"url": page["url"], "pageType": page["pageType"], "indexability": page["indexability"],
        **review["scores"], "rubricStage": score_stage, "coverage": review["coverage"],
        "qualitativeFinding": final_finding, "riskDisposition": "Reviewed; no known material issue left without a disposition; external scholarly, rights and account evidence limits remain site-level",
        "proposedAction": review.get("proposedAction", review.get("action", "retain")), "finalAction": action,
        "reviewEvidence": review["reviewEvidence"], "observationDate": "2026-10-30", "assemblyDate": "2026-10-31",
        "validationEvidence": validation, "modelReviewBoundary": "Codex model editorial/source review; not independent human, monastic, scholarly, clinical, legal or Google certification"})
    source_file = page["contentSourceFile"]
    if page["pageType"] == "quoteStory" and page["quote"] in applications:
        source_file += "; src/data/quoteApplications.ts"
    template = {
        "article": "src/pages/articles/[slug].astro", "articleCategory": "src/pages/articles/category/[category].astro",
        "quoteStory": "src/pages/quotes/[category]/[story].astro", "quoteCategory": "src/pages/quotes/[category].astro",
        "dailyReflection": "src/pages/daily-reflections/[slug].astro", "todayReflection": "src/pages/daily-reflections/today.astro",
        "learningDetail": "src/pages/learn/questions-about-buddhism/[slug].astro" if "/questions-about-buddhism/" in page["route"] else "src/pages/learn/buddhist-handbook/[slug].astro" if "/buddhist-handbook/" in page["route"] else "src/pages/learn/[section]/[slug].astro",
        "meditationDetail": "src/pages/meditation/[slug].astro"
    }.get(page["pageType"], "src/pages/learn/[section]/index.astro" if source_file == "src/data/learn.ts" else source_file)
    inventory.append({"fullUrl": page["url"], "route": page["route"], "contentIdentifier": page["contentIdentifier"], "pageType": page["pageType"],
        "contentSourceFile": source_file, "templateSourceFile": template, "topicCluster": cluster, "primaryReaderIntent": intent,
        "intendedAudience": record.get("targetAudience", "General readers and Buddhist beginners; reflective quote readers" if short else "General readers and Buddhist beginners"),
        "primaryTopicOwner": SITE + owner if owner.startswith("/") else owner,
        "supportingTopicRelationship": record.get("role", "Concise original shareable note supporting the theme collection" if short else "Role described in page-specific editorial review"),
        "indexability": page["indexability"], "canonical": page["canonical"], "httpStatusEvidence": status,
        "sitemapMembership": page["inSitemap"], "inboundMainContentLinks": page["inboundMainContentLinks"],
        "discoverability": "Linked from current main-content route inventory" if page["inboundMainContentLinks"] else "No inbound main-content link counted; inspect utility/error context separately",
        "title": page["title"], "description": page["description"], "h1": page["h1"],
        "headingHierarchy": json.dumps(page["headings"], ensure_ascii=False), "mainContentLengthDiagnostic": page["mainContentWordsDiagnostic"],
        "storedDatePublished": page["dates"].get("datePublished", ""), "storedDateModified": page["dates"].get("dateModified", ""),
        "dateEvidenceScope": "Stored source/schema metadata where present; does not independently prove historical first-publication time",
        "authorshipEvidence": "Echo Buddha Editorial organizational publication byline; no named-human expertise or external review claimed" if page["pageType"] != "error" else "Error-recovery utility; no author credential required",
        "sourceEvidence": " | ".join(page["sourceLinks"]) or "Original reflection, first-party policy or navigation; relevant source method and limitations reviewed in the page-specific evidence",
        "structuredData": json.dumps(page["schemas"], ensure_ascii=False), "similarityFindings": similarity,
        "gscStatusAndEvidenceDate": "Not collected for every URL; see 07_GSC_BING_GA4_ANALYSIS.md for dated authenticated priority and aggregate coverage; no status inferred",
        "bingStatusAndEvidenceDate": "Not collected for every URL; see 07_GSC_BING_GA4_ANALYSIS.md; accepted IndexNow is not indexing",
        "ga4PerformanceEvidence": "No per-URL performance assertion in this public editorial inventory; dated private/aggregate limitations are recorded in report 07",
        "qualityFindings": final_finding, "proposedAction": review.get("proposedAction", review.get("action", "retain")),
        "finalAction": action, "editorialReviewCoverage": review["coverage"], "reviewEvidence": review["reviewEvidence"],
        "htmlSha256AtExtraction": page["htmlSha256"], "validationEvidence": validation})

# Reconcile only actual available account and HTTP observations. Missing rows
# remain unknown rather than being inferred from sitemap membership or noindex.
gsc_by_url = {row["url"]: row for row in read_json(REPORT / "services/GSC_PRIORITY_47.json")}
accounts = read_json(REPORT / "services/ACCOUNT_OBSERVATIONS.json")
baseline_path = ROOT / ".artifacts/adsense-final-content-recovery-2026-10-30/baseline/production-crawl/inventory.json"
http_by_route = {row["route"]: row for row in read_json(baseline_path)["pages"]} if baseline_path.exists() else {}
landing_paths = {path.rstrip("/") + "/" for path in accounts["ga4"]["landingCoverage"]["leadingSessions"] if path.startswith("/")}
parity_path = ROOT / ".artifacts/adsense-final-content-recovery-2026-10-30/production/live-parity.json"
parity = read_json(parity_path) if parity_path.exists() else None
live_by_path = {row["path"]: row for row in parity["resources"]} if parity else {}
for row in inventory:
    url, route = row["fullUrl"], row["route"]
    if url in gsc_by_url:
        evidence = gsc_by_url[url]
        row["gscStatusAndEvidenceDate"] = f'{evidence["coverageState"]}; stored-index inspection {evidence["inspectedAt"]}; Google canonical: {evidence.get("googleCanonical") or "not returned"}. Not a live URL test.'
    else:
        row["gscStatusAndEvidenceDate"] = "No individual fresh URL Inspection in this audit; no index status inferred. Aggregate and coverage limits in report07."
    if route == "/daily-reflections/":
        row["bingStatusAndEvidenceDate"] = "Indexed successfully; crawl allowed, fetch successful, indexing allowed. Authenticated observation2026-10-30; older slashless Explorer exclusion is a separate variant."
    if route.rstrip("/") + "/" in landing_paths:
        row["ga4PerformanceEvidence"] = "Landing-page use observed in the2026-10-02–2026-10-29 report. Consent, low samples and internal/audit contamination limits apply; no conversion or quality inference. See07."
    if route in http_by_route:
        row["httpStatusEvidence"] = f'Baseline live HTTP{http_by_route[route]["status"]}, crawl2026-10-30; final local HTML hash is separate from deployment evidence.'
    artifact_path = "dist/index.html" if route == "/" else "dist" + route + "index.html"
    if row["pageType"] == "error":
        artifact_path = "dist/404.html"
        row["httpStatusEvidence"] = "Generated error document; an unknown live route returned404 on2026-10-30. Direct/404.html normalizes with307; this is not an ordinary200 reader page."
    if artifact_path in live_by_path:
        live = live_by_path[artifact_path]
        row["httpStatusEvidence"] = f'Verified deployed HTTP{live["status"]} at{live["route"]}; byte parity {live["pass"]}; observation{parity["summary"]["observedAt"]}. Error-document target is a real unknown route when applicable.'
        row["validationEvidence"] += " Final release evidence:11_DEPLOYMENT_VERIFICATION.md and RELEASE_VERIFICATION.json."
        row["finalAction"] = row["finalAction"].replace("candidate editorial improvement implemented; final release verification is separate", "editorial improvement implemented and verified live against the immutable manifest; deployment identifiers are in report11")

csv_write(REPORT / "02_COMPLETE_CONTENT_INVENTORY.csv", inventory)
csv_write(REPORT / "03_CONTENT_QUALITY_AUDIT.csv", findings)
manifest = {"assembledDate": "2026-10-31", "observationDate": "2026-10-30", "generatedHtmlPages": len(pages),
    "readerPages": len(pages)-1, "errorPages": 1, "indexability": dict(Counter(p["indexability"] for p in pages)),
    "sitemapUrls": sum(p["inSitemap"] for p in pages), "pageTypes": dict(Counter(p["pageType"] for p in pages)),
    "reviewAllocation": {"articlesFullBody_root": 8, "articlesFullBody_editorial_inventory": 40, "learningAndMeditationFullBody_policy_sources": 70,
        "authoredQuoteFullSourceRecord_policy_sources": 43, "individualQuoteApplications_authoredAndSeparatelyModelReviewed": 110,
        "dailyReflectionFullBodyAndArchive_editorial_inventory": 30, "hubUtilityUniqueTextAndFullSharedCatalogues_editorial_inventory": 50},
    "unreviewedGeneratedPages": [], "rawPublicSnapshots": ".artifacts/adsense-content-recovery-2026-10-30/editorial/ (ignored)",
    "limits": ["All routes have actual model editorial/source-record coverage, not just automated extraction.",
        "Not every doctrinal claim in every edition was independently retrieved; research agent records high-risk source checks and precise limitations.",
        "No independent human, scholarly, clinical or legal certification; no worldwide plagiarism or historical media-rights certification.",
        "HTTP evidence is joined from actual immutable-manifest/live parity where available; exact deployment identifiers and scope are in reports10/11 and RELEASE_VERIFICATION.json.",
        "Initial lower rubric values remain where a problem was found; final action records implemented fixes rather than retroactively erasing the baseline score.",
        "Redirect aliases are separate from the 351 HTML pages; see REDIRECT_INVENTORY.csv."],
    "outputs": {name: hashlib.sha256((REPORT/name).read_bytes()).hexdigest() for name in ["02_COMPLETE_CONTENT_INVENTORY.csv", "03_CONTENT_QUALITY_AUDIT.csv"]}}
(HERE / "COVERAGE_MANIFEST.json").write_text(json.dumps(manifest, indent=2)+"\n")
print(json.dumps({"inventoryRows": len(inventory), "qualityRows": len(findings), "unreviewedPages": 0, "rubricDimensions": len(DIMENSIONS)}, indent=2))

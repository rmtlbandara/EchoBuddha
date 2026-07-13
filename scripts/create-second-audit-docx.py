#!/usr/bin/env python3
import importlib.util
import json
import zipfile
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parents[1]
CANONICAL_PATH = ROOT / "docs" / "audits" / "articles" / "ECHOBUDDHA_CANONICAL_ARTICLE_AUDIT.json"
OUTPUT_PATH = ROOT / "docs" / "audits" / "articles" / "Echo-Buddha-Second-Article-Audit.docx"

BASE_DOCX_SCRIPT = ROOT / "scripts" / "create-audit-docx.py"
spec = importlib.util.spec_from_file_location("audit_docx_base", BASE_DOCX_SCRIPT)
base = importlib.util.module_from_spec(spec)
spec.loader.exec_module(base)


def truncate(value, max_len):
    value = "" if value is None else str(value)
    return value if len(value) <= max_len else value[: max_len - 1].rstrip() + "..."


def short_url(url):
    return str(url).replace("https://echobuddha.com", "")


def p(text="", style=None):
    return base.paragraph(text, style=style)


def h(text, level=1):
    return base.heading(text, level)


def b(text):
    return base.bullet(text)


def n(text):
    return base.numbered(text)


def tbl(rows, widths, header=True):
    return base.table(rows, widths, header=header)


def callout(title, body):
    return base.callout(title, body)


def action_counts(articles):
    counts = Counter()
    for article in articles:
        for action in article["score"]["actions"]:
            counts[action] += 1
    return counts


def source_term_summary(articles):
    terms = Counter()
    frameworks = Counter()
    for article in articles:
        for term in article["sourcePlan"]["termsNeedingDefinition"]:
            terms[term] += 1
        for framework in article["sourcePlan"]["coreFrameworksRequiringSupport"]:
            frameworks[framework] += 1
    return terms, frameworks


def build_document(data):
    summary = data["summary"]
    articles = data["articles"]
    actions = action_counts(articles)
    source_terms, source_frameworks = source_term_summary(articles)
    wellbeing_articles = [a for a in articles if "Wellbeing review" in a["score"]["actions"]]

    body = []
    body.append(p("Echo Buddha Second Article Audit", style="Title"))
    body.append(p("Reconciliation, layered similarity evidence, editorial planning, source awareness, wellbeing review, and implementation readiness.", style="Subtitle"))
    body.append(p(f"Generated from canonical audit data on {data['auditGenerationTimestamp'][:10]}. Scope: {summary['articlesAudited']} article pages under /articles/."))
    body.append(callout(
        "Audit-only preservation note",
        "This report did not change article prose, URLs, hrefs, heading IDs, categories, themes, templates, layouts, or live content. It packages the second audit evidence and implementation plan only.",
    ))

    body.append(h("Executive Verdict", 1))
    body.append(p(
        "The library has a strong technical SEO foundation, but it is not ready for broad AdSense-readiness or uniqueness claims until high-overlap clusters are differentiated and repeated scaffold prose is revised."
    ))
    body.append(p(summary["readinessVerdict"]))
    body.append(p(f"Recommended first implementation batch: {summary['recommendedFirstImplementationBatch']}"))

    body.append(h("Corrected Counts", 2))
    body.append(tbl([
        ["Metric", "Final count"],
        ["Articles audited", summary["articlesAudited"]],
        ["Previous audit artifacts inspected", summary["previousAuditArtifactsInspected"]],
        ["Inconsistencies found and resolved", summary["inconsistenciesFoundAndResolved"]],
        ["Exact duplicate sentence groups", summary["finalExactDuplicateSentenceGroupCount"]],
        ["Exact duplicate paragraph groups", summary["finalExactDuplicateParagraphGroupCount"]],
        ["Near-duplicate article pairs", summary["finalNearDuplicatePairCount"]],
        ["High-overlap article pairs", summary["finalHighOverlapPairCount"]],
        ["High-overlap clusters", summary["highOverlapClusterCount"]],
        ["Substantial rewrites", summary["substantialRewriteCount"]],
        ["Targeted rewrites", summary["targetedRewriteCount"]],
        ["Light polish or no change", summary["lightPolishOrNoChangeCount"]],
        ["Source-aware reviews", summary["sourceAwareReviewCount"]],
        ["Wellbeing reviews", summary["wellbeingReviewCount"]],
    ], [6500, 2860]))

    body.append(h("Methodology", 1))
    body.append(p(
        "The second audit supersedes the first pass by separating shared renderer/interface text from main article prose and by weighting role-specific evidence instead of treating all semantic relationship as duplication."
    ))
    body.append(tbl([
        ["Layer", "Evidence captured"],
        ["Metadata", "Title, SEO title, meta description, canonical, image, structured data, author, dates."],
        ["Article prose", "Introduction, main sections, examples, exercises, reflection prompts, conclusion, FAQs."],
        ["Structure", "Heading sequence, heading IDs, section rhythm, FAQ count, renderer-owned sidebars and notices."],
        ["Similarity", "Cosine, Jaccard, 5-gram overlap, exact sentence groups, near-duplicate paragraphs, FAQ/intro/heading similarity."],
        ["Editorial role", "Primary reader, intent, promise, format, outcome, examples, source needs, wellbeing boundary."],
        ["Preservation", "URLs, hrefs, heading IDs, category paths, canonicals, structured data baselines, link targets."],
    ], [2400, 6960]))

    body.append(h("Reconciliation", 1))
    artifact_rows = [["Artifact", "Purpose", "Current status", "Recommendation"]]
    for item in data["previousAuditArtifacts"]:
        artifact_rows.append([
            item["file"],
            truncate(item["purpose"], 90),
            item["current"],
            truncate(item["recommendation"], 110),
        ])
    body.append(tbl(artifact_rows, [3300, 2400, 1350, 2310]))

    body.append(h("Resolved Inconsistencies", 2))
    inconsistency_rows = [["Issue", "Correct value", "Cause"]]
    for item in data["inconsistenciesResolved"]:
        inconsistency_rows.append([
            item["issue"],
            truncate(item["correctValue"], 140),
            truncate(item["cause"], 150),
        ])
    body.append(tbl(inconsistency_rows, [2500, 3860, 3000]))

    body.append(h("Highest-Risk Article Pairs", 1))
    pair_rows = [["Pair", "Overlap", "Overall", "Intro", "Heading", "FAQ", "Exact"]]
    for pair in summary["tenHighestRiskPairs"]:
        pair_rows.append([
            f"{pair['articleA']} / {pair['articleB']}",
            pair["editorialOverlap"],
            pair["overallBodySimilarity"],
            pair["introductionSimilarity"],
            pair["headingSequenceSimilarity"],
            pair["faqSimilarity"],
            pair["exactDuplicatedSentenceCount"],
        ])
    body.append(tbl(pair_rows, [3850, 1100, 880, 880, 880, 880, 890]))

    body.append(h("Cluster Risk", 1))
    cluster_rows = [["Cluster", "Severity", "Pages", "Max similarity", "Recommendation"]]
    for cluster in data["clusters"]:
        cluster_rows.append([
            cluster["name"],
            cluster["overlapSeverity"],
            "\n".join(short_url(f"/articles/{slug}/") for slug in cluster["slugs"]),
            cluster["maxOverallSimilarity"],
            truncate(cluster["recommendation"], 180),
        ])
    body.append(tbl(cluster_rows, [2050, 1100, 2650, 1250, 2310]))

    body.append(h("Duplication Findings", 1))
    body.append(p(
        "Exact paragraph duplication was not found. The repeated-language issue is concentrated in exact sentence groups, reusable practice/example scaffolding, and near-duplicate pair evidence."
    ))
    dupe_rows = [["Duplicate sentence", "Affected articles"]]
    for group in data["exactDuplication"]["exactDuplicatedSentenceGroups"]:
        dupe_rows.append([
            truncate(group["sentence"], 150),
            "\n".join(short_url(url) for url in group["affectedUrls"][:8]) + (f"\n...and {len(group['affectedUrls']) - 8} more" if len(group["affectedUrls"]) > 8 else ""),
        ])
    body.append(tbl(dupe_rows, [4800, 4560]))

    body.append(h("Human Writing Diagnostic", 1))
    body.append(p(
        "The corpus reads useful and coherent, but several articles share a portable instructional rhythm: brief reassurance, generic daily-life example, three-step practice, reflection prompt, and similar FAQ patterns. That is the primary human-writing risk."
    ))
    for item in [
        "Replace portable daily-life examples with article-specific scenes.",
        "Give each cluster sibling a visibly different opening problem, promise, and conclusion.",
        "Avoid identical practice scaffolds across meditation, patience, anger, attachment, and mindfulness pages.",
        "Keep shared renderer text out of duplication decisions and focus revisions on article-owned prose.",
    ]:
        body.append(b(item))

    body.append(h("Editorial Workload", 1))
    workload_rows = [["Action", "Articles"]]
    for key in sorted(actions):
        workload_rows.append([key, actions[key]])
    body.append(tbl(workload_rows, [6500, 2860]))

    body.append(h("Article Role Map", 2))
    role_rows = [["Article", "Cluster", "Recommendation", "Risk", "Unique promise"]]
    for article in articles:
        role_rows.append([
            article["slug"],
            article["primaryCluster"]["name"] if article.get("primaryCluster") else "Standalone",
            article["finalRecommendation"],
            article["score"]["risk"],
            truncate(article["roleSpecification"]["uniquePromise"], 160),
        ])
    body.append(tbl(role_rows, [2450, 1850, 1500, 1000, 2560]))

    body.append(h("Source Awareness", 1))
    body.append(p(
        "Every article requires source-aware review because the library teaches Buddhist concepts, meditation practices, or daily-life interpretations. The review should add support without inventing credentials, direct quotations, or named expert review."
    ))
    source_rows = [["Common term/framework need", "Articles affected"]]
    for term, count in source_terms.most_common(12):
        source_rows.append([term, count])
    for framework, count in source_frameworks.most_common(4):
        source_rows.append([truncate(framework, 85), count])
    body.append(tbl(source_rows, [6900, 2460]))

    body.append(h("Wellbeing Review", 1))
    body.append(p(
        "Seven articles need explicit wellbeing review. Two require new article-specific boundary language in a later implementation pass; five should retain and refine the existing educational/non-treatment boundary."
    ))
    wellbeing_rows = [["Article", "Matched terms", "Existing note", "Targeted caution", "Recommendation"]]
    for article in wellbeing_articles:
        findings = article["wellbeingFindings"]
        wellbeing_rows.append([
            article["slug"],
            ", ".join(findings["matchedTerms"]) or "None",
            "Yes" if findings["existingWellbeingNote"] else "No",
            "Yes" if findings["targetedCautionNeeded"] else "No",
            truncate(findings["recommendation"], 130),
        ])
    body.append(tbl(wellbeing_rows, [2400, 1750, 1100, 1250, 2860]))

    body.append(h("Preservation Map", 1))
    preservation = data["preservationMap"]
    all_hrefs = sum(len(item["hrefs"]) for item in preservation.values())
    all_heading_ids = sum(len(item["headingIds"]) for item in preservation.values())
    all_related = sum(len(item["relatedReferences"]) for item in preservation.values())
    all_hubs = sum(len(item["hubReferences"]) for item in preservation.values())
    categories = sorted({item["category"] for item in preservation.values()})
    body.append(tbl([
        ["Protected baseline", "Count / result"],
        ["Article URLs preserved", len(preservation)],
        ["Heading IDs captured", all_heading_ids],
        ["Href baselines captured", all_hrefs],
        ["Related article references captured", all_related],
        ["Learning hub references captured", all_hubs],
        ["Categories captured", ", ".join(categories)],
        ["Canonical baselines captured", len(articles)],
        ["Structured data baselines captured", len(articles)],
    ], [6500, 2860]))
    body.append(p(
        "Implementation must preserve article URLs, href destinations, heading IDs, categories, titles/H1 alignment, canonicals, and existing schema behavior unless a separate approval explicitly changes them."
    ))

    body.append(h("Implementation Priority", 1))
    body.append(n("Approve Batch 1 role decisions for Noble Eightfold Path, Four Noble Truths, Beginner Buddhism, and Impermanence."))
    body.append(n("Rewrite only article-owned prose in those clusters; preserve source records, URLs, links, heading IDs, categories, and layout behavior."))
    body.append(n("Add source-aware support notes and glossary-style definitions where the article promise depends on Buddhist doctrine or meditation terminology."))
    body.append(n("Run the second-audit validator after edits to prevent metadata, link, fragment, and similarity regressions."))

    body.append(base.page_break())
    body.append(h("Appendix: Generated Audit Files", 1))
    for file_path in [
        "docs/audits/articles/ECHOBUDDHA_AUDIT_RECONCILIATION.md",
        "docs/audits/articles/ECHOBUDDHA_CANONICAL_ARTICLE_AUDIT.json",
        "docs/audits/articles/ECHOBUDDHA_PAIRWISE_SIMILARITY_MATRIX.csv",
        "docs/audits/articles/ECHOBUDDHA_EXACT_DUPLICATION_REPORT.md",
        "docs/audits/articles/ECHOBUDDHA_HUMAN_WRITING_DIAGNOSTIC.md",
        "docs/audits/articles/ECHOBUDDHA_ARTICLE_ROLE_MAP.md",
        "docs/audits/articles/ECHOBUDDHA_CLUSTER_DIFFERENTIATION_PLAN.md",
        "docs/audits/articles/ECHOBUDDHA_ARTICLE_EDITORIAL_SPECIFICATIONS.md",
        "docs/audits/articles/ECHOBUDDHA_SOURCE_AWARENESS_PLAN.md",
        "docs/audits/articles/ECHOBUDDHA_WELLBEING_CONTENT_REVIEW.md",
        "docs/audits/articles/ECHOBUDDHA_INTERNAL_LINK_PRESERVATION_MAP.json",
        "docs/audits/articles/ECHOBUDDHA_IMPLEMENTATION_PRIORITY_MATRIX.csv",
        "docs/audits/articles/ECHOBUDDHA_SECOND_AUDIT_FINAL_REPORT.md",
        "docs/audits/articles/Echo-Buddha-Second-Article-Audit.docx",
    ]:
        body.append(b(file_path))

    body.append(h("Appendix: Validation Commands", 1))
    for command in [
        "node scripts/generate-second-article-audit.mjs",
        "node scripts/validate-second-article-audit.mjs",
        "npm install",
        "npm run build",
    ]:
        body.append(b(command))
    body.append(p("The package-lock metadata churn from npm install was restored after validation because the task scope allows audit documents and scripts only."))

    sect_pr = (
        base.tag("w:headerReference", attrs={"w:type": "default", "r:id": "rIdHeader1"}, closed=True)
        + base.tag("w:footerReference", attrs={"w:type": "default", "r:id": "rIdFooter1"}, closed=True)
        + base.tag("w:pgSz", attrs={"w:w": 12240, "w:h": 15840}, closed=True)
        + base.tag("w:pgMar", attrs={"w:top": 1440, "w:right": 1440, "w:bottom": 1440, "w:left": 1440, "w:header": 708, "w:footer": 708, "w:gutter": 0}, closed=True)
        + base.tag("w:cols", attrs={"w:space": 720}, closed=True)
        + base.tag("w:docGrid", attrs={"w:linePitch": 360}, closed=True)
    )
    body.append(base.tag("w:sectPr", sect_pr))
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        + '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" '
        + 'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
        + base.tag("w:body", "".join(body))
        + "</w:document>"
    )


def core_xml():
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="{base.NS['cp']}" xmlns:dc="{base.NS['dc']}" xmlns:dcterms="{base.NS['dcterms']}" xmlns:dcmitype="{base.NS['dcmitype']}" xmlns:xsi="{base.NS['xsi']}">
  <dc:title>Echo Buddha Second Article Audit</dc:title>
  <dc:subject>Reconciliation, layered similarity evidence, editorial planning, source awareness, and implementation readiness</dc:subject>
  <dc:creator>OpenAI Codex</dc:creator>
  <cp:lastModifiedBy>OpenAI Codex</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">{now}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">{now}</dcterms:modified>
</cp:coreProperties>"""


def header_xml():
    ppr = base.tag(
        "w:pPr",
        base.tag("w:pStyle", attrs={"w:val": "Header"}, closed=True)
        + base.tag("w:jc", attrs={"w:val": "right"}, closed=True)
        + base.tag("w:pBdr", base.tag("w:bottom", attrs={"w:val": "single", "w:sz": 4, "w:space": 4, "w:color": "D9E2EC"}, closed=True)),
    )
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        + '<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
        + base.tag("w:p", ppr + base.text_run("Echo Buddha Second Article Audit", color="555555", size=9))
        + "</w:hdr>"
    )


def write_docx(document_xml):
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(OUTPUT_PATH, "w", zipfile.ZIP_DEFLATED) as docx:
        docx.writestr("[Content_Types].xml", base.content_types_xml())
        docx.writestr("_rels/.rels", base.package_rels_xml())
        docx.writestr("docProps/core.xml", core_xml())
        docx.writestr("docProps/app.xml", base.app_xml())
        docx.writestr("word/document.xml", document_xml)
        docx.writestr("word/styles.xml", base.styles_xml())
        docx.writestr("word/numbering.xml", base.numbering_xml())
        docx.writestr("word/header1.xml", header_xml())
        docx.writestr("word/footer1.xml", base.footer_xml())
        docx.writestr("word/_rels/document.xml.rels", base.document_rels_xml())


def main():
    data = json.loads(CANONICAL_PATH.read_text())
    write_docx(build_document(data))
    print(f"Wrote {OUTPUT_PATH.relative_to(ROOT)}")


if __name__ == "__main__":
    main()

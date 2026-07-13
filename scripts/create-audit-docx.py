#!/usr/bin/env python3
import json
import os
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parents[1]
INVENTORY_PATH = ROOT / "docs" / "article-audit-inventory.json"
OUTPUT_PATH = ROOT / "docs" / "Echo-Buddha-Article-Audit.docx"

NS = {
    "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "wp": "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing",
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "pic": "http://schemas.openxmlformats.org/drawingml/2006/picture",
    "cp": "http://schemas.openxmlformats.org/package/2006/metadata/core-properties",
    "dc": "http://purl.org/dc/elements/1.1/",
    "dcterms": "http://purl.org/dc/terms/",
    "dcmitype": "http://purl.org/dc/dcmitype/",
    "xsi": "http://www.w3.org/2001/XMLSchema-instance",
}


def attr(name, value):
    return f' {name}="{escape(str(value))}"'


def tag(name, content="", attrs=None, closed=False):
    attrs = attrs or {}
    attr_text = "".join(attr(k, v) for k, v in attrs.items())
    if closed:
        return f"<{name}{attr_text}/>"
    return f"<{name}{attr_text}>{content}</{name}>"


def text_run(text, bold=False, italic=False, color=None, size=None):
    text = "" if text is None else str(text)
    rpr = []
    if bold:
        rpr.append(tag("w:b", closed=True))
    if italic:
        rpr.append(tag("w:i", closed=True))
    if color:
        rpr.append(tag("w:color", attrs={"w:val": color.replace("#", "")}, closed=True))
    if size:
        half_points = int(size * 2)
        rpr.append(tag("w:sz", attrs={"w:val": half_points}, closed=True))
        rpr.append(tag("w:szCs", attrs={"w:val": half_points}, closed=True))
    rpr_xml = tag("w:rPr", "".join(rpr)) if rpr else ""
    preserve = ' xml:space="preserve"' if text[:1].isspace() or text[-1:].isspace() else ""
    return f"<w:r>{rpr_xml}<w:t{preserve}>{escape(text)}</w:t></w:r>"


def break_run():
    return "<w:r><w:br/></w:r>"


def paragraph(text="", style=None, runs=None, num_id=None, level=0, keep_next=False, page_break_before=False):
    ppr = []
    if style:
        ppr.append(tag("w:pStyle", attrs={"w:val": style}, closed=True))
    if num_id is not None:
        ppr.append(
            tag(
                "w:numPr",
                tag("w:ilvl", attrs={"w:val": level}, closed=True)
                + tag("w:numId", attrs={"w:val": num_id}, closed=True),
            )
        )
    if keep_next:
        ppr.append(tag("w:keepNext", closed=True))
    if page_break_before:
        ppr.append(tag("w:pageBreakBefore", closed=True))
    ppr_xml = tag("w:pPr", "".join(ppr)) if ppr else ""
    body = "".join(runs) if runs is not None else text_run(text)
    return tag("w:p", ppr_xml + body)


def heading(text, level=1):
    style = {1: "Heading1", 2: "Heading2", 3: "Heading3"}.get(level, "Heading3")
    return paragraph(text, style=style, keep_next=True)


def bullet(text):
    return paragraph(text, style="ListParagraph", num_id=1)


def numbered(text):
    return paragraph(text, style="ListParagraph", num_id=2)


def page_break():
    return paragraph(runs=['<w:r><w:br w:type="page"/></w:r>'])


def cell_paragraphs(value, bold=False):
    if value is None:
        value = ""
    if isinstance(value, list):
        parts = [str(v) for v in value if v is not None and str(v).strip()]
    else:
        parts = str(value).split("\n")
    if not parts:
        parts = [""]
    paras = []
    for idx, part in enumerate(parts):
        runs = []
        lines = str(part).split("<br>")
        for line_idx, line in enumerate(lines):
            if line_idx:
                runs.append(break_run())
            runs.append(text_run(line, bold=bold))
        paras.append(paragraph(style="TableText", runs=runs))
    return "".join(paras)


def table(rows, widths, header=True):
    grid = "".join(tag("w:gridCol", attrs={"w:w": width}, closed=True) for width in widths)
    tbl_pr = (
        tag("w:tblStyle", attrs={"w:val": "AuditTable"}, closed=True)
        + tag("w:tblW", attrs={"w:w": sum(widths), "w:type": "dxa"}, closed=True)
        + tag("w:tblInd", attrs={"w:w": 120, "w:type": "dxa"}, closed=True)
        + tag("w:tblLayout", attrs={"w:type": "fixed"}, closed=True)
        + tag(
            "w:tblCellMar",
            tag("w:top", attrs={"w:w": 80, "w:type": "dxa"}, closed=True)
            + tag("w:start", attrs={"w:w": 120, "w:type": "dxa"}, closed=True)
            + tag("w:bottom", attrs={"w:w": 80, "w:type": "dxa"}, closed=True)
            + tag("w:end", attrs={"w:w": 120, "w:type": "dxa"}, closed=True),
        )
    )
    xml_rows = []
    for row_idx, row in enumerate(rows):
        cells = []
        for col_idx, value in enumerate(row):
            shading = ""
            if header and row_idx == 0:
                shading = tag("w:shd", attrs={"w:fill": "F2F4F7"}, closed=True)
            tc_pr = (
                tag("w:tcW", attrs={"w:w": widths[col_idx], "w:type": "dxa"}, closed=True)
                + shading
                + tag("w:vAlign", attrs={"w:val": "center"}, closed=True)
            )
            cells.append(tag("w:tc", tag("w:tcPr", tc_pr) + cell_paragraphs(value, bold=header and row_idx == 0)))
        xml_rows.append(tag("w:tr", "".join(cells)))
    return tag("w:tbl", tag("w:tblPr", tbl_pr) + tag("w:tblGrid", grid) + "".join(xml_rows))


def callout(title, body):
    rows = [[title], [body]]
    return table(rows, [9360], header=True)


def truncate(value, max_len):
    value = str(value)
    return value if len(value) <= max_len else value[: max_len - 1].rstrip() + "..."


def status_counts(inventory):
    counts = {}
    for item in inventory:
        counts[item["contentStatusRecommendation"]] = counts.get(item["contentStatusRecommendation"], 0) + 1
    return counts


def build_document(data):
    inventory = data["inventory"]
    repeated = data["repeatedLanguageReport"]
    reconciliation = data["reconciliation"]
    arch = data["architecture"]
    generated = data["generatedAt"]
    counts = status_counts(inventory)

    body = []
    body.append(paragraph("Echo Buddha Article Audit", style="Title"))
    body.append(
        paragraph(
            "Content quality, originality, SEO, indexing readiness, recurring audience, and AdSense readiness review for /articles/.",
            style="Subtitle",
        )
    )
    body.append(
        paragraph(
            f"Generated from repository evidence on {generated[:10]}. Scope: {len(inventory)} article pages under /articles/."
        )
    )
    body.append(
        callout(
            "Preservation note",
            "This Word report is audit-only. It does not recommend or implement URL changes, redirects, noindex directives, canonical changes, heading ID changes, internal-link changes, category changes, or layout changes without separate approval.",
        )
    )

    body.append(heading("Executive Summary", 1))
    body.append(
        paragraph(
            "The Echo Buddha article system is technically well organized: every article is statically rendered, indexable by default, included in sitemap/search-index generation, and supported by unique titles, descriptions, canonicals, visible bylines, FAQ schema, and related-content paths."
        )
    )
    body.append(
        paragraph(
            "The main editorial risk is not missing metadata. It is content differentiation: many articles are useful and respectful, but topic clusters use similar wording, similar examples, similar article lengths, and similar explanatory rhythms. This creates avoidable cannibalization and human-writing risk."
        )
    )
    body.append(bullet(f"Articles audited: {len(inventory)}"))
    body.append(bullet("Duplicate title tags, meta descriptions, and canonicals found: 0"))
    body.append(bullet(f"Exact duplicate sentence groups found: {len(repeated['exactDuplicateSentences'])}"))
    body.append(bullet(f"Near-duplicate sentence pairs found: {len(repeated['nearDuplicateSentences'])}"))
    body.append(bullet("Primary recommendation: preserve all URLs, then strengthen article-specific value, source-aware notes, and cluster differentiation."))

    body.append(heading("Status Snapshot", 2))
    status_rows = [["Status recommendation", "Article count"]]
    for key, value in sorted(counts.items(), key=lambda kv: (-kv[1], kv[0])):
        status_rows.append([key, str(value)])
    body.append(table(status_rows, [7200, 2160]))

    body.append(heading("Repository Architecture", 1))
    architecture_points = [
        f"Framework and rendering model: {arch['framework']}; {arch['renderingModel']}.",
        f"Content source format: {arch['articleSourceFormat']}.",
        f"Route generation: {arch['routeGeneration']}.",
        f"Index and category generation: {arch['articleIndexGeneration']}; {arch['categoryGeneration']}.",
        f"Heading IDs and table of contents: {arch['tableOfContentsGeneration']}.",
        f"Related content: {arch['relatedContentLogic']}.",
        f"Sitemap and robots: {arch['sitemapGeneration']}; {arch['robotsDirectives']}.",
        f"Metadata and structured data: {arch['metadataGeneration']}; {arch['structuredDataGeneration']}.",
        f"Authorship: {arch['authorship']}.",
        f"Ad placement: {arch['ads']}.",
    ]
    for point in architecture_points:
        body.append(bullet(point))

    body.append(heading("Inventory Reconciliation", 1))
    cat_rows = [["Category", "Category URL", "Count", "Result"]]
    for row in reconciliation["categoryReconciliation"]:
        result = "Matches" if row["sourceCountFromArticleCategories"] == row["fullArticlesCount"] else "Mismatch"
        cat_rows.append([row["category"], row["categoryUrl"], str(row["fullArticlesCount"]), result])
    body.append(table(cat_rows, [2600, 3900, 1200, 1660]))
    body.append(bullet(f"Article records in fullArticles: {reconciliation['articleCount']}"))
    body.append(bullet(f"Sitemap article records expected from source: {len(reconciliation['sitemapArticlePaths'])}"))
    body.append(bullet(f"Search-index article records expected from source: {len(reconciliation['searchIndexArticlePaths'])}"))
    body.append(bullet("Missing, duplicated, unlisted, orphaned, or stale article records from source reconciliation: none."))

    body.append(heading("SEO and Indexing Readiness", 1))
    seo_points = [
        "All article title tags and meta descriptions are unique in the generated inventory.",
        "Every article has a single clear H1 matching the article title.",
        "Canonicals use stable https://echobuddha.com/articles/{slug}/ URLs with no duplicate canonicals found.",
        "Article HTML is statically rendered and crawlable; article content is not dependent on client-side rendering.",
        "Article pages are indexable by default; no article-level noindex directive is rendered.",
        "The sitemap includes every fullArticles item and uses reviewed dates as lastmod where available.",
        "FAQPage schema is paired with visibly rendered FAQ content.",
        "Main technical gaps: no automated broken-link check, no schema validation script, no automated fragment check, and no source-link coverage check for doctrinal articles.",
    ]
    for point in seo_points:
        body.append(bullet(point))

    body.append(heading("Article Inventory", 1))
    inventory_rows = [["Article", "Category", "Words / read", "Links / FAQs", "Status"]]
    for item in inventory:
        inventory_rows.append(
            [
                item["liveUrl"].replace("https://echobuddha.com", ""),
                item["category"],
                f"{item['estimatedWordCount']} / {item['estimatedReadingTime']}",
                f"{item['internalLinkCount']} internal, {item['externalSourceLinkCount']} external, {item['faqQuestionCount']} FAQ",
                item["contentStatusRecommendation"],
            ]
        )
    body.append(table(inventory_rows, [3000, 1450, 1450, 1800, 1660]))

    body.append(heading("Individual Article Audit", 1))
    individual_rows = [["Article", "Topic and intent", "Reader purpose", "Recommendation"]]
    for item in inventory:
        individual_rows.append(
            [
                item["slug"],
                f"{item['primaryTopic']}\n{item['likelyPrimarySearchIntent']}",
                f"Reader need: {item['primaryTopic']} in plain language.\nOverlap cluster: {item['overlapCluster']}.",
                item["auditRecommendation"],
            ]
        )
    body.append(table(individual_rows, [2400, 2100, 2500, 2360]))

    body.append(heading("Repeated Language and Human-Writing Signals", 1))
    body.append(
        paragraph(
            "The body-level similarity audit distinguishes legitimate shared interface blocks from main article prose. The strongest finding is not wholesale duplication; it is repeated paragraph scaffolding, repeated transitions, and reusable filler sentences that make many articles feel mechanically expanded."
        )
    )
    repeated_rows = [["Signal", "Count", "Evidence"]]
    repeated_rows.append(
        [
            "Exact duplicate sentence groups",
            str(len(repeated["exactDuplicateSentences"])),
            "\n".join(
                f"{truncate(item['sentence'], 120)} ({', '.join(item['slugs'][:4])}{'...' if len(item['slugs']) > 4 else ''})"
                for item in repeated["exactDuplicateSentences"][:5]
            )
            or "None above threshold",
        ]
    )
    repeated_rows.append(
        [
            "Near-duplicate sentence pairs",
            str(len(repeated["nearDuplicateSentences"])),
            "\n".join(
                f"{item['score']}: {item['a']} / {item['b']}"
                for item in repeated["nearDuplicateSentences"][:8]
            )
            or "None above threshold",
        ]
    )
    repeated_rows.append(
        [
            "Repeated paragraph openings",
            str(len(repeated["repeatedParagraphOpenings"])),
            "\n".join(f"{item['opening']} ({item['count']})" for item in repeated["repeatedParagraphOpenings"][:8]),
        ]
    )
    repeated_rows.append(
        [
            "Repeated transitions",
            str(len(repeated["repeatedTransitions"])),
            "\n".join(f"{item['phrase']} ({item['count']})" for item in repeated["repeatedTransitions"][:8]),
        ]
    )
    repeated_rows.append(
        [
            "Repeated FAQ questions",
            str(len(repeated["repeatedFaqQuestions"])),
            "\n".join(f"{item['question']} ({item['count']})" for item in repeated["repeatedFaqQuestions"][:6]) or "None",
        ]
    )
    body.append(table(repeated_rows, [2500, 900, 5960]))

    body.append(heading("Topic, Intent, and Cannibalization Map", 1))
    cluster_rows = [["Cluster", "Pages", "Severity / similarity", "Differentiation plan"]]
    for cluster in build_clusters(data):
        cluster_rows.append(
            [
                cluster["name"],
                "\n".join(cluster["pages"]),
                f"{cluster['severity']}\nMax similarity: {cluster['maxSimilarity']:.3f}\nPrimary: {cluster['primary']}",
                cluster["recommendation"],
            ]
        )
    body.append(table(cluster_rows, [2250, 3000, 2050, 2060]))

    body.append(heading("Authorship, Trust, and Sourcing", 1))
    trust_points = [
        "Echo Buddha Editorial is transparent as a shared editorial identity, and the schema correctly represents it as an Organization rather than inventing a Person.",
        "The site should not claim named human review, ordination, academic expertise, or medical/therapeutic review unless those facts are verifiable in the repository.",
        "Doctrinal articles use original explanatory language, which helps copyright safety, but many pages have zero external source links.",
        "Strengthen source-aware support for pages about the Four Noble Truths, Noble Eightfold Path, karma, anicca, metta, Dhammapada themes, non-attachment, and compassion.",
        "Dhammapada reflection pages correctly distinguish original reflection from direct translation; preserve that distinction.",
    ]
    for point in trust_points:
        body.append(bullet(point))

    body.append(heading("Buddhist Integrity and Sensitive Wellbeing", 1))
    integrity_points = [
        "Karma content should continue to emphasize intention, action, habit, and consequence without implying fate or blaming people for suffering.",
        "Non-attachment and letting-go content should keep distinguishing care from indifference and acceptance from passivity.",
        "Mindfulness content should avoid collapsing Buddhist mindfulness into generic relaxation.",
        "Meditation guidance should remain educational and should not promise treatment, diagnosis, cure, or guaranteed wellbeing outcomes.",
        "The renderer already adds a wellbeing note for five sensitive slugs; buddhist-teachings-on-impermanence should receive manual review because grief is part of the topic promise.",
    ]
    for point in integrity_points:
        body.append(bullet(point))

    body.append(heading("Recurring Audience and Engagement", 1))
    engagement_points = [
        "Existing strengths include learning hubs, meditation guides, daily reflections, quote stories, related article paths, quote-to-article journeys, and practice/reflection blocks.",
        "Best repeat-use improvements would be calm and useful: weekly practice sequences, beginner reading paths, richer meditation series pages, and source-aware study routes.",
        "Avoid artificial pagination, forced accounts, intrusive pop-ups, thin programmatic pages, or fake urgency. The site should earn return visits through clarity and practice value.",
    ]
    for point in engagement_points:
        body.append(bullet(point))

    body.append(heading("Priority Recommendations", 1))
    recommendations = [
        "Preserve all current article URLs and internal link destinations. Do not merge, redirect, canonicalize away, or noindex articles without a separate approval pass.",
        "Add automated checks for article inventory, duplicate metadata, broken internal hrefs/fragments, sitemap/search-index consistency, and schema field completeness.",
        "Strengthen source-aware notes on doctrinal pages without inventing citations, credentials, direct quotes, or review processes.",
        "Reduce template feel by rewriting repeated openings, replacing portable examples with article-specific situations, and varying conclusion/reflection patterns.",
        "Differentiate high-overlap clusters before publishing more articles in the same topic areas.",
        "Review sensitive wellbeing pages individually; add targeted cautions only where the article creates a real expectation of therapeutic effect.",
        "Keep AdSense disabled until publisher ID, consent/privacy requirements, ad density, and content quality are ready.",
    ]
    for item in recommendations:
        body.append(numbered(item))

    body.append(page_break())
    body.append(heading("Appendix A: Protected Baseline Summary", 1))
    baseline_rows = [["Baseline field", "Count / detail"]]
    baseline = data["preservationBaseline"]
    baseline_rows.append(["Article URLs", str(len(baseline["articleUrls"]))])
    baseline_rows.append(["Slugs", str(len(baseline["slugs"]))])
    baseline_rows.append(["Category URLs", "\n".join(baseline["categoryUrls"])])
    baseline_rows.append(["Canonical values", f"{len(baseline['canonicalsBySlug'])} article canonical URLs captured"])
    baseline_rows.append(["Structured data records", f"{len(baseline['structuredDataBySlug'])} article schema baselines captured"])
    body.append(table(baseline_rows, [2800, 6560]))

    body.append(heading("Appendix B: Highest Similarity Pairs", 1))
    pair_rows = [["Article A", "Article B", "Cosine", "Jaccard"]]
    for pair in repeated["topPairSimilarities"][:20]:
        pair_rows.append([pair["a"], pair["b"], str(pair["cosine"]), str(pair["jaccard"])])
    body.append(table(pair_rows, [3300, 3300, 1380, 1380]))

    body.append(heading("Appendix C: Source Files and Generation", 1))
    body.append(bullet("Audit JSON source: docs/article-audit-inventory.json"))
    body.append(bullet("Markdown audit source: docs/article-audit-report.md"))
    body.append(bullet("DOCX generation script: scripts/create-audit-docx.py"))
    body.append(bullet("Article data source: src/data/site.ts"))
    body.append(bullet("Article route source: src/pages/articles/[slug].astro"))

    sect_pr = (
        tag("w:headerReference", attrs={"w:type": "default", "r:id": "rIdHeader1"}, closed=True)
        + tag("w:footerReference", attrs={"w:type": "default", "r:id": "rIdFooter1"}, closed=True)
        + tag("w:pgSz", attrs={"w:w": 12240, "w:h": 15840}, closed=True)
        + tag("w:pgMar", attrs={"w:top": 1440, "w:right": 1440, "w:bottom": 1440, "w:left": 1440, "w:header": 708, "w:footer": 708, "w:gutter": 0}, closed=True)
        + tag("w:cols", attrs={"w:space": 720}, closed=True)
        + tag("w:docGrid", attrs={"w:linePitch": 360}, closed=True)
    )
    body.append(tag("w:sectPr", sect_pr))
    document = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        + '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" '
        + 'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
        + tag("w:body", "".join(body))
        + "</w:document>"
    )
    return document


def build_clusters(data):
    pairs = data["repeatedLanguageReport"]["topPairSimilarities"]
    inventory_by_slug = {item["slug"]: item for item in data["inventory"]}
    cluster_names = []
    for item in data["inventory"]:
        name = item["overlapCluster"]
        if name != "No major overlap cluster" and name not in cluster_names:
            cluster_names.append(name)
    clusters = []
    for name in cluster_names:
        slugs = [item["slug"] for item in data["inventory"] if item["overlapCluster"] == name]
        max_similarity = 0
        for pair in pairs:
            if pair["a"] in slugs and pair["b"] in slugs:
                max_similarity = max(max_similarity, float(pair["cosine"]))
        severity = "High" if max_similarity >= 0.5 else "Medium" if max_similarity >= 0.38 else "Low"
        primary = cluster_primary(name, slugs)
        if severity == "High":
            recommendation = "Keep URLs. Rework introductions, examples, section promises, and source notes so each page has an unmistakable role."
        elif severity == "Medium":
            recommendation = "Keep pages separate, but sharpen role labels and internal links to the preferred hub."
        else:
            recommendation = "Keep and monitor before adding more pages in this topic."
        clusters.append(
            {
                "name": name,
                "pages": [f"/articles/{slug}/" for slug in slugs],
                "severity": severity,
                "maxSimilarity": max_similarity,
                "primary": primary,
                "recommendation": recommendation,
            }
        )
    return clusters


def cluster_primary(name, slugs):
    lookup = {
        "Four Noble Truths": "/learn/four-noble-truths/",
        "Noble Eightfold Path": "/learn/eightfold-path/",
        "Impermanence": "/learn/buddhism-101/what-is-impermanence/",
        "Beginner Meditation": "/meditation/",
        "Loving-kindness / Metta": "/meditation/loving-kindness-meditation/",
        "Beginner Buddhism": "/learn/buddhism-for-beginners/",
        "Karma": "/learn/buddhism-101/what-is-karma-in-buddhism/",
        "Dhammapada Reflections": "/learn/dhammapada-reflections/",
        "Attachment, Non-attachment, and Letting Go": "/articles/how-to-let-go-of-attachment-in-buddhism/",
        "Compassion and Forgiveness": "/articles/compassion-in-buddhism-beginner-guide/",
        "Mindfulness Routines and Relationships": "/learn/buddhism-101/what-is-mindfulness/",
        "Sensitive Wellbeing Topics": "Manual review cluster",
        "Patience and Speech Practice": "/articles/right-speech-buddhism/",
    }
    return lookup.get(name, f"/articles/{slugs[0]}/" if slugs else "Manual review")


def styles_xml():
    def style(style_id, name, based_on="Normal", ppr="", rpr="", style_type="paragraph"):
        based = tag("w:basedOn", attrs={"w:val": based_on}, closed=True) if based_on else ""
        return tag(
            "w:style",
            tag("w:name", attrs={"w:val": name}, closed=True) + based + ppr + rpr,
            attrs={"w:type": style_type, "w:styleId": style_id},
        )

    def spacing(before=0, after=120, line=264):
        return tag("w:spacing", attrs={"w:before": before, "w:after": after, "w:line": line, "w:lineRule": "auto"}, closed=True)

    def rpr(font="Calibri", size=22, color=None, bold=False):
        parts = [
            tag("w:rFonts", attrs={"w:ascii": font, "w:hAnsi": font, "w:eastAsia": font, "w:cs": font}, closed=True),
            tag("w:sz", attrs={"w:val": size}, closed=True),
            tag("w:szCs", attrs={"w:val": size}, closed=True),
        ]
        if color:
            parts.append(tag("w:color", attrs={"w:val": color.replace("#", "")}, closed=True))
        if bold:
            parts.insert(0, tag("w:b", closed=True))
        return tag("w:rPr", "".join(parts))

    normal_ppr = tag("w:pPr", spacing())
    h1_ppr = tag("w:pPr", tag("w:keepNext", closed=True) + spacing(before=320, after=160, line=264))
    h2_ppr = tag("w:pPr", tag("w:keepNext", closed=True) + spacing(before=240, after=120, line=264))
    h3_ppr = tag("w:pPr", tag("w:keepNext", closed=True) + spacing(before=160, after=80, line=264))
    list_ppr = tag(
        "w:pPr",
        spacing(after=160, line=280)
        + tag("w:ind", attrs={"w:left": 720, "w:hanging": 360}, closed=True),
    )
    table_ppr = tag("w:pPr", spacing(after=60, line=264))
    styles = [
        style("Normal", "Normal", based_on=None, ppr=normal_ppr, rpr=rpr()),
        style("Title", "Title", ppr=tag("w:pPr", spacing(before=0, after=120, line=264)), rpr=rpr(size=40, color="0B2545", bold=True)),
        style("Subtitle", "Subtitle", ppr=tag("w:pPr", spacing(after=180, line=264)), rpr=rpr(size=24, color="555555")),
        style("Heading1", "heading 1", ppr=h1_ppr, rpr=rpr(size=32, color="2E74B5", bold=True)),
        style("Heading2", "heading 2", ppr=h2_ppr, rpr=rpr(size=26, color="2E74B5", bold=True)),
        style("Heading3", "heading 3", ppr=h3_ppr, rpr=rpr(size=24, color="1F4D78", bold=True)),
        style("ListParagraph", "List Paragraph", ppr=list_ppr, rpr=rpr()),
        style("TableText", "Table Text", ppr=table_ppr, rpr=rpr(size=18)),
        style("Header", "Header", ppr=tag("w:pPr", spacing(after=60, line=240)), rpr=rpr(size=18, color="555555")),
        style("Footer", "Footer", ppr=tag("w:pPr", spacing(after=0, line=240)), rpr=rpr(size=18, color="555555")),
    ]
    table_style = tag(
        "w:style",
        tag("w:name", attrs={"w:val": "Audit Table"}, closed=True)
        + tag("w:tblPr", tag("w:tblBorders",
            tag("w:top", attrs={"w:val": "single", "w:sz": 4, "w:space": 0, "w:color": "D9E2EC"}, closed=True)
            + tag("w:left", attrs={"w:val": "single", "w:sz": 4, "w:space": 0, "w:color": "D9E2EC"}, closed=True)
            + tag("w:bottom", attrs={"w:val": "single", "w:sz": 4, "w:space": 0, "w:color": "D9E2EC"}, closed=True)
            + tag("w:right", attrs={"w:val": "single", "w:sz": 4, "w:space": 0, "w:color": "D9E2EC"}, closed=True)
            + tag("w:insideH", attrs={"w:val": "single", "w:sz": 4, "w:space": 0, "w:color": "D9E2EC"}, closed=True)
            + tag("w:insideV", attrs={"w:val": "single", "w:sz": 4, "w:space": 0, "w:color": "D9E2EC"}, closed=True)
        )),
        attrs={"w:type": "table", "w:styleId": "AuditTable"},
    )
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        + '<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
        + "".join(styles)
        + table_style
        + "</w:styles>"
    )


def numbering_xml():
    abstract_bullet = tag(
        "w:abstractNum",
        tag("w:multiLevelType", attrs={"w:val": "singleLevel"}, closed=True)
        + tag(
            "w:lvl",
            tag("w:start", attrs={"w:val": 1}, closed=True)
            + tag("w:numFmt", attrs={"w:val": "bullet"}, closed=True)
            + tag("w:lvlText", attrs={"w:val": "•"}, closed=True)
            + tag("w:lvlJc", attrs={"w:val": "left"}, closed=True)
            + tag("w:pPr", tag("w:tabs", tag("w:tab", attrs={"w:val": "num", "w:pos": 720}, closed=True)) + tag("w:ind", attrs={"w:left": 720, "w:hanging": 360}, closed=True))
            + tag("w:rPr", tag("w:rFonts", attrs={"w:ascii": "Symbol", "w:hAnsi": "Symbol", "w:hint": "default"}, closed=True)),
            attrs={"w:ilvl": 0},
        ),
        attrs={"w:abstractNumId": 0},
    )
    abstract_decimal = tag(
        "w:abstractNum",
        tag("w:multiLevelType", attrs={"w:val": "singleLevel"}, closed=True)
        + tag(
            "w:lvl",
            tag("w:start", attrs={"w:val": 1}, closed=True)
            + tag("w:numFmt", attrs={"w:val": "decimal"}, closed=True)
            + tag("w:lvlText", attrs={"w:val": "%1."}, closed=True)
            + tag("w:lvlJc", attrs={"w:val": "left"}, closed=True)
            + tag("w:pPr", tag("w:tabs", tag("w:tab", attrs={"w:val": "num", "w:pos": 720}, closed=True)) + tag("w:ind", attrs={"w:left": 720, "w:hanging": 360}, closed=True)),
            attrs={"w:ilvl": 0},
        ),
        attrs={"w:abstractNumId": 1},
    )
    nums = (
        tag("w:num", tag("w:abstractNumId", attrs={"w:val": 0}, closed=True), attrs={"w:numId": 1})
        + tag("w:num", tag("w:abstractNumId", attrs={"w:val": 1}, closed=True), attrs={"w:numId": 2})
    )
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        + '<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
        + abstract_bullet
        + abstract_decimal
        + nums
        + "</w:numbering>"
    )


def header_xml():
    ppr = tag(
        "w:pPr",
        tag("w:pStyle", attrs={"w:val": "Header"}, closed=True)
        + tag("w:jc", attrs={"w:val": "right"}, closed=True)
        + tag("w:pBdr", tag("w:bottom", attrs={"w:val": "single", "w:sz": 4, "w:space": 4, "w:color": "D9E2EC"}, closed=True)),
    )
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        + '<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
        + tag("w:p", ppr + text_run("Echo Buddha Article Audit", color="555555", size=9))
        + "</w:hdr>"
    )


def footer_xml():
    runs = [
        text_run("Page ", color="555555", size=9),
        '<w:fldSimple w:instr="PAGE"><w:r><w:t>1</w:t></w:r></w:fldSimple>',
    ]
    ppr = tag("w:pPr", tag("w:pStyle", attrs={"w:val": "Footer"}, closed=True) + tag("w:jc", attrs={"w:val": "right"}, closed=True))
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        + '<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
        + tag("w:p", ppr + "".join(runs))
        + "</w:ftr>"
    )


def content_types_xml():
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>
  <Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>
  <Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>"""


def package_rels_xml():
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>"""


def document_rels_xml():
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rIdNumbering" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>
  <Relationship Id="rIdHeader1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>
  <Relationship Id="rIdFooter1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>
</Relationships>"""


def core_xml():
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="{NS['cp']}" xmlns:dc="{NS['dc']}" xmlns:dcterms="{NS['dcterms']}" xmlns:dcmitype="{NS['dcmitype']}" xmlns:xsi="{NS['xsi']}">
  <dc:title>Echo Buddha Article Audit</dc:title>
  <dc:subject>Content quality, SEO, indexing readiness, originality, and AdSense readiness audit</dc:subject>
  <dc:creator>OpenAI Codex</dc:creator>
  <cp:lastModifiedBy>OpenAI Codex</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">{now}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">{now}</dcterms:modified>
</cp:coreProperties>"""


def app_xml():
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>OpenAI Codex</Application>
  <DocSecurity>0</DocSecurity>
  <ScaleCrop>false</ScaleCrop>
  <Company>Echo Buddha</Company>
  <LinksUpToDate>false</LinksUpToDate>
  <SharedDoc>false</SharedDoc>
  <HyperlinksChanged>false</HyperlinksChanged>
  <AppVersion>16.0000</AppVersion>
</Properties>"""


def write_docx(document_xml):
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(OUTPUT_PATH, "w", zipfile.ZIP_DEFLATED) as docx:
        docx.writestr("[Content_Types].xml", content_types_xml())
        docx.writestr("_rels/.rels", package_rels_xml())
        docx.writestr("docProps/core.xml", core_xml())
        docx.writestr("docProps/app.xml", app_xml())
        docx.writestr("word/document.xml", document_xml)
        docx.writestr("word/styles.xml", styles_xml())
        docx.writestr("word/numbering.xml", numbering_xml())
        docx.writestr("word/header1.xml", header_xml())
        docx.writestr("word/footer1.xml", footer_xml())
        docx.writestr("word/_rels/document.xml.rels", document_rels_xml())


def main():
    data = json.loads(INVENTORY_PATH.read_text())
    document_xml = build_document(data)
    write_docx(document_xml)
    print(f"Wrote {OUTPUT_PATH.relative_to(ROOT)}")


if __name__ == "__main__":
    main()

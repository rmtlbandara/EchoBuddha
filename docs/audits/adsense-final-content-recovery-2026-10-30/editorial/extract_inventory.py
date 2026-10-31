"""Read generated HTML without changing build or historical audit evidence.

This is diagnostic extraction, not an automatic editorial certification.
Run again after the final build to refresh technical fields.
"""
from collections import Counter, defaultdict
from html.parser import HTMLParser
from pathlib import Path
import csv
import hashlib
import json
import os
import re

ROOT = Path(__file__).resolve().parents[4]
OUT = Path(__file__).resolve().parent
RAW_OUT = ROOT / os.environ.get("EDITORIAL_RAW_OUT_DIR", ".artifacts/adsense-content-recovery-2026-10-30/editorial")
DIST = ROOT / "dist"
SITE = "https://echobuddha.com"
VOID = set("area base br col embed hr img input link meta param source track wbr".split())

class Node:
    def __init__(self, tag="root", attrs=()):
        self.tag, self.attrs, self.children = tag, dict(attrs), []
    def text(self):
        if self.tag in {"script", "style", "noscript"}: return ""
        return re.sub(r"\s+", " ", " ".join(x.text() if isinstance(x, Node) else x for x in self.children)).strip()
    def nodes(self):
        yield self
        for child in self.children:
            if isinstance(child, Node): yield from child.nodes()
    def find(self, tag): return next((n for n in self.nodes() if n.tag == tag), None)

class Parser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node()
        self.stack = [self.root]
    def handle_starttag(self, tag, attrs):
        n = Node(tag, attrs)
        self.stack[-1].children.append(n)
        if tag not in VOID: self.stack.append(n)
    def handle_startendtag(self, tag, attrs): self.handle_starttag(tag, attrs); self.handle_endtag(tag)
    def handle_endtag(self, tag):
        for i in range(len(self.stack)-1, 0, -1):
            if self.stack[i].tag == tag:
                self.stack = self.stack[:i]
                break
    def handle_data(self, data): self.stack[-1].children.append(data)

def route(file):
    rel = file.relative_to(DIST).as_posix()
    if rel == "index.html": return "/"
    return "/" + (rel[:-10] if rel.endswith("index.html") else rel)

def kind(r):
    p = r.strip("/").split("/")
    if r == "/404.html": return "error"
    if r == "/": return "homepage"
    if p[0] == "quotes": return "quoteStory" if len(p)==3 else "quoteCategory" if len(p)==2 else "quoteHub"
    if p[0] == "daily-reflections": return "todayReflection" if r.endswith("/today/") else "dailyReflection" if len(p)==2 else "dailyHub"
    if p[0] == "articles": return "articleCategory" if len(p)==3 else "article" if len(p)==2 else "articleHub"
    if p[0] == "learn": return "learningDetail" if len(p)==3 else "learningHub"
    if p[0] == "meditation": return "meditationDetail" if len(p)==2 else "meditationHub"
    if r == "/tools/": return "tools"
    return "trustOrUtility"

def source(r, typ):
    if typ == "error": return "src/pages/404.astro"
    if typ in {"quoteStory", "quoteCategory", "article", "articleCategory"}: return "src/data/site.ts"
    if typ in {"dailyReflection", "todayReflection"}: return "src/data/dailyReflections.ts"
    if "/learn/questions-about-buddhism/" in r and typ == "learningDetail": return "src/data/buddhistQuestions.ts"
    if "/learn/buddhist-handbook/" in r and typ == "learningDetail": return "src/data/handbook.ts"
    if typ in {"learningDetail", "meditationDetail"}: return "src/data/learn.ts"
    f = ROOT / "src/pages" / (r.strip("/") + ".astro")
    if r == "/": f = ROOT / "src/pages/index.astro"
    if f.exists(): return f.relative_to(ROOT).as_posix()
    f = ROOT / "src/pages" / r.strip("/") / "index.astro"
    if f.exists(): return f.relative_to(ROOT).as_posix()
    if typ == "learningHub": return "src/data/learn.ts"
    raise ValueError(f"Unmapped source for {r}")

pages=[]
sitemap=set(re.findall(r"<loc>(.*?)</loc>", (DIST/"sitemap.xml").read_text()))
for file in sorted(DIST.rglob("*.html")):
    parser=Parser(); parser.feed(file.read_text()); root=parser.root
    nodes=list(root.nodes()); r=route(file); typ=kind(r)
    main=root.find("main") or root
    article=next((n for n in main.nodes() if n.tag=="article" and "article-card" not in n.attrs.get("class", "")), main) if typ in {"article", "learningDetail", "meditationDetail", "quoteStory", "dailyReflection"} else main
    content=next((n for n in article.nodes() if any(c in n.attrs.get("class", "").split() for c in ["article-content", "learning-body", "story-body", "reflection-body"])), article)
    metadata={n.attrs.get("name"):n.attrs.get("content", "") for n in nodes if n.tag=="meta"}
    links=[n.attrs["href"] for n in main.nodes() if n.tag=="a" and "href" in n.attrs]
    external=[n.attrs["href"] for n in content.nodes() if n.tag=="a" and n.attrs.get("href", "").startswith("http") and not n.attrs["href"].startswith(SITE)]
    paras=[n.text() for n in content.nodes() if n.tag in {"p", "li", "blockquote"}]
    headings=[{"level":int(n.tag[1]), "text":n.text()} for n in main.nodes() if re.fullmatch("h[1-6]",n.tag)]
    schemas=[]; dates={}
    for n in nodes:
        if n.tag=="script" and n.attrs.get("type")=="application/ld+json":
            try:
                obj=json.loads("".join(x for x in n.children if isinstance(x,str)))
                for item in obj if isinstance(obj,list) else [obj]:
                    schemas.append(item.get("@type", ""))
                    for k in ("datePublished", "dateModified"):
                        if k in item: dates[k]=item[k]
            except (ValueError, AttributeError): schemas.append("invalid")
    quote=article.find("blockquote")
    words=len(re.findall(r"\b[\w’'-]+\b",content.text()))
    pages.append({"url":SITE+r,"route":r,"contentIdentifier":r.strip("/").split("/")[-1],"pageType":typ,
        "contentSourceFile":source(r,typ),"indexability":"noindex" if "noindex" in metadata.get("robots", "") else "indexable",
        "canonical":next((n.attrs.get("href", "") for n in nodes if n.tag=="link" and n.attrs.get("rel")=="canonical"),""),
        "httpStatus":"not observed; local generated HTML", "inSitemap":SITE+r in sitemap,
        "title":root.find("title").text() if root.find("title") else "", "description":metadata.get("description", ""),
        "h1":main.find("h1").text() if main.find("h1") else "", "headings":headings, "mainContentWordsDiagnostic":words,
        "dates":dates,"schemas":schemas,"quote":quote.text() if quote else "", "mainContent":content.text(),
        "paragraphs":paras,"internalLinks":[l for l in links if l.startswith("/")],"sourceLinks":external,
        "htmlSha256":hashlib.sha256(file.read_bytes()).hexdigest()})

inbound=Counter(l.split("#")[0].split("?")[0] for p in pages for l in set(p["internalLinks"]))
paragraphs=defaultdict(list)
for p in pages:
    p["inboundMainContentLinks"]=inbound[p["route"]]
    for text in set(p["paragraphs"]):
        if len(text.split())>=15: paragraphs[text].append(p["route"])
repeated=[{"paragraph":k,"pages":v,"count":len(v)} for k,v in paragraphs.items() if len(v)>1]
repeated.sort(key=lambda x:-x["count"])
OUT.mkdir(parents=True,exist_ok=True)
RAW_OUT.mkdir(parents=True,exist_ok=True)
(RAW_OUT/"extracted-pages.json").write_text(json.dumps(pages,ensure_ascii=False,indent=2)+"\n")
(RAW_OUT/"repeated-paragraphs.json").write_text(json.dumps(repeated,ensure_ascii=False,indent=2)+"\n")
summary={"build":"existing local dist; verify release identity separately", "pages":len(pages),"types":dict(Counter(p["pageType"] for p in pages)),
         "indexability":dict(Counter(p["indexability"] for p in pages)),"sitemapMembership":sum(p["inSitemap"] for p in pages),
         "repeatedParagraphGroups":len(repeated),"warning":"Extraction and repetition diagnostics do not establish source accuracy, reader usefulness or human review."}
(OUT/"extraction-summary.json").write_text(json.dumps(summary,indent=2)+"\n")
print(json.dumps(summary,indent=2))

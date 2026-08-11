import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const out = path.dirname(fileURLToPath(import.meta.url));
const esc = (value) => {
  const text = value == null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};
const writeCsv = (name, columns, rows) => {
  const body = [columns, ...rows].map((row) => row.map(esc).join(",")).join("\n") + "\n";
  fs.writeFileSync(path.join(out, name), body);
};

const reviewColumns = ["Area", "Before", "Risk / friction", "Action", "After", "Evidence", "Result", "Human review?"];
const journeyColumns = ["Journey", "User goal", "Entry point", "Current first action", "Current second action", "Current destination", "Current friction", "Current decision depth", "Target first action", "Target second action", "Target destination", "Target decision depth", "Implementation changes", "Success criteria", "Validation"];
const pageChangeColumns = ["URL / Component", "File", "UX issue", "Before behavior", "After behavior", "Navigation changed?", "Layout changed?", "Content text changed?", "Internal links changed?", "Breadcrumb changed?", "Search behavior changed?", "Accessibility changed?", "Responsive changed?", "Title changed?", "H1 changed?", "Index state changed?", "Canonical changed?", "URL changed?", "Trust content changed?", "AdSense behavior changed?", "Protected-state impact", "Validation", "Rollback"];

writeCsv("phase-7-ux-risk-register.csv",
  ["ID", "Area", "Risk", "Severity", "Evidence before", "Action", "Protected dependency", "Residual risk", "Validation", "Status"], [
  ["UX-01", "Primary navigation", "Seven equal top-level choices obscured the beginner route", "P1", "Pre-edit header and diagnostic", "Reduced to five task-oriented links; Search remains a distinct utility", "Stable routes and Phase 2 ownership", "Owner preference review", "5 exact links resolve; browser interaction PASS", "RESOLVED"],
  ["UX-02", "Homepage", "Repeated card grids created competing first actions", "P1", "Pre-edit homepage diagnostic", "Reordered around purpose, one beginner CTA, three paths, return actions and trust", "Metadata, FAQ truth, AdSense boundary", "Owner visual review", "Responsive QA 5 viewports; Lighthouse accessibility 1.0", "RESOLVED"],
  ["UX-03", "Mobile menu", "Weak focus return and no-JS behavior", "P1", "Header inspection", "Added focus entry/return, Escape/outside close and progressive enhancement", "Global navigation", "None known", "Six interaction scenarios PASS", "RESOLVED"],
  ["UX-04", "Hub hierarchy", "Start Here, Learn and Meditation presented too many equivalent choices", "P1", "Hub review", "Introduced staged, role-specific paths with deeper links secondary", "Phase 4 content and Phase 2 ownership", "Owner wording review", "SEO low-inbound warnings 0; journeys PASS", "RESOLVED"],
  ["UX-05", "Search", "No-result state did not provide a strong recovery path", "P2", "Search interaction review", "Added live status, busy state and query clearing", "Search noindex and 315-item index", "None known", "Search query and no-result scenarios PASS", "RESOLVED"],
  ["UX-06", "Orientation", "Several detail families lacked visible breadcrumbs", "P2", "Template audit", "Added shared visible breadcrumbs to four families", "Existing breadcrumb schema and canonical state", "None known", "6/6 visible/schema family checks PASS", "RESOLVED"],
  ["UX-07", "Footer", "Trust links were present but weakly grouped; tablet overflow risk", "P2", "Footer/browser review", "Grouped Explore, About & Trust, Legal & Settings; corrected tablet grid", "Phase 6 routes", "None known", "135/135 page-viewport checks PASS", "RESOLVED"]
]);

writeCsv("phase-7-primary-navigation-review.csv",
  ["Navigation item", "Current label", "Current destination", "Current order", "Primary user goal", "Beginner clarity", "Mobile clarity", "Overlap with other nav item", "Importance", "Keep?", "Move?", "Rename?", "Remove from top-level?", "Alternative discovery path", "Reason", "Human review?", "Final state"], [
  ["Beginner orientation", "Start Here", "/start-here/", 1, "Choose a first learning or practice action", "High", "High", "Distinct from Learn", "Primary", "Yes", "No", "No", "No", "Homepage hero", "Direct first-visit route", "Yes", "Top-level #1"],
  ["Structured learning", "Learn", "/learn/", 2, "Follow a learning progression", "High", "High", "Articles separated by purpose", "Primary", "Yes", "No", "No", "No", "Homepage Learn path", "Primary topic-owner hub", "Yes", "Top-level #2"],
  ["Practice", "Meditation", "/meditation/", 3, "Begin or choose a safe practice", "High", "High", "Distinct from reading", "Primary", "Yes", "No", "No", "No", "Homepage Practice path", "Primary practice owner", "Yes", "Top-level #3"],
  ["Editorial reading", "Articles", "/articles/", 4, "Browse contextual editorial reading", "High", "High", "Separated from Learn", "Primary", "Yes", "No", "No", "No", "Homepage recent articles", "Editorial discovery without replacing curricula", "Yes", "Top-level #4"],
  ["Return visit", "Daily Reflection", "/daily-reflections/", 5, "Reach a short recurring reflection", "High", "High", "Distinct repeat-use goal", "Primary", "Yes", "No", "No", "No", "Homepage Today action", "Supports returning visitors", "Yes", "Top-level #5"],
  ["Quote browsing", "Quotes", "/quotes/", 6, "Browse quotations and stories", "Medium", "Medium", "Overlap with reflection use", "Secondary", "Yes", "Yes", "No", "Yes", "Homepage return panel and footer", "Reduces top-level competition while preserving discovery", "Yes", "Secondary"],
  ["Utility", "Tools", "/tools/", 7, "Open lightweight practice tools", "Medium", "Medium", "Overlap with Meditation support", "Secondary", "Yes", "Yes", "No", "Yes", "Homepage return panel and footer", "Utility is supporting, not primary hierarchy", "Yes", "Secondary"],
  ["Find content", "Search", "/search/", "Utility", "Search across page families", "High", "High", "Supports all routes", "Utility", "Yes", "No", "No", "No", "Header search control", "Search supports rather than replaces navigation", "Yes", "Separate utility control"]
]);

writeCsv("phase-7-mobile-navigation-review.csv", reviewColumns, [
  ["Progressive enhancement", "Collapsed navigation depended on client state", "Navigation could be hidden if JavaScript failed", "Keep nav visible until enhanced and reveal toggle only after readiness", "All five links remain available without JavaScript", "No-JS browser scenario", "PASS", "No"],
  ["Focus entry", "Opening did not deliberately position focus", "Keyboard users could lose context", "Focus current or first menu link on open", "Predictable entry", "Mobile menu interaction", "PASS", "No"],
  ["Focus return", "Close behavior was inconsistent", "Focus could remain in a hidden region", "Return focus to toggle on Escape", "Predictable close", "Escape scenario", "PASS", "No"],
  ["State and current page", "No explicit active link", "Weak orientation", "aria-current plus visible active state", "Current route is announced and visible", "Header validation", "PASS", "Owner visual review"],
  ["Touch and overflow", "Seven links increased vertical choice load", "Crowding on small screens", "Five primary links; full-width targets", "No horizontal overflow at 360/390", "135 page-viewport matrix", "PASS", "No"]
]);

writeCsv("phase-7-homepage-review.csv", reviewColumns, [
  ["Purpose", "Purpose competed with repeated collections", "First action unclear", "Concise purpose statement and one primary beginner action", "Purpose and audience are immediately legible", "Homepage visual QA", "PASS", "Owner copy review"],
  ["Pathways", "Multiple repeated card groups", "High decision load", "Three role-specific paths: Learn, Practice, Read & Reflect", "Clear goal selection", "Journey scenarios", "PASS", "Owner visual review"],
  ["Returning visitor", "Return actions distributed across sections", "Extra scanning", "One compact Today / Quotes / Tools panel", "Repeat actions remain discoverable", "Homepage browser QA", "PASS", "No"],
  ["Trust", "Trust context lower and diffuse", "Publisher context easy to miss", "Restrained About / Process / Sources / Corrections block", "Trust remains discoverable without dominating", "Trust route validator", "PASS", "No"],
  ["Protected behavior", "Metadata, FAQ and ad boundary established", "UX edit could alter non-UX state", "Kept metadata, canonical, FAQ truth and AdSlot conditions", "No index, canonical or AdSense expansion", "Custom validator", "PASS", "No"]
]);

writeCsv("phase-7-start-here-review.csv", reviewColumns, [
  ["Role", "Broad catalogue overlapped Learn", "Beginners had to self-design a route", "Three first actions and four first learning steps", "Orientation page precedes the curriculum", "Journey QA", "PASS", "Owner copy review"],
  ["Progression", "Many equal links", "Decision depth and scanning", "Begin, practice or do one thing today; deeper topics later", "First action is explicit", "Click-path review", "PASS", "No"],
  ["Discoverability", "Catalogue links were prominent", "Simplification could orphan specific pages", "Moved specific lessons to a later contextual group", "No low-inbound warnings", "SEO audit", "PASS", "No"]
]);

writeCsv("phase-7-learn-journey-review.csv", reviewColumns, [
  ["Hierarchy", "Large flat catalogue", "Ownership was present but progression weak", "Begin, Foundations, Clarify a term, Study sources", "Curricular progression is explicit", "Learn browser QA", "PASS", "Owner review"],
  ["Beginner entry", "Beginner route competed with topics", "First step unclear", "Direct Buddhism for Beginners action", "Broad beginner owner is dominant", "Ownership validator", "PASS", "No"],
  ["Long-tail access", "Every lesson looked equally primary", "Overload", "Specific lessons moved below core progression", "Deep content preserved without hierarchy distortion", "SEO low-inbound 0", "PASS", "No"]
]);

writeCsv("phase-7-meditation-journey-review.csv", reviewColumns, [
  ["Hierarchy", "Many practice choices at one level", "New practitioners lacked a safe first route", "Start, Choose a method, Adapt", "Beginner practice precedes variants", "Meditation browser QA", "PASS", "Owner review"],
  ["Safety", "Safety note existed", "Simplification might hide it", "Retained visible safety and source notes", "Safety remains in the journey", "Custom trust/safety validator", "PASS", "No"],
  ["Support", "Timer and short practices competed with methods", "Supporting tools blurred ownership", "Grouped timer, posture, 5/10-minute options contextually", "Meditation remains owner; tools support it", "Internal link review", "PASS", "No"]
]);

writeCsv("phase-7-articles-journey-review.csv", reviewColumns, [
  ["Role distinction", "Articles and Learn both appeared as broad reading catalogues", "Users could not infer curricular versus editorial roles", "Kept Articles as editorial reading; Learn text states structured role", "Each hub has a distinct promise", "Journey review", "PASS", "Owner review"],
  ["Detail next steps", "Article template already had contextual paths", "Generic global changes could weaken Phase 5", "Preserved article template and differentiated recommendations", "Existing editorial differentiation remains", "Template preservation diff", "PASS", "No"]
]);

writeCsv("phase-7-quotes-journey-review.csv", reviewColumns, [
  ["Discovery", "Top-level navigation plus homepage collections", "Competed with primary learning/practice goals", "Moved to return panel/footer while preserving hub/category/story routes", "Quotes are secondary but reachable", "Click-depth and route checks", "PASS", "Owner review"],
  ["Orientation", "Category and story hierarchy primarily schema-based", "Visible context was weaker", "Added visible breadcrumbs to category and story", "Users can return to Quotes/category", "Breadcrumb validator", "PASS", "No"]
]);

writeCsv("phase-7-daily-reflection-journey-review.csv", reviewColumns, [
  ["Repeat access", "One of seven primary links", "Crowded nav but useful recurring action", "Kept as one of five and added Today action on homepage", "Strong recurring journey", "Header/homepage QA", "PASS", "Owner review"],
  ["Detail orientation", "Detail lacked visible breadcrumb", "Return route less obvious", "Added Daily Reflections breadcrumb", "Clear parent recovery", "Breadcrumb validator", "PASS", "No"],
  ["Monetization boundary", "Daily reflections excluded from expansion", "UX edit could introduce ad UI", "No ad component or policy changes", "Boundary unchanged", "Protected-file and route validation", "PASS", "No"]
]);

writeCsv("phase-7-tools-review.csv", reviewColumns, [
  ["Hierarchy", "Top-level utility link", "Competed with core goals", "Moved to homepage return panel and footer", "Still reachable as supporting utility", "Journey QA", "PASS", "Owner review"],
  ["Ownership", "Tools could appear parallel to Meditation", "Practice ownership dilution", "Meditation path remains primary; tools are contextual support", "Owner hierarchy reinforced", "Ownership preservation", "PASS", "No"]
]);

writeCsv("phase-7-search-ux-review.csv",
  ["Test case", "Query", "Expected result type", "Actual result", "Result clarity", "Duplicate results?", "Retired URL present?", "Noindex internal-search behavior correct?", "Keyboard behavior", "Mobile behavior", "No-results behavior", "Issue", "Action", "Validation"], [
  ["Known definition", "metta", "Definition and relevant content families", "Relevant Learn/Article/Meditation families returned", "Clear family labels", "No", "No", "Yes", "Dialog focuses input; Escape closes", "PASS", "Not applicable", "None", "Added live/busy result status", "PASS"],
  ["Known practice", "breathing meditation", "Meditation pages", "Valid meditation results", "Clear", "No", "No", "Yes", "Keyboard operable", "PASS", "Not applicable", "None", "Preserved index and improved announcements", "PASS"],
  ["No result", "zzzz-no-match", "Recovery state", "Query-specific no-result message and clear action", "Clear", "No", "No", "Yes", "Clear action keyboard operable", "PASS", "Clear query and browse suggestions", "Previous recovery was weak", "Added live message and clearing", "PASS"],
  ["Index integrity", "all", "Valid current URLs", "315 items; zero invalid URLs", "Family labels retained", "No invalid duplicates detected", "No", "Yes", "Not applicable", "Not applicable", "Not applicable", "None", "Programmatic index validation", "PASS"]
]);

writeCsv("phase-7-breadcrumb-review.csv", reviewColumns, [
  ["Article", "Visible and schema breadcrumbs already present", "Regression risk", "Preserved", "Visible/schema coherent", "Custom validator", "PASS", "No"],
  ["Learn detail", "Visible and schema breadcrumbs already present", "Regression risk", "Preserved", "Visible/schema coherent", "Custom validator", "PASS", "No"],
  ["Meditation detail", "Schema context without shared visible trail", "Weak parent recovery", "Added shared visible trail", "Home / Meditation / current", "Custom validator", "PASS", "No"],
  ["Daily reflection detail", "No visible shared trail", "Weak parent recovery", "Added shared visible trail", "Home / Daily Reflections / current", "Custom validator", "PASS", "No"],
  ["Quote category", "Schema hierarchy stronger than visible orientation", "Weak parent recovery", "Added shared visible trail", "Home / Quotes / current", "Custom validator", "PASS", "No"],
  ["Quote story", "Schema hierarchy stronger than visible orientation", "Weak category recovery", "Added shared visible trail", "Home / Quotes / category / current", "Custom validator", "PASS", "No"]
]);

writeCsv("phase-7-internal-link-review.csv",
  ["Source URL", "Target URL", "Source role", "Target role", "Current anchor", "Context", "Relevant?", "Ownership-aligned?", "Journey value", "Keep", "Remove", "Replace", "New anchor", "Reason", "Validation"], [
  ["/", "/start-here/", "Orientation entry", "Beginner orientation", "New here? Start here", "Hero", "Yes", "Yes", "Primary", "Yes", "No", "No", "", "Direct first action", "PASS"],
  ["/", "/learn/", "Site entry", "Learning owner", "Learn the foundations", "Three paths", "Yes", "Yes", "Primary", "Yes", "No", "No", "", "Separates structured study", "PASS"],
  ["/", "/meditation/", "Site entry", "Practice owner", "Begin a practice", "Three paths", "Yes", "Yes", "Primary", "Yes", "No", "No", "", "Separates practice", "PASS"],
  ["/start-here/", "/learn/buddhism-for-beginners/", "Orientation", "Broad beginner owner", "Buddhism for Beginners", "First learning step", "Yes", "Yes", "High", "Yes", "No", "No", "", "Ownership-aligned beginner route", "PASS"],
  ["/meditation/", "/meditation/meditation-for-beginners/", "Practice hub", "Beginner practice", "Start with meditation for beginners", "Start group", "Yes", "Yes", "High", "Yes", "No", "No", "", "Safe first practice", "PASS"],
  ["/", "/about/sources-and-references/", "Site entry", "Trust evidence", "Sources", "Trust block", "Yes", "Yes", "Supporting", "Yes", "No", "No", "", "Trust remains discoverable", "PASS"],
  ["/404/", "/search/", "Recovery", "Search utility", "Search Echo Buddha", "Error recovery", "Yes", "Yes", "High", "Yes", "No", "No", "", "Useful fallback", "PASS"]
]);

writeCsv("phase-7-related-content-review.csv", reviewColumns, [
  ["Article detail", "Role-specific Phase 5 recommendations", "Global generic blocks could re-template pages", "Preserved existing article template", "Differentiated recommendations remain", "Template diff", "PASS", "No"],
  ["Homepage recent reading", "Six-item collection plus repeated grids", "Too much catalogue density", "Reduced to three recent articles", "Editorial discovery remains without dominance", "Homepage QA", "PASS", "Owner review"],
  ["Hubs", "Flat collections", "Recommendations competed with primary route", "Moved deeper options below staged path", "Primary then secondary discovery", "SEO/internal-link audit", "PASS", "No"]
]);

writeCsv("phase-7-trust-discoverability-review.csv", reviewColumns, [
  ["Homepage", "Trust links diffuse", "Publisher context easy to miss", "Added compact About/Process/Sources/Corrections panel", "Trust visible near end of journey", "Route checks", "PASS", "No"],
  ["Footer", "Trust routes mixed with general links", "Weak grouping", "Created About & Trust group", "Author, editorial, process, sources, corrections and contact grouped", "Footer browser QA", "PASS", "No"],
  ["Content templates", "Phase 6 author/source/correction behavior", "UX work could hide evidence", "No substantive trust template changes", "Bylines, sources, correction and attribution preserved", "Protected-file diff and custom validator", "PASS", "No"],
  ["Meditation safety", "Visible safety guidance", "Could be displaced by simplification", "Retained safety links and notes", "Safety remains visible", "Safety validator", "PASS", "No"]
]);

writeCsv("phase-7-footer-review.csv", reviewColumns, [
  ["Grouping", "Longer mixed link list", "Hierarchy and trust scanning", "Explore / About & Trust / Legal & Settings", "Clear role groups", "Browser QA", "PASS", "Owner review"],
  ["Secondary routes", "Quotes and Tools top-level", "Primary navigation crowding", "Preserved in Explore and homepage return panel", "No orphaning", "Click-path review", "PASS", "No"],
  ["Responsive grid", "Initial Phase 7 grid overflowed at tablet", "Horizontal overflow", "Adjusted minmax columns", "No overflow at five viewports", "135/135 matrix", "PASS", "No"]
]);

writeCsv("phase-7-404-empty-state-review.csv", reviewColumns, [
  ["404", "Home plus limited guidance", "Recovery choices weak", "Home, Search, Start Here, Learn and Meditation recovery", "Goal-based recovery", "Actual 404 status and route interaction", "PASS", "No"],
  ["404 SEO", "noindex and canonical disabled", "Could accidentally become indexable", "Preserved", "Still protected", "Custom validator", "PASS", "No"],
  ["Search empty", "Generic empty message", "No direct reset", "Query-specific status plus clear action", "Immediate recovery", "Browser interaction", "PASS", "No"]
]);

writeCsv("phase-7-accessibility-review.csv",
  ["Page / Component", "Keyboard", "Focus", "Semantics", "Heading hierarchy", "Labels", "Touch targets", "Contrast", "Reduced motion", "Mobile zoom", "Screen-reader concern", "Automated result", "Manual result", "Issue", "Severity", "Action", "Validation"], [
  ["Global header", "PASS", "Entry/return PASS", "nav/button/aria-current", "N/A", "Menu and Search labelled", "PASS", "PASS", "Existing behavior preserved", "Allowed", "None found", "0 critical/serious", "PASS", "None", "None", "Focus management and progressive enhancement", "PASS"],
  ["Search overlay", "PASS", "Input/close/return PASS", "dialog/search/live status", "PASS", "Close and query labelled", "PASS", "PASS", "Preserved", "Allowed", "Result update announcement", "0 critical/serious", "PASS", "Previous status feedback weak", "P2", "aria-live and aria-busy", "PASS"],
  ["Homepage", "PASS", "Visible", "Landmarks/links", "PASS", "Purposeful CTA labels", "PASS", "PASS", "Preserved", "Allowed", "None found", "0 issues", "PASS", "None", "None", "Semantic restructure", "PASS"],
  ["Breadcrumbs", "PASS", "Visible", "nav aria-label/list/aria-current", "N/A", "Breadcrumb labelled", "PASS", "PASS", "N/A", "Allowed", "Current page announced", "0 issues", "PASS", "None", "None", "Shared semantic component", "PASS"],
  ["404", "PASS", "Visible", "main and links", "PASS", "Descriptive recovery labels", "PASS", "PASS", "Preserved", "Allowed", "None found", "0 issues", "PASS", "None", "None", "Expanded recovery", "PASS"],
  ["17-page representative matrix", "PASS", "PASS", "PASS", "PASS", "PASS", "PASS", "PASS", "PASS", "PASS", "No automated concern", "critical 0; serious 0; moderate 0; minor 0", "PASS", "None", "None", "axe/browser suite", "PASS"]
]);

writeCsv("phase-7-responsive-review.csv", reviewColumns, [
  ["Page matrix", "Responsive behavior required sampling", "Hidden overflow or wrapping regressions", "Tested 27 pages at 360/390/768/1024/1440", "135/135 combinations pass", "phase-7-browser-qa.json", "PASS", "No"],
  ["Header", "Seven links increased crowding", "Tablet/desktop compression", "Five primary links and mobile enhancement", "No overflow; toggle behavior verified", "Visual QA", "PASS", "Owner visual review"],
  ["Footer", "First implementation exposed tablet overflow", "Horizontal scroll", "Corrected flexible grid", "No overflow", "Full rerun", "PASS", "No"],
  ["Long terms", "Pali/Buddhist terms can be long", "Small-screen wrapping", "Existing global wrapping retained", "No visual overflow detected", "Five viewport matrix", "PASS", "No"]
]);

writeCsv("phase-7-readability-review.csv", reviewColumns, [
  ["Homepage density", "Repeated catalogues and six recent articles", "Scanning burden", "Three paths, four beginner steps, three recent items, compact return/trust panels", "Clear section sequence", "Visual QA", "PASS", "Owner visual review"],
  ["Start Here", "Many equivalent routes", "High cognitive load", "First actions precede deeper study", "Beginner language and staged choices", "Journey QA", "PASS", "Owner copy review"],
  ["Learn", "Flat topic inventory", "Progression unclear", "Four named learning roles", "Predictable progression", "Browser QA", "PASS", "Owner copy review"],
  ["Meditation", "Many practices together", "Choice overload", "Start / Choose / Adapt", "Safety and support remain readable", "Browser QA", "PASS", "Owner copy review"]
]);

writeCsv("phase-7-click-depth-review.csv",
  ["Target URL", "Page family", "Importance", "From homepage", "From Start Here", "From Learn", "From Meditation", "From Articles", "From Search", "Current depth", "Target depth if change required", "Problem?", "Action", "Evidence"], [
  ["/start-here/", "Orientation", "Primary", 1, 0, 2, 2, 2, 1, 1, "", "No", "Keep direct hero/header path", "Link graph + header"],
  ["/learn/", "Hub", "Primary owner", 1, 1, 0, 2, 2, 1, 1, "", "No", "Keep direct path", "Link graph + header"],
  ["/learn/buddhism-for-beginners/", "Learning owner", "Primary", 2, 1, 1, 3, 3, 1, 1, "", "No", "Prominent Start Here/Learn link", "Link graph"],
  ["/meditation/", "Hub", "Primary owner", 1, 1, 2, 0, 2, 1, 1, "", "No", "Keep direct path", "Link graph + header"],
  ["/meditation/meditation-for-beginners/", "Practice", "Primary", 2, 1, 2, 1, 3, 1, 1, "", "No", "Prominent Start Here/Meditation link", "Link graph"],
  ["/articles/", "Hub", "Primary", 1, 2, 2, 2, 0, 1, 1, "", "No", "Keep direct path", "Link graph + header"],
  ["/daily-reflections/", "Repeat hub", "Primary", 1, 1, 2, 2, 2, 1, 1, "", "No", "Keep header/Today path", "Link graph + header"],
  ["/quotes/", "Secondary hub", "Secondary", 1, 2, 2, 2, 2, 1, 1, "", "No", "Homepage return panel/footer", "Link graph"],
  ["/tools/", "Utility", "Secondary", 1, 2, 2, 2, 2, 1, 1, "", "No", "Homepage return panel/footer", "Link graph"],
  ["/about/sources-and-references/", "Trust", "Supporting", 1, 2, 2, 2, 2, 1, 1, "", "No", "Homepage trust/footer", "Link graph"]
]);

const journeys = [
  ["First-time visitor", "Understand the site and choose a safe first step", "/", "Scan multiple competing sections", "Choose among seven navigation items", "Variable", "Purpose and starting point competed", "2–3 decisions", "Select New here? Start here", "Choose learn, practice or today", "/start-here/ or owner route", "1–2 decisions", "Single hero CTA plus three-path model", "Beginner route visible without search", "Journey browser scenario PASS"],
  ["Beginner learner", "Learn foundational Buddhism in sequence", "/ or /start-here/", "Browse broad card groups", "Infer topic order", "/learn/...", "Flat options", "2–4 decisions", "Open Start Here or Learn", "Select Buddhism for Beginners then staged foundations", "/learn/buddhism-for-beginners/", "1–2 decisions", "Explicit owner and progression", "Broad owner reached directly", "PASS"],
  ["New meditator", "Start a safe beginner practice", "/ or /meditation/", "Compare many practice cards", "Find beginner content", "/meditation/meditation-for-beginners/", "Methods competed with support tools", "2–3 decisions", "Open Meditation", "Select beginner practice", "/meditation/meditation-for-beginners/", "1–2 decisions", "Start / Choose / Adapt hierarchy with safety preserved", "Beginner and safety route visible", "PASS"],
  ["Topic learner", "Clarify a specific concept", "/learn/ or Search", "Scan topic catalogue", "Open detail", "Relevant learn page", "No staged terminology route", "2 decisions", "Choose Clarify a term", "Open named topic or Search", "Learn detail", "1–2 decisions", "Term group plus search support", "Owner-aligned result", "PASS"],
  ["Editorial reader", "Read contextual editorial content", "/", "Scan repeated recent/card groups", "Choose article", "Article detail", "Learn and Articles roles blurred", "2 decisions", "Choose Read & Reflect or Articles", "Choose article", "Article detail", "1–2 decisions", "Clear Articles role and three recent items", "Article reached without curriculum confusion", "PASS"],
  ["Returning reflector", "Reach today's reflection quickly", "/", "Find one of several recurring sections", "Open reflection", "/daily-reflections/", "Return actions distributed", "1–2 decisions", "Select Daily Reflection or Today", "Read", "/daily-reflections/", "1 decision", "Header remains primary; compact return panel", "One-action access", "PASS"],
  ["Quote browser", "Browse quote categories and stories", "/", "Use top-level Quotes", "Select category/story", "Quote detail", "Top nav crowded", "2 decisions", "Use return panel/footer", "Select category/story with breadcrumbs", "Quote detail", "2 decisions", "Secondary discovery preserved; visible breadcrumbs", "Reachable without top-level dominance", "PASS"],
  ["Trust evaluator", "Understand publisher, process, sources and corrections", "/ or content", "Search footer/about links", "Choose trust page", "Trust detail", "Links not strongly grouped", "1–3 decisions", "Use homepage trust or About & Trust footer", "Choose evidence route", "Trust detail", "1–2 decisions", "Trust grouping and homepage panel", "All trust routes reachable", "PASS"]
];
writeCsv("phase-7-user-journey-before-after.csv", journeyColumns, journeys);

writeCsv("phase-7-page-change-register.csv", pageChangeColumns, [
  ["Global header", "src/components/Header.astro", "Crowded primary hierarchy and incomplete mobile focus behavior", "Seven primary links", "Five task-oriented links plus separate Search; active state and robust mobile focus", "Yes", "Yes", "Yes", "Yes", "No", "No", "Yes", "Yes", "N/A", "N/A", "No", "No", "No", "No", "No", "Routes preserved", "Custom + browser PASS", "Restore prior nav array/styles/script"],
  ["Global footer", "src/components/Footer.astro", "Weak trust grouping and secondary-route hierarchy", "Mixed columns", "Explore / About & Trust / Legal & Settings", "Yes", "Yes", "Yes", "Yes", "No", "No", "No", "Yes", "N/A", "N/A", "No", "No", "No", "No", "No", "Trust routes more discoverable", "135/135 responsive PASS", "Restore prior footer groups"],
  ["/", "src/pages/index.astro", "Competing repeated pathways", "Dense repeated card/catalogue sections", "Purpose, primary beginner CTA, three paths, return and trust panels", "No", "Yes", "Yes", "Yes", "No", "No", "Yes", "Yes", "No", "No", "No", "No", "No", "No", "No", "Metadata/FAQ/ad conditions preserved", "Browser/custom/Lighthouse PASS", "Restore prior page structure"],
  ["/start-here/", "src/pages/start-here.astro", "Overlap with Learn and flat choices", "Broad catalogue", "Orientation with three actions and four learning steps", "No", "Yes", "Yes", "Yes", "No", "No", "No", "Yes", "No", "No", "No", "No", "No", "No", "No", "Phase 4 content remains linked", "SEO/browser PASS", "Restore prior layout"],
  ["/learn/", "src/pages/learn/index.astro", "Flat learning catalogue", "Many equal topic links", "Begin / Foundations / Clarify / Sources plus secondary lessons", "No", "Yes", "Yes", "Yes", "No", "Yes", "No", "Yes", "No", "No", "No", "No", "No", "No", "No", "Topic ownership preserved", "SEO low-inbound 0", "Restore prior layout"],
  ["/meditation/", "src/pages/meditation/index.astro", "Practice choice overload", "Methods and support choices competed", "Start / Choose / Adapt", "No", "Yes", "Yes", "Yes", "No", "No", "No", "Yes", "No", "No", "No", "No", "No", "No", "No", "Safety and ownership preserved", "Browser/custom PASS", "Restore prior layout"],
  ["Meditation detail", "src/pages/meditation/[slug].astro", "Visible orientation gap", "No shared visible breadcrumb", "Visible semantic breadcrumb", "No", "Yes", "No", "Yes", "Yes", "No", "Yes", "Yes", "No", "No", "No", "No", "No", "No", "No", "Content/safety unchanged", "Breadcrumb PASS", "Remove Breadcrumbs usage"],
  ["Daily reflection detail", "src/pages/daily-reflections/[slug].astro", "Visible orientation gap", "No shared visible breadcrumb", "Visible semantic breadcrumb", "No", "Yes", "No", "Yes", "Yes", "No", "Yes", "Yes", "No", "No", "No", "No", "No", "No", "No", "Monetization boundary unchanged", "Breadcrumb PASS", "Remove Breadcrumbs usage"],
  ["Quote category/story", "src/pages/quotes/[category].astro; src/pages/quotes/[category]/[story].astro", "Visible orientation gap", "Schema stronger than visible trail", "Visible semantic breadcrumbs", "No", "Yes", "No", "Yes", "Yes", "No", "Yes", "Yes", "No", "No", "No", "No", "No", "No", "No", "Attribution unchanged", "Breadcrumb PASS", "Remove Breadcrumbs usage"],
  ["Search", "src/pages/search.astro; src/components/SearchOverlay.astro; public/search.js", "Weak result announcements and no-result recovery", "Single status and generic empty state", "Live/busy status, clear query, improved close label", "No", "Yes", "Yes", "No", "No", "Yes", "Yes", "Yes", "No", "No", "No", "No", "No", "No", "No", "Search noindex/index preserved", "Search interactions PASS", "Restore prior markup/script"],
  ["/404/", "src/pages/404.astro", "Limited recovery", "Home-oriented recovery", "Goal-based Home/Search/Start/Learn/Meditation links", "No", "Yes", "Yes", "Yes", "No", "No", "No", "Yes", "No", "No", "No", "No", "No", "No", "No", "noindex/canonical false preserved", "Actual status PASS", "Restore prior recovery links"]
]);

writeCsv("phase-7-content-preservation.csv", ["Page / family", "Phase 4 substantive value", "Purpose preserved", "Key content visible", "Truncated?", "Next-step load", "Evidence", "Result"], [
  ["Homepage", "FAQ truth and publisher explanation preserved", "Yes", "Yes", "No", "Reduced", "Custom validator and page review", "PASS"],
  ["Start Here", "Existing destinations remain discoverable", "Yes", "Yes", "No", "Staged", "SEO low-inbound 0", "PASS"],
  ["Learn hub", "Learning pages and definitions preserved", "Yes", "Yes", "No", "Staged", "Search index 315; internal links valid", "PASS"],
  ["Meditation hub", "Practices, safety and source notes preserved", "Yes", "Yes", "No", "Staged", "Safety validator", "PASS"],
  ["All substantive data/detail content", "Data files and article/detail bodies unchanged", "Yes", "Yes", "No", "Unchanged", "Git diff scope", "PASS"]
]);

writeCsv("phase-7-template-preservation.csv", ["Template / family", "Phase 5 differentiation", "Generic block introduced?", "Protected behavior", "Evidence", "Result"], [
  ["Article detail", "Role-specific editorial template", "No", "Byline/source/recommendation structure unchanged", "No template diff", "PASS"],
  ["Learn detail", "Role-specific learning template", "No", "Progression and sourcing unchanged", "No template diff", "PASS"],
  ["Meditation detail", "Practice-specific content", "No", "Only shared breadcrumb added", "Diff review", "PASS"],
  ["Daily reflection", "Short-form reflection role", "No", "Only shared breadcrumb added", "Diff review", "PASS"],
  ["Quote category/story", "Category/story distinction", "No", "Only shared breadcrumb added", "Diff review", "PASS"]
]);

writeCsv("phase-7-trust-preservation.csv", ["Trust item", "Pre-Phase 7 state", "Phase 7 action", "Visibility after", "Content changed?", "Evidence", "Result"], [
  ["Author/publisher", "Visible on governed content", "Preserved and linked in footer", "Visible", "No substantive change", "Trust validator", "PASS"],
  ["Source notes", "Visible on governed pages", "Preserved; Sources grouped in footer/homepage", "Visible", "No", "Protected-file diff", "PASS"],
  ["Correction route", "Published route", "Homepage/footer discovery strengthened", "Visible", "No", "Route check", "PASS"],
  ["Meditation safety", "Visible safety guidance", "Preserved in hub/detail", "Visible", "No", "Safety validator", "PASS"],
  ["Quote attribution", "Published attribution", "Preserved", "Visible", "No", "Template diff", "PASS"]
]);

writeCsv("phase-7-ownership-preservation.csv", ["Topic / task", "Primary owner", "Supporting surfaces", "Phase 7 hierarchy", "Regression?", "Evidence", "Result"], [
  ["Beginner Buddhism", "/learn/buddhism-for-beginners/", "/start-here/; /learn/", "Owner is direct first learning step", "No", "Journey and link validation", "PASS"],
  ["Structured learning", "/learn/", "/articles/; Search", "Learn remains primary and top-level", "No", "Navigation review", "PASS"],
  ["Meditation", "/meditation/", "/tools/; supporting articles", "Meditation remains primary; tools secondary", "No", "Navigation/journey review", "PASS"],
  ["Editorial reading", "/articles/", "/learn/; homepage", "Articles role explicitly differentiated", "No", "Hub review", "PASS"],
  ["Daily reflection", "/daily-reflections/", "/; footer", "Primary repeat route remains top-level", "No", "Navigation review", "PASS"]
]);

writeCsv("phase-7-indexability-preservation.csv", ["Surface", "Before", "After", "Change approved?", "Canonical change", "URL change", "Sitemap change", "Evidence", "Result"], [
  ["Indexable route inventory", "Phase 6 baseline", "Identical states", "Not required", "0", "0", "0", "Custom before/after validator", "PASS"],
  ["Canonical inventory", "Phase 6 baseline", "Identical", "Not required", "0", "0", "0", "Custom validator", "PASS"],
  ["Sitemap", "193 URLs", "193 URLs", "Not required", "0", "0", "0", "Built sitemap count", "PASS"],
  ["Search", "noindex internal search", "noindex unchanged", "Not required", "0", "0", "0", "Search review", "PASS"],
  ["404", "noindex; canonical false", "Unchanged", "Not required", "0", "0", "0", "Custom validator", "PASS"]
]);

writeCsv("phase-7-performance-regression-review.csv", ["Surface / asset", "Phase 6 reference", "Phase 7 result", "Delta", "Attribution", "Regression?", "Action", "Evidence", "Result"], [
  ["Desktop representative matrix", "Phase 6 local scores up to 1.0", "10/10 routes 1.0 performance and 1.0 accessibility", "No adverse signal", "Phase 7 build", "No", "None", "post-edit Lighthouse", "PASS"],
  ["Mobile non-home routes", "Phase 6 local 0.99–1.0 typical", "9/9 routes 0.98–1.0; accessibility 1.0", "Within run variance", "Phase 7 build", "No", "None", "post-edit Lighthouse", "PASS"],
  ["Mobile homepage sample", "Phase 6 local 0.99; production Phase 6 0.60", "Matrix sample 0.83 with sub-second LCP; independent sample 0.72 with third-party ad/analytics long tasks", "Variable", "Google AdSense/Analytics network and CPU timing dominate; protected scripts unchanged", "No Phase 7 code regression established", "Carry field CWV/production parity to Phase 8", "Lighthouse long-task attribution and protected-file diff", "PASS WITH THIRD-PARTY VARIANCE"],
  ["public/search.js", "9017 bytes", "9329 bytes", "+312 bytes / +3.46%", "Live status, clear actions, busy state", "No significant", "Retain", "wc byte count", "PASS"],
  ["src/styles/global.css", "5846 bytes", "5846 bytes", "0", "No global CSS expansion", "No", "None", "wc byte count", "PASS"],
  ["Architecture", "Astro static; minimal client JS", "Unchanged", "0 dependencies/frameworks", "No migration/hydration framework", "No", "None", "package/diff review", "PASS"]
]);

writeCsv("phase-7-human-review-items.csv", ["Priority", "Item", "Decision needed", "Blocking Phase 7 completion?", "Blocking deployment?", "Evidence", "Recommendation", "Status"], [
  ["P2", "Owner visual/copy review", "Confirm final five-link labels and homepage voice", "No", "Yes", "Visual screenshots and report", "Review before commit/deploy", "OPEN OWNER REVIEW"],
  ["P2", "Production authorization", "Explicitly authorize commit/push/deploy", "No", "Yes", "Prompt prohibits deployment by default", "Keep production unchanged", "OPEN"],
  ["P3", "Mobile homepage field performance", "Review real-user CWV after deployment", "No", "No", "Synthetic third-party variance", "Phase 8 field measurement", "HANDOFF"],
  ["P3", "Consent/analytics behavior", "Legal/owner validation in Phase 8", "No", "No", "Existing model deliberately preserved", "Do not change in Phase 7", "HANDOFF"]
]);

writeCsv("phase-7-phase8-handoff.csv",
  ["Priority", "URL / Component", "Issue", "UX impact", "Technical impact", "AdSense impact", "Privacy impact", "Current behavior", "Desired Phase 8 outcome", "Phase 7 workaround applied?", "Protected Phase 7 behavior", "Evidence", "Human/legal review?"], [
  ["P1", "ConsentManager / analytics", "Existing default-accepted analytics model requires technical/legal review", "Privacy setting clarity", "Consent state and tag loading", "Policy readiness", "High", "Phase 6 behavior preserved", "Owner/legal-approved consent architecture and tests", "No", "Keyboard access and settings recovery", "Consent browser results", "Yes"],
  ["P1", "AdSense integration", "Technical production verification remains", "Future ad-safe layout", "Publisher script/routes", "High", "Medium", "Single existing behavior; manual slots disabled", "Verify script, exclusions, CMP and placement safety", "No", "No ad expansion and user-goal-first layout", "Custom protected-file validation", "Yes"],
  ["P1", "Production parity", "Phase 7 not deployed", "Users do not yet receive Phase 7", "Build/edge parity", "Medium", "Low", "Production remains Phase 6", "Authorized deploy plus production validation", "No", "All Phase 7 journeys and routes", "Deployment status", "Yes"],
  ["P2", "Security headers / CSP", "Production hardening outside Phase 7", "Low direct", "Headers and third-party allowlists", "Medium", "Medium", "Current configuration preserved", "Review Cloudflare headers/CSP", "No", "Search, menu, analytics and AdSense functionality", "Phase boundary", "Yes"],
  ["P2", "Field performance / CWV", "Synthetic homepage variance from third parties", "Potential mobile delay", "RUM/field telemetry", "Medium", "Low", "Synthetic results recorded", "Assess field LCP/INP/CLS and third-party cost", "No", "No framework migration; minimal Phase 7 JS", "Performance register", "No"],
  ["P2", "Cloudflare behavior", "Edge-specific cache/runtime parity not retested for un-deployed work", "Production fidelity", "Worker/cache/redirect behavior", "Medium", "Low", "Phase 6 production remains healthy", "Post-deploy route, redirect, consent and accessibility checks", "No", "Stable URLs, canonical/index state", "Release/browser evidence", "No"]
]);

writeCsv("phase-7-future-phase-handoff.csv", ["Phase", "Priority", "Area", "Issue", "Why deferred", "Protected Phase 7 state", "Evidence", "Owner review?"], [
  ["PHASE 9", "P2", "CI / Git / deployment governance", "Formalize branch, approval, deployment and rollback automation", "Outside UX scope", "Phase 7 validation and rollback evidence", "Current branch/worktree", "Yes"],
  ["PHASE 10", "P2", "Search Console / measurement", "Measure discovery, indexing and journey outcomes after release", "Requires production data and time", "Stable URLs/indexability", "Indexability register", "Yes"]
]);

writeCsv("phase-7-validation-summary.csv", ["Validation", "Scope", "Result", "Count / metric", "Evidence", "Notes"], [
  ["npm run validate:release", "Build/typecheck/lint/tests/SEO/content/dependencies", "PASS", "336 built pages; 7/7 tests; 0 critical/high dependencies", "Release command output", "No tests weakened"],
  ["Post-edit browser audit", "Accessibility and consent", "PASS", "17 pages; 0 critical/serious/moderate/minor; 5/5 consent scenarios", "post-edit-browser JSON", "Existing consent model preserved"],
  ["Phase 7 custom validation", "Navigation/search/links/breadcrumbs/index/trust/safety/AdSense", "PASS", "21/21 checks; 0 broken links; 315 valid search items", "phase-7-custom-validation.json", "193 sitemap URLs; 336 pages"],
  ["Responsive visual QA", "27 pages x 5 viewports", "PASS", "135/135", "phase-7-browser-qa.json", "360–1440px"],
  ["Interaction QA", "Menu/search/skip/no-JS/404", "PASS", "6/6", "phase-7-browser-qa.json", "Keyboard and recovery included"],
  ["Journey QA", "Eight primary journeys", "PASS", "8/8", "phase-7-browser-qa.json", "No dead-end primary journey"],
  ["Lighthouse accessibility", "10 representative routes, mobile + desktop", "PASS", "20/20 at 1.0", "post-edit-lighthouse", "Automated result"],
  ["Lighthouse performance", "10 representative routes, mobile + desktop", "PASS WITH DOCUMENTED VARIANCE", "Desktop 10/10 at 1.0; mobile non-home 0.98–1.0", "performance-summary.csv", "Homepage samples affected by protected third-party scripts; Phase 8 field follow-up"]
]);

writeCsv("phase-7-rollback-map.csv",
  ["URL / Component", "File", "Starting behavior", "New behavior", "Reason", "Affected user journey", "Protected dependencies", "Rollback action", "Risk", "Validation"], [
  ["Header", "src/components/Header.astro", "Seven primary links", "Five links, active state, enhanced mobile focus", "Reduce decision load", "All", "Stable destinations and Search", "Revert Phase 7 header diff only", "Medium: loses mobile/a11y improvements", "Rerun custom/browser tests"],
  ["Footer", "src/components/Footer.astro", "Mixed groups", "Three role groups", "Trust and secondary discovery", "Trust/return", "All route destinations", "Revert footer diff only", "Low", "Responsive matrix"],
  ["Homepage", "src/pages/index.astro", "Repeated catalogues", "Purpose-led staged hierarchy", "First-visit clarity", "First-time/returning", "Metadata/FAQ/AdSense boundary", "Revert page diff only", "Medium", "Build/custom/Lighthouse"],
  ["Start Here", "src/pages/start-here.astro", "Broad catalogue", "Orientation sequence", "Beginner clarity", "First-time/beginner", "Deep routes", "Revert page diff only", "Low", "SEO/link checks"],
  ["Learn", "src/pages/learn/index.astro", "Flat topic collection", "Four staged groups", "Learning progression", "Learner/topic lookup", "Topic ownership", "Revert page diff only", "Medium", "SEO/ownership checks"],
  ["Meditation", "src/pages/meditation/index.astro", "Many equal options", "Start/Choose/Adapt", "Safe practice path", "New meditator", "Safety/source notes", "Revert page diff only", "Medium", "Safety/browser checks"],
  ["Breadcrumbs", "src/components/Breadcrumbs.astro and four templates", "No shared visible breadcrumb", "Semantic visible trail", "Orientation", "Detail browsing", "Schema/canonical", "Remove component imports/usages and file", "Low", "Build/schema validator"],
  ["Search", "public/search.js and search components/page", "Generic status/recovery", "Live/busy state and clear action", "Search accessibility", "Topic lookup/recovery", "315-item index/noindex", "Revert three search diffs", "Low", "Search interactions"],
  ["404", "src/pages/404.astro", "Limited recovery", "Five goal-based paths", "Dead-end prevention", "Recovery", "noindex/canonical false", "Revert 404 diff", "Low", "Actual 404 scenario"]
]);

writeCsv("MASTER_PRE_PHASE8_PROTECTION_REGISTER.csv",
  ["Item / URL", "Protected user journey", "Protected navigation behavior", "Protected mobile behavior", "Protected accessibility behavior", "Protected content", "Protected ownership", "Protected source/trust", "Protected index state", "Protected AdSense behavior", "Phase 8 allowed changes", "Phase 8 prohibited changes", "Validation required"], [
  ["Global header", "All primary journeys", "Five links in order; Search separate; active state", "Progressive enhancement, Escape/outside close, focus return", "Keyboard and aria-current", "Labels may receive owner-approved refinement only", "Learn/Meditation/Articles/Daily owners", "Trust not moved into crowded primary nav", "No route change", "No ad control in header", "Technical fixes that preserve hierarchy", "Re-expand or hide nav without UX reconciliation", "Browser keyboard/no-JS/route tests"],
  ["/", "First-time and returning", "Start Here primary; three paths; return panel", "No overflow at 360px", "Semantic actions and heading order", "Purpose, FAQ truth and curated reading", "Owner hubs remain dominant", "Trust panel remains discoverable", "Index/canonical unchanged", "Existing script/slot conditions unchanged", "Performance/security/consent hardening", "Ad-first layout or metadata/index changes", "Custom/browser/Lighthouse"],
  ["/start-here/", "First-time visitor", "Three first actions and four learning steps", "Staged choices wrap", "Descriptive links", "Orientation copy and deep-link preservation", "Beginner owner direct", "Safety/trust destinations available", "Index/canonical/URL unchanged", "No expansion", "Technical/accessibility fixes", "Turn into flat catalogue", "Journey/SEO checks"],
  ["/learn/", "Structured learner", "Begin/Foundations/Clarify/Sources", "Responsive groups", "Headings and link purpose", "Learning destinations remain", "Learn and Buddhism for Beginners remain owners", "Source study route visible", "Index/canonical/URL unchanged", "No expansion", "Technical hardening", "Blur Learn/Articles ownership", "Ownership/links/browser"],
  ["/meditation/", "Practice", "Start/Choose/Adapt", "Responsive groups", "Headings/link purpose", "Practice/safety/source notes", "Meditation remains owner; tools support", "Safety and sources visible", "Index/canonical/URL unchanged", "No expansion", "Consent/performance fixes", "Hide safety or add unsafe monetization pressure", "Safety/browser/index"],
  ["/articles/ and detail", "Editorial reading", "Articles distinct from Learn", "Existing responsive templates", "Byline/heading/link behavior", "Phase 4 article value", "Articles editorial owner", "Author/sources/corrections", "Index/canonical/URLs unchanged", "No expansion in Phase 7", "Technical hardening", "Genericize templates or hide trust", "Content/template/trust tests"],
  ["Daily Reflections", "Returning reflector", "Top-level route and Today access", "Responsive cards/breadcrumbs", "Visible breadcrumb", "Short reflection role", "Daily owner", "Attribution where present", "Index/canonical/URLs unchanged", "Exclusion/boundary unchanged", "Technical review", "Ad expansion without policy review", "Route/breadcrumb/AdSense checks"],
  ["Quotes", "Quote browser", "Secondary homepage/footer discovery", "Responsive categories/stories", "Visible breadcrumbs", "Quote/story differentiation", "Quotes owner", "Attribution preserved", "Index/canonical/URLs unchanged", "No expansion", "Technical hardening", "Return to primary-nav crowding without review", "Journey/breadcrumb/trust"],
  ["Search", "Topic lookup and recovery", "Utility supports nav", "Dialog/page usable on small screens", "Live/busy status, focus and Escape", "315 valid indexed items", "Family labels preserve ownership", "Trust pages searchable", "Search page remains noindex", "No expansion", "Security/performance fixes", "Make search replace primary navigation or index query pages", "Search/keyboard/index tests"],
  ["Footer/trust routes", "Trust evaluator and secondary discovery", "Three groups and all destinations", "No overflow", "Semantic footer links", "Legal/trust text unchanged", "Primary owners not diluted", "Author/editorial/process/sources/corrections/contact visible", "States unchanged", "Privacy settings remains accessible", "Consent/legal hardening", "Hide correction/source/privacy settings", "Responsive/trust/consent tests"],
  ["404", "Error recovery", "Home/Search/Start/Learn/Meditation", "No overflow", "Descriptive recovery links", "Helpful recovery copy", "Owner destinations", "No trust regression", "noindex and canonical false", "No ads introduced", "Technical routing fixes", "Index 404 or remove recovery", "Status/index/browser test"],
  ["Repository architecture", "All", "Astro static behavior", "Minimal JS", "Existing automated a11y gates", "No mass content rewrite", "Phase 2 model", "Phase 6 integrity", "Phase 3 state", "Manual slots disabled and scope unchanged", "Phase 8 technical hardening", "Framework migration or unreviewed URL/index/ad expansion", "Full release/browser/Lighthouse"]
]);

console.log("Phase 7 evidence registers generated.");

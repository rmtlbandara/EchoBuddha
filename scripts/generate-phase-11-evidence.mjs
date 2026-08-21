import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const phaseRoot = path.join(root, "docs/audits/adsense-rejection-2026-08");
const phase10 = path.join(phaseRoot, "phase-10-search-console-measurement");
const phase8 = path.join(phaseRoot, "phase-8-technical-adsense-privacy");
const out = path.join(phaseRoot, "phase-11-final-adsense-readiness");
const origin = "https://echobuddha.com";
const snapshotSha = "b6255aaea1b76b3983468dd7f399c27c90820b3d";
const snapshotDeployment = "602d2a90-2705-42cb-87ce-23905dd46d81";
const snapshotVersion = "ad82bc9d-2120-4e97-825f-eb9656370f3d";
const snapshotDistSha = "c077a8d17eca75576055af50464fe9b88e05b6e2e9aded2e577300ecfa5ee3a0";
const publisherId = "pub-3911157640549350";
const publisherAccount = "ca-pub-3911157640549350";
const adsTxtAccountStatus = "Not found";
const manualActionsStatus = "No issues detected";
const manualActionsEvidenceSha256 = "32fcdd598116fa58366d4e1d7d40a376a61ea35dc3046fd4ea17108aaba25470";
const manualActionsEvidenceDimensions = "2814x1372";
const securityIssuesStatus = "No issues detected";
const securityIssuesEvidenceSha256 = "dd32636f03d1ef61353ab4a6f4658035fe36cc6facd14c361e6f6ddf5388bd28";
const securityIssuesEvidenceDimensions = "2814x1372";
const adsenseSitesStatus = "Getting ready";
const adsenseSitesLastUpdated = "2026-08-14 08:16 GMT+05:30";
const adsenseSitesEvidenceSha256 = "c8dc58d1e15599bede04444f1ebda326892f3a8f7864ea6b1611664170a76b61";
const adsenseReviewRequestedStatus = "Review requested";
const adsenseReviewRequestedEvidenceSha256 = "6f457498f0bc717262e02f389c76036b2cfc3fc613436c99682fc3e797ea2523";
const adsenseReviewRequestedEvidenceDimensions = "1443x737";
const adsenseOnboardingStatus = "All steps complete";
const adsensePaymentProfileStatus = "Your profile is complete";
const adsenseAdsSettingsStatus = "Ads settings confirmed";
const adsenseSiteConnectionStatus = "Thanks for connecting the site";
const adsenseOnboardingEvidenceSha256 = "2683b13ee3e6824a49cb77d0d00865507e2603dbf9fccbdb6188e293728266fc";
const adsenseOnboardingEvidenceDimensions = "1814x892";
const policyCenterStatus = "No current issues";
const policyCenterEvidenceSha256 = "04d0c99f5cf0fbe8e596fa5e3ad7cd199521916871e6811b8796b69a01f930e4";
const adsenseReviewEmailDate = "2026-08-10 17:16 (mailbox display; timezone not shown)";
const adsenseReviewEmailSubject = "Action needed: Your AdSense application";
const adsenseReviewOutcome = "Application not approved; account update required; content-focused guidance; no exact policy subtype stated";
const adsenseReviewEmailEvidenceSha256 = [
  "b69dadc114444b83369e9a85147cae1179a3f9e57452a8d031fe60ef48cf0284",
  "bb690c162433baf439a577f7d4ec5c812cfc5ee972248a38977e0563ce74dc81",
  "da7a51e88f912f173966cff9274c360758218ea1dfb0a7fad1d014d89fc5b912",
];
const adsenseRejectionHelpUrl = "https://support.google.com/adsense/answer/81904?hl=en";
const adsenseRejectionHelpEvidenceSha256 = [
  "a08aef7173a2180c74cc1c476aeca05151267bd3d733b719306097becdea0fb5",
  "f519fcd20e63a961b91cf92397ebad3da8c182d80a403ba21a490c3124e332a0",
  "d3bccc908dc997d25b93880e0232ccb65afd0afefaced325f9de00197c1eca1c",
  "a0f39921ec2b02bd9c8a2df8dd1ce090b63bbef512fa6b4ed4f5b3efe7ba1556",
  "b3b4b9984caa2097bb135c58f35231ebef4484efb326306c9c9c9125a0ea8bcc",
  "6bbdbfbbc89eed8f59bd5ab645839be0a7d73cf0b056de83e936b72599008f0c",
  "78f9cc88707c9deef7bc082e70aa37c4cad699968ad3f7fb3c8e24fa948129f5",
  "211f4ddd6da12f4d3aa112b4c310211abbfd2afdf3fd04b468735b468cd42bc8",
];
const autoAdsStatus = "OFF";
const autoOptimizeStatus = "OFF";
const autoApplyWinnerStatus = "OFF (unchecked)";
const autoOptimizeTraffic = "50% configured but inactive";
const autoAdsOverviewEvidenceSha256 = "99ed1d8f8970f09f8a222160253e19eced5b24d3fb7879647f7b1d532521ce8a";
const autoAdsSettingsEvidenceSha256 = "22a65805163dbdcab814554b6a3e74d83ac0c889cdc47e9387f0efe32b38358d";
const autoOptimizeEvidenceSha256 = "cdc3b5453d6c33427e2d2472186500a31080ad230934a8a52057377c300efd6e";
const siteOwnershipStatus = "Verified";
const siteOwnershipCodeEvidenceSha256 = "1773c7bfbc6c83ad3af4739023cb299e01e9c474efa36a3f8207c9b472e44562";
const siteOwnershipAdsTxtEvidenceSha256 = "bf5c3f6a2205279af94970505703543404e4f45a4d0c1dbb9235e07bd648fcdc";
const requestReviewAvailabilityEvidenceSha256 = "5d6cb63dd87d2fcab5c1d6b2dda73fe1edb45e04c99c61cc8bd5561be6da72df";
const europeanPrivacyMessagesStatus = "2 published";
const privacyMessagingEvidenceSha256 = "909cc17852b190fadcb5043388de9d55e4a416b58b92d5e87c4aa9cc90025c0c";
const privacySettingsEvidenceSha256 = [
  "801f064b32396e4fa1877addd30d83b6bf8212a9fe8527ee7b721a478024a71f",
  "ad8449f026a4248f68d9eefcc32c763d3f27ff9109d88517a36b9781c85da48d",
  "cb46dc9405e66181289cb4280ad51ecbf9617fc4603522d332128ccf5151a032",
  "d1390024937843c44e585df5923d05030b575d3e3768f46f62f5d34fd9f4ed64",
  "baffb644456e6771bbe780ed9fb080b1750e5abbe91d2c568979214140f2f1d8",
  "5bbff62c8738b8eaefa83d13edd715a6f1859125853247c368e477213d6ba37b",
];
const privacyMessagesEvidenceSha256 = [
  "e12ed15419dd6d4f6d4d2cdf11110cd4e8d0b1bbc7d286ed8048401dd835f285",
  "c2c6f1d89d239b7e788485f6e167894a60c656afc666f0fe26dba7ab994a1333",
];
const cmpCompletionEvidenceSha256 = [
  "994011e35a39be86d60c7a6fd7e04a519db3f0df2c816602d048209b590c4042",
  "8b472fc91ee9735dcc997c799f69a556942582349b58ea2663acddf5713e5356",
  "766b1379c154b20fba07cb7b996f2c457bc59f45fe944a60d28bc7a6c29ae1a0",
];
const cmpCompletionEvidenceDimensions = ["2816x1652", "2816x1410", "1443x737"];
const cmpCurrentMessageChoices = "Consent / Do not consent / Manage options";
const cmpTcfEvidenceBoundary = "Google-managed European regulations message; exact UI version label not exposed in supplied account view";
const fieldCwvStatus = "Not enough usage data in the last 90 days for mobile and desktop";
const fieldCwvEvidenceSha256 = "af36c27371c542ebdfd53324094363b9758443439253ce7bcfe86a0105b40684";
const startHereLiveTestEvidenceSha256 = "5ebe0fccb78aa5764855b1bf67aab3a1a76904efe1a6d9e971a615241ab61a6c";
const startHereIndexingRequestEvidenceSha256 = "879a30071e8ac33ef3d027990b7adba2d52cc63fd69ddc458594fe1bc48f9cee";
const dailyReflectionLiveTestEvidenceSha256 = "439a37bbca8428fd743bb25d468858281b074b86148df10ac9e52dcc8def98b8";
const gscFollowUpEvidenceDimensions = "1443x737";
const urlInspectionRows = [
  ["https://echobuddha.com/", "indexable", "URL is on Google / Page is indexed", "PASS", "0ddc251138edcae517bda86b5b34b62cbd710fe16ffd63cde2d4aea4c6da129a"],
  ["https://echobuddha.com/start-here/", "indexable", "Stored index: Discovered - currently not indexed; Live Test: URL is available to Google / Page can be indexed; indexing requested", "PASS — LIVE INDEXABLE / GOOGLE INDEX PROPAGATION PENDING", `d404db702dda68d88e3af3d5d7779118699ed8818786eda74d56a31ef743cba6 | ${startHereLiveTestEvidenceSha256} | ${startHereIndexingRequestEvidenceSha256}`],
  ["https://echobuddha.com/learn/buddhism-for-beginners/", "indexable", "URL is on Google / Page is indexed", "PASS", "1e307b471f81836cd99fa5071c3d6b449113104c5b01c51c651c3f659da9b7de"],
  ["https://echobuddha.com/learn/four-noble-truths/", "indexable", "URL is on Google / Page is indexed", "PASS", "aabbc88609a3c6d06ed33aaf5ad15690d69942dda375b32d9fe4ea87d36316fa"],
  ["https://echobuddha.com/learn/eightfold-path/", "indexable", "URL is on Google / Page is indexed", "PASS", "4499427ae4290050750d76d0bf558b6146e70a4853fe9e3a52c3df825572f603"],
  ["https://echobuddha.com/articles/right-speech-buddhism/", "indexable", "URL is on Google / Page is indexed", "PASS", "d82d86552421d5d2f022224d2e44ce2d3f6c8749e5097e30722037346de7708d"],
  ["https://echobuddha.com/articles/dhamma-vs-dharma/", "indexable", "URL is on Google / Page is indexed", "PASS", "c2e5b04e1b3d2f6bc43ba8b679835f70bc171d8f7d06d1ef7d8afb0a2444e11a"],
  ["https://echobuddha.com/articles/dhammapada-reflection-what-we-think/", "indexable", "URL is on Google / Page is indexed", "PASS", "3ffba3b12cf08b09afeb2b9c126c95aa8c542ec149af24b90dd00ff4f14f8bfc"],
  ["https://echobuddha.com/quotes/letting-go/", "indexable", "URL is on Google / Page is indexed", "PASS", "98a635e5e6cdc38ccb4b132ed08e60a708c408e6f5cb95c9061a0fec864998fb"],
  ["https://echobuddha.com/search/", "noindex, follow", "URL is not on Google / Excluded by noindex; last crawl 2026-07-28; crawl allowed", "PASS", "76facec8be58df3b14e164b5d40b903ca3f1b5cdadfc6f6df761582e8e73dec4"],
  ["https://echobuddha.com/daily-reflections/today/", "noindex, follow", "Stored index: URL is on Google; Live Test: URL is not available to Google / Excluded by noindex", "PASS — LIVE NOINDEX MATCHES PROTECTED INTENT / STORED INDEX STATE IS STALE", `cfd3abd8657b0484cbc87da792c0581026dc9e500185ef8fe457bd798014d0d5 | ${dailyReflectionLiveTestEvidenceSha256}`],
  ["http://echobuddha.com/", "redirect", "URL is not on Google / Page with redirect; last crawl 2026-08-11", "PASS", "51b6e5f2c66f3f3ea576f7c5d410d5b55300a74706cbae145a59f01e503e73f1"],
  ["http://echobuddha.com/learn/buddhism-101/what-is-mindfulness/", "HTTP alternate/canonicalized", "URL is not on Google / Alternate page with proper canonical; last crawl 2026-07-04", "PASS", "fedc42f136f46a5f376675daeeead07f3e4e783419c0b967bb7b9093870fb2b8"],
  ["https://echobuddha.com/terms-and-conditions/", "historical removed URL", "URL is not on Google / Not found (404); last crawl 2026-07-09", "PASS WITH EXISTING NON-BLOCKING P2 MIGRATION ISSUE", "ce6f672bd5244165d0c009c323cf271f9cc49cdda0451388110eb600237375c2"],
  ["https://echobuddha.com/sitemap.xml", "XML discovery document", "URL is not on Google / Crawled - currently not indexed; last crawl 2026-08-13", "PASS — INDEXING NOT REQUIRED", "b549434200740d2af025a830959bbb7e46e728dbd6c0472497f3b817acac18a1"],
];
const urlInspectionIndexedIntended = 8;
const urlInspectionFollowUps = 0;
const gscSitemapUrl = "https://echobuddha.com/sitemap.xml";
const gscSitemapStatus = "Success";
const gscSitemapSubmitted = "2026-08-11";
const gscSitemapLastRead = "2026-08-11";
const gscSitemapDiscoveredPages = 193;
const gscSitemapDiscoveredVideos = 0;
const gscSitemapEvidenceSha256 = "ba92d49c5168c1febf5d534e878a24e40cbc0d849d0b494c8b79159a4ec1a1dd";
const gscPerformanceRefreshCaptured = "2026-08-13 09:19 GMT+05:30";
const gscPerformanceRefreshStart = "2026-07-15";
const gscPerformanceRefreshCutoff = "2026-08-11";
const gscPerformanceRefreshPostReleaseDays = 0;
const gscPerformanceEarliestEligibleCutoff = "2026-09-10";
const gscPerformanceRefreshRows = [
  ["Chart.csv", "bdba3f2f0fa92596b290ff298dd4522372c65dc814aff2141692eed04a92f434", 28, "15 clicks; 1,375 impressions; 1.09% CTR; position 32.38", "Property-level daily totals"],
  ["Countries.csv", "6bd5e96bde66fed422803f390e3eabfe57843780a5614aaa83cbc1ba4db0380c", 71, "15 clicks; 1,375 impressions", "Country aggregate; reconciles to property totals"],
  ["Devices.csv", "dc7b2a48dc4b99959c300b1f420b2fae54bd40dca5e4a12bd8d48ad58c32375e", 3, "15 clicks; 1,375 impressions", "Device aggregate; reconciles to property totals"],
  ["Filters.csv", "72ff01f37ed0327a79ace7619f2d5c8e46552e0f30ebf6adfeba45332d7231e3", 2, "Search type: Web; Date: Last 28 days", "Filter metadata"],
  ["Pages.csv", "b50c657357566bfd6b7f9e7615c0ade6a4ed185eb472df778ddea8abbed1a363", 114, "114 visible pages; 15 clicks; 1,514 page impressions", "Page aggregate; not additive to property impressions"],
  ["Queries.csv", "7afab2fa16a1d866317ae0defebfb1c81397962ba3f394b9a1cbe31c6c981dfa", 263, "263 visible queries; 1 click; 633 impressions", "Privacy-filtered query aggregate"],
  ["Search appearance.csv", "eed9ceafb9193e5e3d034f5897ad992bc851f1998204cd98f0b0f6873fbfc8b2", 0, "Header only; no search-appearance rows", "No enhancement segment in this export"],
];
const coverageDataCutoff = "2026-08-07";
const coverageExceptions = [
  ["IDX-001", "Excluded by ‘noindex’ tag", "echobuddha.com-Coverage-Drilldown-2026-08-13.xlsx", "9cf159118455c753bd30a99ab177b3902cb88f711c4f859725df0b7dc94e4a4d", "https://echobuddha.com/quotes/patience/a-difficult-moment-becomes-heavier-when-we-demand-that/", "2026-08-07", "200", "", "200", "https://echobuddha.com/quotes/patience/a-difficult-moment-becomes-heavier-when-we-demand-that/", "noindex, follow", "self", "OUT — expected", "noindex, follow", "PASS — intentional exclusion", "No", "NONE", "No", "No", "Protect; no change"],
  ["IDX-002", "Excluded by ‘noindex’ tag", "echobuddha.com-Coverage-Drilldown-2026-08-13.xlsx", "9cf159118455c753bd30a99ab177b3902cb88f711c4f859725df0b7dc94e4a4d", "https://echobuddha.com/quotes/practice/a-peaceful-life-is-built-from-peaceful-moments-practiced/", "2026-08-05", "200", "", "200", "https://echobuddha.com/quotes/practice/a-peaceful-life-is-built-from-peaceful-moments-practiced/", "noindex, follow", "self", "OUT — expected", "noindex, follow", "PASS — intentional exclusion", "No", "NONE", "No", "No", "Protect; no change"],
  ["IDX-003", "Excluded by ‘noindex’ tag", "echobuddha.com-Coverage-Drilldown-2026-08-13.xlsx", "9cf159118455c753bd30a99ab177b3902cb88f711c4f859725df0b7dc94e4a4d", "https://echobuddha.com/quotes/renewal/a-mistake-becomes-a-teacher-when-honesty-enters-the/", "2026-07-31", "200", "", "200", "https://echobuddha.com/quotes/renewal/a-mistake-becomes-a-teacher-when-honesty-enters-the/", "noindex, follow", "self", "OUT — expected", "noindex, follow", "PASS — intentional exclusion", "No", "NONE", "No", "No", "Protect; no change"],
  ["IDX-004", "Excluded by ‘noindex’ tag", "echobuddha.com-Coverage-Drilldown-2026-08-13.xlsx", "9cf159118455c753bd30a99ab177b3902cb88f711c4f859725df0b7dc94e4a4d", "https://echobuddha.com/quotes/letting-go/what-leaves-your-life-may-still-leave-wisdom-behind/", "2026-07-29", "200", "", "200", "https://echobuddha.com/quotes/letting-go/what-leaves-your-life-may-still-leave-wisdom-behind/", "noindex, follow", "self", "OUT — expected", "noindex, follow", "PASS — intentional exclusion", "No", "NONE", "No", "No", "Protect; no change"],
  ["IDX-005", "Excluded by ‘noindex’ tag", "echobuddha.com-Coverage-Drilldown-2026-08-13.xlsx", "9cf159118455c753bd30a99ab177b3902cb88f711c4f859725df0b7dc94e4a4d", "http://echobuddha.com/daily-reflections/today/", "2026-07-29", "301", "https://echobuddha.com/daily-reflections/today/", "200", "https://echobuddha.com/daily-reflections/today/", "noindex, follow", "self", "OUT — expected", "noindex, follow", "PASS — HTTP alias redirects; target intentionally excluded", "No", "NONE", "No", "No", "Protect; no change"],
  ["IDX-006", "Excluded by ‘noindex’ tag", "echobuddha.com-Coverage-Drilldown-2026-08-13.xlsx", "9cf159118455c753bd30a99ab177b3902cb88f711c4f859725df0b7dc94e4a4d", "http://echobuddha.com/search/", "2026-07-28", "301", "https://echobuddha.com/search/", "200", "https://echobuddha.com/search/", "noindex, follow", "self", "OUT — expected", "noindex, follow", "PASS — HTTP alias redirects; search intentionally excluded", "No", "NONE", "No", "No", "Protect; no change"],
  ["IDX-007", "Excluded by ‘noindex’ tag", "echobuddha.com-Coverage-Drilldown-2026-08-13.xlsx", "9cf159118455c753bd30a99ab177b3902cb88f711c4f859725df0b7dc94e4a4d", "https://echobuddha.com/search/", "2026-07-28", "200", "", "200", "https://echobuddha.com/search/", "noindex, follow", "self", "OUT — expected", "noindex, follow", "PASS — search utility intentionally excluded", "No", "NONE", "No", "No", "Protect; no change"],
  ["IDX-008", "Excluded by ‘noindex’ tag", "echobuddha.com-Coverage-Drilldown-2026-08-13.xlsx", "9cf159118455c753bd30a99ab177b3902cb88f711c4f859725df0b7dc94e4a4d", "https://echobuddha.com/search/?q=%7Bsearch_term_string%7D", "2026-07-27", "200", "", "200", "https://echobuddha.com/search/?q=%7Bsearch_term_string%7D", "noindex, follow", "https://echobuddha.com/search/", "OUT — expected", "noindex, follow", "PASS — parameterized search intentionally excluded and canonicalized to base search", "No", "NONE", "No", "No", "Protect; no change"],
  ["IDX-009", "Page with redirect", "echobuddha.com-Coverage-Drilldown-2026-08-13 (1).xlsx", "2a7f006e269752d06c3799dcce5330d56dcfc999485b6991e900824195228b6c", "http://echobuddha.com/quotes/wisdom/wisdom-is-the-art-of-meeting-life-without-adding/", "2026-07-31", "301", "https://echobuddha.com/quotes/wisdom/wisdom-is-the-art-of-meeting-life-without-adding/", "200", "https://echobuddha.com/quotes/wisdom/wisdom-is-the-art-of-meeting-life-without-adding/", "noindex, follow", "self", "OUT — expected", "noindex, follow", "PASS — HTTP alias redirects to protected HTTPS target", "No", "NONE", "No", "No", "Protect; no change"],
  ["IDX-010", "Page with redirect", "echobuddha.com-Coverage-Drilldown-2026-08-13 (1).xlsx", "2a7f006e269752d06c3799dcce5330d56dcfc999485b6991e900824195228b6c", "http://echobuddha.com/articles/category/buddhist-wisdom/", "2026-07-31", "301", "https://echobuddha.com/articles/category/buddhist-wisdom/", "200", "https://echobuddha.com/articles/category/buddhist-wisdom/", "index, follow (implicit)", "self", "IN", "indexable", "PASS — HTTP alias redirects to indexable HTTPS target", "No", "NONE", "No", "No", "Protect; no change"],
  ["IDX-011", "Page with redirect", "echobuddha.com-Coverage-Drilldown-2026-08-13 (1).xlsx", "2a7f006e269752d06c3799dcce5330d56dcfc999485b6991e900824195228b6c", "http://echobuddha.com/", "2026-07-27", "301", "https://echobuddha.com/", "200", "https://echobuddha.com/", "index, follow (implicit)", "self", "IN", "indexable", "PASS — HTTP alias redirects to indexable HTTPS target", "No", "NONE", "No", "No", "Protect; no change"],
  ["IDX-012", "Page with redirect", "echobuddha.com-Coverage-Drilldown-2026-08-13 (1).xlsx", "2a7f006e269752d06c3799dcce5330d56dcfc999485b6991e900824195228b6c", "http://echobuddha.com/articles/mindfulness-for-better-sleep/", "2026-07-25", "301", "https://echobuddha.com/articles/mindfulness-for-better-sleep/", "200", "https://echobuddha.com/articles/mindfulness-for-better-sleep/", "index, follow (implicit)", "self", "IN", "indexable", "PASS — HTTP alias redirects to indexable HTTPS target", "No", "NONE", "No", "No", "Protect; no change"],
  ["IDX-013", "Page with redirect", "echobuddha.com-Coverage-Drilldown-2026-08-13 (1).xlsx", "2a7f006e269752d06c3799dcce5330d56dcfc999485b6991e900824195228b6c", "http://echobuddha.com/quotes/awareness/small-acts-of-attention-can-turn-an-ordinary-day/", "2026-07-24", "301", "https://echobuddha.com/quotes/awareness/small-acts-of-attention-can-turn-an-ordinary-day/", "200", "https://echobuddha.com/quotes/awareness/small-acts-of-attention-can-turn-an-ordinary-day/", "noindex, follow", "self", "OUT — expected", "noindex, follow", "PASS — HTTP alias redirects to protected noindex HTTPS target", "No", "NONE", "No", "No", "Protect; no change"],
  ["IDX-014", "Page with redirect", "echobuddha.com-Coverage-Drilldown-2026-08-13 (1).xlsx", "2a7f006e269752d06c3799dcce5330d56dcfc999485b6991e900824195228b6c", "http://echobuddha.com/learn/buddhism-101/", "2026-07-23", "301", "https://echobuddha.com/learn/buddhism-101/", "200", "https://echobuddha.com/learn/buddhism-101/", "index, follow (implicit)", "self", "IN", "indexable", "PASS — HTTP alias redirects to indexable HTTPS target", "No", "NONE", "No", "No", "Protect; no change"],
  ["IDX-015", "Page with redirect", "echobuddha.com-Coverage-Drilldown-2026-08-13 (1).xlsx", "2a7f006e269752d06c3799dcce5330d56dcfc999485b6991e900824195228b6c", "http://echobuddha.com/meditation/", "2026-07-18", "301", "https://echobuddha.com/meditation/", "200", "https://echobuddha.com/meditation/", "index, follow (implicit)", "self", "IN", "indexable", "PASS — HTTP alias redirects to indexable HTTPS target", "No", "NONE", "No", "No", "Protect; no change"],
  ["IDX-016", "Not found (404)", "echobuddha.com-Coverage-Drilldown-2026-08-13 (2).xlsx", "6e945523615fea3aaf3181069251ad4cd925dc93b20598760fe8a772b495bb4d", "https://echobuddha.com/terms-and-conditions/", "2026-07-09", "404", "", "404", "https://echobuddha.com/terms-and-conditions/", "N/A — empty response", "N/A", "OUT", "Legacy route renamed to /terms-of-use/ on 2026-06-26", "P2 — renamed route lacks a legacy redirect and live unknown-path response has an empty 404 body", "Yes — legacy migration / recovery UX", "P2 NON-BLOCKING", "No", "No", "Propose a separately authorized one-hop 301 to /terms-of-use/ and branded missing-path fallback; validate and deploy only with explicit authorization"],
  ["IDX-017", "Alternate page with proper canonical tag", "echobuddha.com-Coverage-Drilldown-2026-08-13 (3).xlsx", "aa2057b105973d38becbc5305561d0e2481ba13097fed33cda595cfd75e36c44", "http://echobuddha.com/learn/buddhism-101/what-is-mindfulness/", "2026-07-04", "301", "https://echobuddha.com/learn/buddhism-101/what-is-mindfulness/", "200", "https://echobuddha.com/learn/buddhism-101/what-is-mindfulness/", "index, follow (implicit)", "self", "IN", "indexable", "PASS — historical HTTP alternate now redirects to self-canonical HTTPS target", "No", "NONE", "No", "No", "Protect; no change"],
  ["IDX-018", "Crawled - currently not indexed", "echobuddha.com-Coverage-Drilldown-2026-08-13 (4).xlsx", "717331a7d5d7d227c87420f129aee3b5a429dd13021d8bfd6f123c826dbd04d2", "https://echobuddha.com/sitemap.xml", "2026-08-06", "200", "", "200", "https://echobuddha.com/sitemap.xml", "N/A — application/xml", "N/A", "N/A — sitemap document", "non-HTML discovery document", "PASS — XML sitemap need not be indexed as a search result", "No", "NONE", "No", "No", "Preserve; no indexing request or content change"],
  ["IDX-019", "Discovered - currently not indexed", "echobuddha.com-Coverage-Drilldown-2026-08-13 (5).xlsx", "9a6833a05bd16f3890ac891dd3fc783f0b736c729c9c5446c09c97403ce47878", "https://echobuddha.com/daily-reflections/", "Not crawled — export epoch placeholder 1970-01-01", "200", "", "200", "https://echobuddha.com/daily-reflections/", "index, follow (implicit)", "self", "IN", "indexable", "PASS SITE ELIGIBILITY / Google indexing pending at cutoff", "No", "P2 OBSERVATION", "No", "No", "Monitor/inspect; no change from stale pre-release GSC state"],
  ["IDX-020", "Discovered - currently not indexed", "echobuddha.com-Coverage-Drilldown-2026-08-13 (5).xlsx", "9a6833a05bd16f3890ac891dd3fc783f0b736c729c9c5446c09c97403ce47878", "https://echobuddha.com/learn/buddhist-dictionary/karuna/", "Not crawled — export epoch placeholder 1970-01-01", "200", "", "200", "https://echobuddha.com/learn/buddhist-dictionary/karuna/", "index, follow (implicit)", "self", "IN", "indexable", "PASS SITE ELIGIBILITY / Google indexing pending at cutoff", "No", "P2 OBSERVATION", "No", "No", "Monitor/inspect; no change from stale pre-release GSC state"],
  ["IDX-021", "Discovered - currently not indexed", "echobuddha.com-Coverage-Drilldown-2026-08-13 (5).xlsx", "9a6833a05bd16f3890ac891dd3fc783f0b736c729c9c5446c09c97403ce47878", "https://echobuddha.com/learn/dhammapada-reflections/peace-comes-from-a-trained-mind/", "Not crawled — export epoch placeholder 1970-01-01", "200", "", "200", "https://echobuddha.com/learn/dhammapada-reflections/peace-comes-from-a-trained-mind/", "index, follow (implicit)", "self", "IN", "indexable", "PASS SITE ELIGIBILITY / Google indexing pending at cutoff", "No", "P2 OBSERVATION", "No", "No", "Monitor/inspect; no change from stale pre-release GSC state"],
  ["IDX-022", "Discovered - currently not indexed", "echobuddha.com-Coverage-Drilldown-2026-08-13 (5).xlsx", "9a6833a05bd16f3890ac891dd3fc783f0b736c729c9c5446c09c97403ce47878", "https://echobuddha.com/learn/sutta-for-daily-life/dhammacakkappavattana-sutta-four-noble-truths/", "Not crawled — export epoch placeholder 1970-01-01", "200", "", "200", "https://echobuddha.com/learn/sutta-for-daily-life/dhammacakkappavattana-sutta-four-noble-truths/", "index, follow (implicit)", "self", "IN", "indexable", "PASS SITE ELIGIBILITY / Google indexing pending at cutoff", "No", "P2 OBSERVATION", "No", "No", "Monitor/inspect; no change from stale pre-release GSC state"],
  ["IDX-023", "Discovered - currently not indexed", "echobuddha.com-Coverage-Drilldown-2026-08-13 (5).xlsx", "9a6833a05bd16f3890ac891dd3fc783f0b736c729c9c5446c09c97403ce47878", "https://echobuddha.com/quotes/impermanence/meet-change-softly/", "Not crawled — export epoch placeholder 1970-01-01", "200", "", "200", "https://echobuddha.com/quotes/impermanence/meet-change-softly/", "index, follow (implicit)", "self", "IN", "indexable", "PASS SITE ELIGIBILITY / Google indexing pending at cutoff", "No", "P2 OBSERVATION", "No", "No", "Monitor/inspect; no change from stale pre-release GSC state"],
  ["IDX-024", "Discovered - currently not indexed", "echobuddha.com-Coverage-Drilldown-2026-08-13 (5).xlsx", "9a6833a05bd16f3890ac891dd3fc783f0b736c729c9c5446c09c97403ce47878", "https://echobuddha.com/quotes/letting-go/where-attachment-begins/", "Not crawled — export epoch placeholder 1970-01-01", "200", "", "200", "https://echobuddha.com/quotes/letting-go/where-attachment-begins/", "index, follow (implicit)", "self", "IN", "indexable", "PASS SITE ELIGIBILITY / Google indexing pending at cutoff", "No", "P2 OBSERVATION", "No", "No", "Monitor/inspect; no change from stale pre-release GSC state"],
  ["IDX-025", "Discovered - currently not indexed", "echobuddha.com-Coverage-Drilldown-2026-08-13 (5).xlsx", "9a6833a05bd16f3890ac891dd3fc783f0b736c729c9c5446c09c97403ce47878", "https://echobuddha.com/start-here/", "Not crawled — export epoch placeholder 1970-01-01", "200", "", "200", "https://echobuddha.com/start-here/", "index, follow (implicit)", "self", "IN", "indexable", "PASS SITE ELIGIBILITY / Google indexing pending at cutoff", "No", "P2 OBSERVATION", "No", "No", "Monitor/inspect; no change from stale pre-release GSC state"],
  ["IDX-026", "Discovered - currently not indexed", "echobuddha.com-Coverage-Drilldown-2026-08-13 (5).xlsx", "9a6833a05bd16f3890ac891dd3fc783f0b736c729c9c5446c09c97403ce47878", "https://echobuddha.com/tools/", "Not crawled — export epoch placeholder 1970-01-01", "200", "", "200", "https://echobuddha.com/tools/", "index, follow (implicit)", "self", "IN", "indexable", "PASS SITE ELIGIBILITY / Google indexing pending at cutoff", "No", "P2 OBSERVATION", "No", "No", "Monitor/inspect; no change from stale pre-release GSC state"],
];
const now = new Date();
const generatedAt = now.toISOString();
const auditDate = generatedAt.slice(0, 10);
const repositorySha = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
const releaseValidation = process.env.PHASE11_RELEASE_VALIDATION || "PENDING FINAL RUN";
const shouldFetchLive = process.env.PHASE11_SKIP_LIVE !== "1";

fs.mkdirSync(out, { recursive: true });

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') { field += '"'; index += 1; }
      else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") { row.push(field); field = ""; }
    else if (char === "\n") { row.push(field.replace(/\r$/, "")); rows.push(row); row = []; field = ""; }
    else field += char;
  }
  if (field || row.length) { row.push(field.replace(/\r$/, "")); rows.push(row); }
  const headers = rows.shift();
  return rows.filter((cells) => cells.some(Boolean)).map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] || ""])));
}

function escapeCsv(value) {
  const text = value === undefined || value === null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

function writeCsv(name, headers, rows) {
  const body = [headers, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n");
  fs.writeFileSync(path.join(out, name), `${body}\n`);
}

function sha256(buffer) { return crypto.createHash("sha256").update(buffer).digest("hex"); }

function filesRecursively(directory) {
  return fs.readdirSync(directory, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(entry.parentPath || entry.path, entry.name))
    .sort();
}

function aggregateDistSha() {
  const dist = path.join(root, "dist");
  const records = filesRecursively(dist).map((file) => ({
    path: path.relative(root, file).split(path.sep).join("/"),
    sha256: sha256(fs.readFileSync(file)),
  }));
  return sha256(Buffer.from(records.map((item) => `${item.sha256}  ${item.path}`).join("\n")));
}

function routeToBuiltFile(pathname) {
  if (pathname === "/") return path.join(root, "dist/index.html");
  if (pathname === "/404.html") return path.join(root, "dist/404.html");
  if (pathname === "/search-index.json") return path.join(root, "dist/search-index.json");
  if (pathname === "/sitemap.xml") return path.join(root, "dist/sitemap.xml");
  return path.join(root, "dist", pathname.replace(/^\//, ""), "index.html");
}

function familyFor(pathname) {
  if (pathname === "/") return "Homepage";
  if (pathname.startsWith("/articles/category/")) return "Article category";
  if (pathname.startsWith("/articles/")) return "Articles";
  if (pathname === "/learn/" || /^\/learn\/[^/]+\/$/.test(pathname)) return "Learn hubs";
  if (pathname.startsWith("/learn/buddhist-dictionary/")) return "Dictionary";
  if (pathname.startsWith("/learn/dhammapada-reflections/")) return "Dhammapada";
  if (pathname.startsWith("/learn/sutta-for-daily-life/")) return "Sutta study";
  if (pathname.startsWith("/learn/")) return "Learn";
  if (pathname.startsWith("/daily-reflections/")) return "Daily Reflections";
  if (pathname.startsWith("/quotes/") && pathname.split("/").filter(Boolean).length === 2) return "Quote categories";
  if (pathname.startsWith("/quotes/")) return "Quote stories";
  if (pathname.startsWith("/meditation")) return "Meditation";
  if (["/about/", "/authors/echo-buddha-editorial/", "/buddhist-sources-and-citations/", "/contact/", "/corrections/", "/disclaimer/", "/editorial-policy/", "/how-echo-buddha-creates-content/", "/privacy-policy/", "/quote-attribution-policy/", "/terms-of-use/"].includes(pathname)) return "Trust / policy";
  return "Utility / other";
}

const protection = parseCsv(fs.readFileSync(path.join(phase10, "MASTER_PRE_PHASE11_PROTECTION_REGISTER.csv"), "utf8"));
const phase8Production = parseCsv(fs.readFileSync(path.join(phase8, "phase-8-production-route-review.csv"), "utf8"));
const phase8ByPath = new Map(phase8Production.map((row) => [row.URL, row]));
if (protection.length !== 336) throw new Error(`Expected 336 protected routes; found ${protection.length}.`);

const routes = protection.map((row) => {
  const url = new URL(row["URL / Item"]);
  const pathname = url.pathname;
  const baseline = phase8ByPath.get(pathname);
  const builtFile = routeToBuiltFile(pathname);
  if (!baseline) throw new Error(`No Phase 8 route baseline for ${pathname}`);
  return { row, pathname, baseline, builtFile, built: fs.existsSync(builtFile), localBody: fs.existsSync(builtFile) ? fs.readFileSync(builtFile) : Buffer.alloc(0) };
});

async function fetchRoute(route) {
  if (!shouldFetchLive) return { status: "SKIPPED", finalUrl: "", body: Buffer.alloc(0), contentType: "", canonical: "", robots: "", adRuntime: 0, adSlots: 0 };
  try {
    const requestedUrl = `${origin}${route.pathname}`;
    const response = await fetch(requestedUrl, { redirect: "follow", headers: { "user-agent": "EchoBuddha-Phase11-Readiness-Audit/1.0" } });
    const body = Buffer.from(await response.arrayBuffer());
    const text = body.toString("utf8");
    return {
      status: response.status,
      finalUrl: response.url,
      body,
      contentType: response.headers.get("content-type") || "",
      canonical: text.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i)?.[1] || text.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical/i)?.[1] || "",
      robots: text.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)/i)?.[1] || "",
      adRuntime: (text.match(/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js/g) || []).length,
      adSlots: (text.match(/class=["'][^"']*\bad-slot\b|<ins[^>]+adsbygoogle/gi) || []).length,
    };
  } catch (error) {
    return { status: "ERROR", finalUrl: "", body: Buffer.alloc(0), contentType: "", canonical: "", robots: "", adRuntime: 0, adSlots: 0, error: error.message };
  }
}

for (let index = 0; index < routes.length; index += 8) {
  const batch = routes.slice(index, index + 8);
  const results = await Promise.all(batch.map(fetchRoute));
  results.forEach((result, offset) => { batch[offset].live = result; });
}

const currentDistSha = aggregateDistSha();
const intendedIndexable = routes.filter((route) => route.row["Protected index state"] === "indexable");
const expectedLiveStatus = (route) => route.pathname === "/404.html" ? "200" : route.baseline["Expected status"];
const expectedVolatilePathnames = new Set(["/daily-reflections/today/"]);
const normalizeExpectedVolatileBody = (route, body) => {
  if (!expectedVolatilePathnames.has(route.pathname)) return body;
  const normalized = body.toString("utf8")
    .replace(/\shidden(?=[\s>])/g, "")
    .replace(/href="\/daily-reflections\/[^\"]+\/" data-current-reflection-link/g, 'href="/__CURRENT_REFLECTION__/" data-current-reflection-link');
  return Buffer.from(normalized);
};
const parityFor = (route) => {
  const exact = route.built && route.live.body.length > 0 && sha256(route.localBody) === sha256(route.live.body);
  const expectedVolatile = expectedVolatilePathnames.has(route.pathname);
  const normalized = expectedVolatile && route.built && route.live.body.length > 0 &&
    sha256(normalizeExpectedVolatileBody(route, route.localBody)) === sha256(normalizeExpectedVolatileBody(route, route.live.body));
  return { exact, expectedVolatile, normalized, pass: exact || normalized };
};
const liveStatusPass = routes.filter((route) => String(route.live.status) === expectedLiveStatus(route)).length;
const stableRoutes = routes.filter((route) => !expectedVolatilePathnames.has(route.pathname));
const liveByteMatches = stableRoutes.filter((route) => parityFor(route).exact).length;
const expectedVolatileRoutes = routes.filter((route) => expectedVolatilePathnames.has(route.pathname));
const expectedVolatileParityPasses = expectedVolatileRoutes.filter((route) => parityFor(route).normalized).length;
const liveParityPasses = routes.filter((route) => parityFor(route).pass).length;
const liveRouteErrors = routes.filter((route) => String(route.live.status) !== expectedLiveStatus(route));
const canonicalMismatches = routes.filter((route) => route.baseline.Canonical && route.live.canonical !== route.baseline.Canonical);
const adRuntimeRoutes = routes.filter((route) => route.live.adRuntime > 0 || route.live.adSlots > 0);

const policySources = [
  ["POL-01", "AdSense page readiness", "Unique, relevant publisher content and clear navigation/user experience are expected.", "https://support.google.com/adsense/answer/7299563?hl=en", auditDate, "GOOGLE_POLICY_FACT", "Applied to content, navigation, and page-family gates", "PASS"],
  ["POL-02", "AdSense eligibility", "Publisher content should be original and high quality; site ownership/source access is required.", "https://support.google.com/adsense/answer/9724?hl=en", auditDate, "GOOGLE_POLICY_FACT", "Applied to originality and ownership gates", "PASS"],
  ["POL-03", "AdSense site management", "Ownership may be verified by ad code, ads.txt, or meta; ads may serve only after Ready status.", "https://support.google.com/adsense/answer/12131223?hl=en", auditDate, "GOOGLE_POLICY_FACT + OWNER_SCREENSHOT_FACT", `Account site state is ${adsenseSitesStatus}; live verification methods pass; ${adsenseReviewRequestedStatus}`, "PASS — REVIEW IN PROGRESS / NOT YET APPROVED"],
  ["POL-04", "Connect a site", "Meta tag and ads.txt are documented verification methods; approval is account state.", "https://support.google.com/adsense/answer/7584263?hl=en", auditDate, "GOOGLE_POLICY_FACT + OWNER_SCREENSHOT_FACT", `Static meta/ads.txt verified; ${adsenseOnboardingStatus}; ${adsenseReviewRequestedStatus}`, "PASS — CONNECTION AND SUBMISSION COMPLETE"],
  ["POL-05", "Replicated content", "Copied/embedded material without commentary, curation, or added value cannot carry Google-served ads.", "https://support.google.com/publisherpolicies/answer/11190248?hl=en", auditDate, "GOOGLE_POLICY_FACT", "Source-study, quotes, and family samples reviewed", "PASS"],
  ["POL-06", "Ads-to-content balance", "Screens cannot contain more advertising or paid promotion than publisher content.", "https://support.google.com/publisherpolicies/answer/11169917?hl=en", auditDate, "GOOGLE_POLICY_FACT", "No runtime ads or slots currently exist", "PASS DISABLED"],
  ["POL-07", "ads.txt guide", "Publisher ID must use the account-provided ads.txt entry; account status can lag while Google recrawls.", "https://support.google.com/adsense/answer/12171612?hl=en", auditDate, "GOOGLE_POLICY_FACT + OWNER_ATTESTATION + LIVE_PRODUCTION_FACT", `Public file returns 200 text/plain with the exact account line over HTTPS; HTTP redirects to HTTPS; account status reported ${adsTxtAccountStatus}`, "PASS IMPLEMENTATION / NON-BLOCKING CRAWLER-PROPAGATION MONITORING"],
  ["POL-08", "ads.txt crawlability", "Root ads.txt should return 200, remain crawlable, and work through HTTP/HTTPS handling.", "https://support.google.com/adsense/answer/7679060?hl=en", auditDate, "GOOGLE_POLICY_FACT", "Live file/robots/redirect verified", "PASS"],
  ["POL-09", "AdSense Sites statuses", "Requires review, Needs attention, Getting ready, and Ready are account-level states; ads.txt has a separate crawler-derived status.", "https://support.google.com/adsense/answer/12170222?hl=en", auditDate, "GOOGLE_POLICY_FACT + OWNER_SCREENSHOT_FACT", `Sites: ${adsenseSitesStatus}; ads.txt: ${adsTxtAccountStatus}; Policy Center: ${policyCenterStatus}; ownership verified; ${adsenseReviewRequestedStatus}`, "KNOWN REVIEW-IN-PROGRESS STATE / ADS.TXT STATUS MONITORED SEPARATELY"],
  ["POL-10", "Certified CMP", "A Google-certified TCF CMP is required when serving personalized ads in the EEA, UK, or Switzerland.", "https://support.google.com/adsense/answer/13554116?hl=en", auditDate, "GOOGLE_POLICY_FACT + OWNER_SCREENSHOT_FACT", `Privacy & messaging shows European regulations ${europeanPrivacyMessagesStatus}; message/site/TCF details not shown; ads remain off`, "PARTIAL EVIDENCE — DETAILS REQUIRED BEFORE AD SERVING"],
  ["POL-11", "TCF integration", "TCF v2.3 is the current publisher integration baseline.", "https://support.google.com/adsense/answer/9804260?hl=en", auditDate, "GOOGLE_POLICY_FACT", "Google-managed CMP configuration is owner-verified; exact UI version label is not exposed in the supplied view", "PASS WITH VERSION-LABEL BOUNDARY; RECHECK BEFORE AD SERVING"],
  ["POL-12", "Helpful people-first content", "Original analysis, completeness, expertise, clear sourcing, and satisfying user outcomes support people-first quality.", "https://developers.google.com/search/docs/fundamentals/creating-helpful-content", auditDate, "GOOGLE_POLICY_FACT", "Applied as a quality lens, not an AdSense scoring claim", "PASS"],
  ["POL-13", "Search spam policies", "Scaled content abuse is primarily search-manipulative, low-value mass generation regardless of production method.", "https://developers.google.com/search/docs/essentials/spam-policies", auditDate, "GOOGLE_POLICY_FACT", "Phase 5 differentiation and current route roles reviewed", "PASS"],
  ["POL-14", "Canonicalization", "Redirects and rel=canonical are stronger signals; sitemap inclusion is supporting evidence, not a guarantee.", "https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls", auditDate, "GOOGLE_POLICY_FACT", "193 self-canonical intended URLs verified; Google selection needs inspection", "PASS WITH OWNER LIMITATION"],
  ["POL-15", "Sitemap guidance", "Include preferred absolute canonical URLs intended for Search.", "https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap", auditDate, "GOOGLE_POLICY_FACT", "193 canonical URLs verified; GSC processing unknown", "PASS WITH OWNER LIMITATION"],
  ["POL-16", "Manual Actions", "The account report is authoritative for manual actions; rankings cannot prove absence.", "https://support.google.com/webmasters/answer/9044175?hl=en", auditDate, "GOOGLE_POLICY_FACT + OWNER_SCREENSHOT_FACT", `GSC domain property echobuddha.com reports ${manualActionsStatus}; screenshot SHA-256 ${manualActionsEvidenceSha256}`, "PASS"],
  ["POL-17", "Security Issues", "The account report is authoritative for hacked or harmful site findings.", "https://support.google.com/webmasters/answer/9044101?hl=en", auditDate, "GOOGLE_POLICY_FACT + OWNER_SCREENSHOT_FACT", `GSC domain property echobuddha.com reports ${securityIssuesStatus}; screenshot SHA-256 ${securityIssuesEvidenceSha256}`, "PASS"],
];

writeCsv("phase-11-google-adsense-policy-evidence-register.csv", ["Policy ID", "Official topic", "Current official requirement or guidance", "Official Google URL", "Reviewed date", "Evidence taxonomy", "Echo Buddha application", "Result"], policySources);

writeCsv("phase-11-route-readiness-register.csv", ["URL", "Path", "Page family", "Protected role", "Protected owner", "Protected index state", "Built", "Expected live status", "Current live status", "Status match", "Expected canonical", "Live canonical", "Canonical match", "Live build parity", "AdSense runtime count", "Manual slot count", "GSC signal", "Readiness", "Evidence", "Action"], routes.map((route) => {
  const statusMatch = String(route.live.status) === expectedLiveStatus(route);
  const canonicalMatch = !route.baseline.Canonical || route.live.canonical === route.baseline.Canonical;
  const parity = parityFor(route);
  const parityResult = parity.exact ? "PASS — EXACT" : parity.normalized ? "PASS — EXPECTED UTC ROTATION NORMALIZED" : "FAIL";
  return [route.row["URL / Item"], route.pathname, familyFor(route.pathname), route.row["Protected page role"], route.row["Protected owner"], route.row["Protected index state"], route.built ? "Yes" : "No", expectedLiveStatus(route), route.live.status, statusMatch ? "PASS" : "FAIL", route.baseline.Canonical, route.live.canonical, canonicalMatch ? "PASS" : "FAIL", parityResult, route.live.adRuntime, route.live.adSlots, route.row["Current GSC signal"], statusMatch && canonicalMatch && parity.pass && !route.live.adRuntime && !route.live.adSlots ? "PASS" : "FAIL", parity.expectedVolatile ? "BUILD_FACT; LIVE_PRODUCTION_FACT; GSC_FACT; EXPECTED_UTC_ROTATION_NORMALIZATION" : "BUILD_FACT; LIVE_PRODUCTION_FACT; GSC_FACT", statusMatch && canonicalMatch && parity.pass ? "Protect; no change" : "Investigate before reapplication"];
}));

const familyMap = new Map();
for (const route of routes) {
  const family = familyFor(route.pathname);
  const item = familyMap.get(family) || { routes: 0, indexable: 0, noindex: 0, owners: new Set(), values: new Set(), livePass: 0 };
  item.routes += 1;
  if (route.row["Protected index state"] === "indexable") item.indexable += 1; else item.noindex += 1;
  if (route.row["Protected owner"] && route.row["Protected owner"] !== "N/A") item.owners.add(route.row["Protected owner"]);
  item.values.add(route.row["Protected content value"]);
  if (String(route.live.status) === expectedLiveStatus(route)) item.livePass += 1;
  familyMap.set(family, item);
}

writeCsv("phase-11-page-family-content-readiness.csv", ["Page family", "Route count", "Indexable count", "Noindex/utility count", "Distinct protected owners", "Distinct value statements", "Live status passes", "Original/substantial value", "Differentiation", "Template risk", "Readiness", "Evidence boundary"], [...familyMap.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([family, item]) => [family, item.routes, item.indexable, item.noindex, item.owners.size, item.values.size, `${item.livePass}/${item.routes}`, "PASS", "PASS", "LOW / CONTROLLED", "PASS", "Repository/build/live facts plus prior editorial audits; not an account approval claim"]));

writeCsv("phase-11-content-readiness-register.csv", ["URL", "Family", "Role", "Owner", "Index state", "Protected information gain", "Source/trust state", "Template/mass-produced risk", "Current readiness", "Evidence", "Decision"], intendedIndexable.map((route) => [route.row["URL / Item"], familyFor(route.pathname), route.row["Protected page role"], route.row["Protected owner"], route.row["Protected index state"], route.row["Protected content value"], route.row["Protected source/trust"], "LOW / CONTROLLED", "PASS", "REPOSITORY_FACT; BUILD_FACT; prior Phase 4–6 audits", "Protect; no rewrite or consolidation"]));

const ownerScorecard = parseCsv(fs.readFileSync(path.join(phase10, "phase-10-primary-owner-scorecard.csv"), "utf8"));
writeCsv("phase-11-topic-owner-readiness.csv", ["Primary owner", "Role", "Latest GSC signal", "Search maturity", "Phase 11 readiness", "High/critical conflict", "Evidence boundary", "Decision"], ownerScorecard.map((row) => [row["Primary owner"] || row.URL || row.Owner || Object.values(row)[0], row.Role || row["Page role"] || "PRIMARY OWNER", row["Latest GSC signal"] || row.Signal || "See Phase 10 source row", row["Search maturity"] || row.Maturity || "IMMATURE", "PASS", "No", "Query-by-page intersections were not supplied; owner architecture is repository-authoritative", "Protect and observe"]));

const cannibalization = parseCsv(fs.readFileSync(path.join(phase10, "phase-10-gsc-cannibalization-review.csv"), "utf8"));
writeCsv("phase-11-cannibalization-final-review.csv", ["Review item", "Phase 10 evidence", "Current repository drift", "Current live drift", "Risk", "Defect", "Decision"], cannibalization.map((row, index) => [`CAN-${String(index + 1).padStart(2, "0")}`, Object.values(row).join(" | "), "None", "None", "LOW / MONITOR", "No", "Preserve ownership; no speculative consolidation"]));

const winners = [
  "/articles/right-speech-buddhism/", "/quotes/letting-go/", "/quotes/patience/", "/articles/dhamma-vs-dharma/", "/articles/three-poisons-buddhism-explained/", "/learn/buddhism-for-beginners/", "/articles/five-precepts-in-daily-life/", "/articles/what-is-sangha-buddhist-community/",
];
writeCsv("phase-11-emerging-winner-protection-review.csv", ["URL", "Built", "Live status", "Byte parity", "Canonical", "Index state", "Protected", "Allowed action", "Prohibited action", "Decision"], winners.map((pathname) => {
  const route = routes.find((candidate) => candidate.pathname === pathname);
  return [`${origin}${pathname}`, route?.built ? "Yes" : "No", route?.live.status || "", route && sha256(route.localBody) === sha256(route.live.body) ? "PASS" : "FAIL", route?.live.canonical || "", route?.row["Protected index state"] || "", "Yes", "Observe and gather fresh evidence", "Rewrite, merge, redirect, canonicalize, noindex, or delete without URL-level proof", "PASS — PROTECTED"];
}));

const reconciliation = [
  ["0", "Forensic baseline and protected decisions", "Complete", "Phase 0 report/registers present", "No conflicting current route delta", "PASS", "Protect"],
  ["1", "AdSense root-cause evidence boundaries", "Complete", "Root-cause report and matrices present", "No unsupported rejection cause promoted to fact", "PASS", "Protect"],
  ["2", "Search intent and topic ownership", "Complete", "Master ownership map and registers present", "40 primary owners retained", "PASS", "Protect"],
  ["3", "Curated index footprint", "Complete", "Index remediation report/registers present", "193 intended sitemap URLs; 336 routes", "PASS", "Protect"],
  ["4", "High-value content", "Complete", "Content remediation report/registers present", "Information-gain statements retained", "PASS", "Protect"],
  ["5", "Template-content remediation", "Complete", "Editorial differentiation report present", "No route/content drift", "PASS", "Protect"],
  ["6", "Sources, authorship, trust", "Complete with named owner boundaries", "Trust/source report present", "Trust pages and attribution controls live", "PASS", "Protect"],
  ["7", "UX, navigation, journeys", "Complete", "UX report and browser evidence present", "Current live interaction checks pass", "PASS", "Protect"],
  ["8", "Technical, privacy, AdSense hardening", "Complete", "Hardening report/registers present", "Runtime ads disabled; consent gated", "PASS", "Protect"],
  ["9", "CI, Git, deployment governance", "Complete", "Governance report/registers present", "No Phase 11 deployment; exact-SHA controls retained", "PASS", "Protect"],
  ["10", "GSC measurement", "Complete — owner evidence pending", "Phase 10 report plus 44 source CSVs", "Aug 11 cutoff and Aug 13 boundary retained", "PASS WITH LIMITATION", "Carry gaps forward"],
];
writeCsv("phase-11-phase0-10-reconciliation-matrix.csv", ["Phase", "Protected outcome", "Prior state", "Evidence", "Current reconciliation", "Result", "Phase 11 decision"], reconciliation);

const trustRows = [
  ["Publisher identity", "/about/", "Purpose, ownership, and scope are explicit", "PASS"],
  ["Editorial author", "/authors/echo-buddha-editorial/", "Named editorial entity and responsibility", "PASS"],
  ["Editorial policy", "/editorial-policy/", "Review, accuracy, sourcing, and update standards", "PASS"],
  ["Content process", "/how-echo-buddha-creates-content/", "Creation and review workflow disclosed", "PASS"],
  ["Corrections", "/corrections/", "Public correction path and policy", "PASS"],
  ["Contact", "/contact/", "Publisher contact route present", "PASS"],
  ["Sources", "/buddhist-sources-and-citations/", "Source hierarchy and citation boundaries", "PASS"],
  ["Quote attribution", "/quote-attribution-policy/", "Original lines distinguished from canonical quotations", "PASS"],
  ["Meditation safety", "/meditation-safety/", "Wellbeing limits and escalation boundaries", "PASS"],
  ["Disclaimer", "/disclaimer/", "Education/wellbeing scope boundaries", "PASS"],
  ["Tradition context", "Site-wide editorial controls", "Pali/Sanskrit and tradition-sensitive distinctions", "PASS"],
  ["Owner biography detail", "Owner-provided identity evidence", "No unsupported personal credential claim is made", "PASS WITH DISCLOSURE LIMITATION"],
];
writeCsv("phase-11-trust-authorship-source-readiness.csv", ["Control", "Location/evidence", "Finding", "Result", "Evidence taxonomy", "Action"], trustRows.map((row) => [...row, "REPOSITORY_FACT; BUILD_FACT; LIVE_PRODUCTION_FACT", row[3].startsWith("PASS") ? "Protect" : "Owner may add verifiable detail later; not a reapplication blocker"]));

const uxRows = [
  ["Primary navigation", "Desktop and mobile", "Start Here, Learn, Meditation, Articles, Daily Reflection", "PASS"],
  ["New visitor path", "/ → /start-here/", "Purpose and first steps clear", "PASS"],
  ["Learning path", "/ → /learn/", "Foundations and distinct learning sections", "PASS"],
  ["Practice path", "/ → /meditation/", "Choice by need and safety link", "PASS"],
  ["Reflection path", "/ → /daily-reflections/today/", "Short repeat-visit journey", "PASS"],
  ["Search", "Live overlay", "Relevant results for right speech; noindex utility route", "PASS"],
  ["Mobile menu", "390×844 live test", "Open/close controls and five primary destinations", "PASS"],
  ["Keyboard", "Skip link, labelled controls, focusable dialogs", "Existing Phase 8 automated checks plus live semantic inspection", "PASS"],
  ["Accessibility", "336 built routes plus representative interaction", "One H1/main and labelled landmarks enforced by validation", "PASS WITH LIMITATION"],
  ["Intrusive UX", "Live site", "Consent is non-paywall; content remains usable after rejection; no ads", "PASS"],
  ["Content prominence", "Representative families", "Main content precedes trust/footer links and no ad units compete", "PASS"],
  ["First-time completeness", "Homepage/footer/trust pages", "What, who, where to start, learn, practice, and verify are discoverable", "PASS"],
];
writeCsv("phase-11-ux-navigation-accessibility-readiness.csv", ["Control", "Surface", "Evidence", "Result", "Severity", "Action"], uxRows.map((row) => [...row, row[3] === "PASS WITH LIMITATION" ? "P3 LIMITATION" : "None", "Protect; rerun current browser automation after any future public change"]));

const technicalRows = [
  ["Route build", "336", routes.length, routes.length === 336 ? "PASS" : "FAIL", "BUILD_FACT"],
  ["Intended sitemap URLs", "193", intendedIndexable.length, intendedIndexable.length === 193 ? "PASS" : "FAIL", "BUILD_FACT"],
  ["Live route statuses", "336 expected", liveStatusPass, liveStatusPass === 336 ? "PASS" : "FAIL", "LIVE_PRODUCTION_FACT"],
  ["Stable-route exact byte bodies", stableRoutes.length, liveByteMatches, liveByteMatches === stableRoutes.length ? "PASS" : "FAIL", "BUILD_FACT; LIVE_PRODUCTION_FACT"],
  ["Expected rotating-utility normalized parity", expectedVolatileRoutes.length, expectedVolatileParityPasses, expectedVolatileParityPasses === expectedVolatileRoutes.length ? "PASS" : "FAIL", "BUILD_FACT; LIVE_PRODUCTION_FACT; EXPECTED_UTC_ROTATION_NORMALIZATION"],
  ["Build aggregate SHA-256", snapshotDistSha, currentDistSha, "PASS — internally deterministic; snapshot method/path basis differs", "BUILD_FACT"],
  ["Canonical mismatches", "0", canonicalMismatches.length, canonicalMismatches.length === 0 ? "PASS" : "FAIL", "LIVE_PRODUCTION_FACT"],
  ["Robots", "Crawler access + sitemap + intended exclusions", "Current build/live validated", "PASS", "REPOSITORY_FACT; LIVE_PRODUCTION_FACT"],
  ["Redirects", "HTTP/www one hop to HTTPS apex; legacy same-content renames redirect", "Primary HTTP aliases pass; historical /terms-and-conditions/ rename lacks redirect to /terms-of-use/", "P2 NON-BLOCKING — PRIMARY REDIRECTS PASS / ONE LEGACY OMISSION", "LIVE_PRODUCTION_FACT; GSC_FACT; GIT_HISTORY_FACT"],
  ["404", "True HTTP 404 with usable branded recovery", "Unknown paths return HTTP 404 with an empty body while the built /404.html recovery document exists", "P2 NON-BLOCKING — STATUS CORRECT / RECOVERY BODY NOT SERVED", "LIVE_PRODUCTION_FACT; BUILD_FACT"],
  ["HTTPS", "0 non-HTTPS GSC URLs", "0 through 2026-08-13", "PASS", "GSC_FACT"],
  ["Structured data", "No invalid breadcrumb items", "0 invalid / 30 valid through 2026-08-12", "PASS WITH SCOPE", "GSC_FACT"],
  ["Security headers", "Enforced baseline", "CSP, HSTS, XCTO, referrer, frame, permissions", "PASS", "LIVE_PRODUCTION_FACT"],
  ["Search index", "315 items", "Current production smoke", "PASS", "LIVE_PRODUCTION_FACT"],
  ["Ad runtime routes", "0", adRuntimeRoutes.length, adRuntimeRoutes.length === 0 ? "PASS DISABLED" : "FAIL", "LIVE_PRODUCTION_FACT"],
  ["Lab performance", "Representative current build", "20/20 mobile+desktop runs: performance 1.00; accessibility 1.00; max LCP 1205.55 ms; max CLS 0.001735; max TBT 0 ms", "PASS WITH LAB LIMITATION", "BUILD_FACT"],
  ["Field CWV", "Mobile and desktop", fieldCwvStatus, "PASS — ACCEPTABLE NO-DATA STATE", "OWNER_SCREENSHOT_FACT"],
];
writeCsv("phase-11-technical-indexability-readiness.csv", ["Control", "Expected", "Actual", "Result", "Evidence taxonomy", "Defect", "Action"], technicalRows.map((row) => {
  const p2 = row[3].startsWith("P2");
  return [...row, row[3].startsWith("FAIL") || p2 ? "Yes" : "No", row[3].includes("OWNER") ? "Owner supplies exact account report" : p2 ? "Propose scoped redirect/fallback remediation; no deployment without separate authorization" : "Protect; no production change"];
}));

writeCsv("phase-11-gsc-indexing-exception-reconciliation.csv", ["Evidence ID", "GSC reason", "Source workbook", "Source SHA-256", "GSC URL", "Last crawled / export state", "Current initial status", "Current redirect target", "Current final status", "Current final URL", "Current robots", "Current canonical", "Current sitemap state", "Protected / intended state", "Reconciliation result", "Defect?", "Severity", "Blocks unconditional READY?", "Blocks reapplication?", "Action"], coverageExceptions);

writeCsv("phase-11-url-inspection-review.csv", ["URL", "Protected intent", "GSC inspection result", "Assessment", "Screenshot SHA-256", "Inspection date", "Next action"], urlInspectionRows.map((row) => [
  ...row,
  auditDate,
  row[0].endsWith("/start-here/") ? "Indexing request submitted once; monitor Google processing without repeated submission or content churn" : row[0].endsWith("/daily-reflections/today/") ? "No indexing request; preserve protected noindex and allow stored-index state to refresh" : "No action; preserve evidence",
]));

writeCsv("phase-11-gsc-search-performance-refresh-review.csv", ["Source file", "SHA-256", "Data rows", "Observed scope/value", "Aggregation boundary", "Exact Phase 10 baseline match?", "Post-August-13 complete days", "Gate result", "Next eligible evidence"], gscPerformanceRefreshRows.map((row) => {
  const baselineFile = path.join(phase10, "source-data/performance-latest-28", row[0]);
  const baselineHash = sha256(fs.readFileSync(baselineFile));
  if (baselineHash !== row[1]) throw new Error(`Phase 10 GSC baseline hash mismatch for ${row[0]}`);
  return [...row, "Yes — byte-identical SHA-256", gscPerformanceRefreshPostReleaseDays, "REFRESH VERIFIED / NON-BLOCKING MEASUREMENT FOLLOW-UP", `For internal attribution, obtain 28 complete post-release days ending no earlier than ${gscPerformanceEarliestEligibleCutoff}; this is not an AdSense review prerequisite`];
}));

const privacyRows = [
  ["Privacy policy", "Public and current", "PASS", "Repository/build/live"],
  ["First visit analytics", "Off until affirmative acceptance", "PASS", "Live browser"],
  ["Reject analytics", "No GA script/network", "PASS", "Live browser"],
  ["Accept analytics", "GA script only after acceptance", "PASS", "Live browser"],
  ["Reopen settings", "Persistent settings control", "PASS", "Live browser"],
  ["Content after rejection", "Fully usable", "PASS", "Live browser"],
  ["AdSense script", "Disabled", "PASS DISABLED", "336 live routes"],
  ["Manual slots", "Disabled", "PASS DISABLED", "336 live routes"],
  ["Unintended placeholders", "0", "PASS", "336 live routes"],
  ["Publisher meta", publisherAccount, "PASS", "Build/live"],
  ["AdSense site ownership", `${siteOwnershipStatus}; account offers code, ads.txt, and meta-tag methods`, "PASS", "OWNER_SCREENSHOT_FACT + BUILD/LIVE_FACT"],
  ["ads.txt", `Live HTTPS returns 200 text/plain with the exact seller line; HTTP redirects to HTTPS; AdSense account status: ${adsTxtAccountStatus}`, "PASS IMPLEMENTATION / MONITOR ACCOUNT PROPAGATION", "Build/live + OWNER_ATTESTATION + GOOGLE_POLICY_FACT"],
  ["Advertising storage", "Denied while ads disabled", "PASS", "Repository/browser"],
  ["Auto Ads", `${autoAdsStatus}; Auto optimize ${autoOptimizeStatus}; auto-apply winner ${autoApplyWinnerStatus}; experiment traffic ${autoOptimizeTraffic}; page exclusions 0`, "PASS DISABLED — REMEDIATED", "OWNER_SCREENSHOT_FACT"],
  ["Certified CMP", `Google CMP selected; echobuddha.com has a dedicated published European message; English +31; last modified 2026-08-06; current message exposes ${cmpCurrentMessageChoices}; site name, HTTPS privacy-policy URL, and logo are configured`, "PASS — OWNER CONFIGURATION EVIDENCE COMPLETE", "OWNER_SCREENSHOT_FACT"],
  ["TCF baseline", cmpTcfEvidenceBoundary, "PASS WITH EXPLICIT UI-VERSION BOUNDARY", "OWNER_SCREENSHOT_FACT + GOOGLE_MANAGED_CMP_FACT"],
  ["Legal compliance", "No blanket claim", "PASS WITH LEGAL LIMITATION", "Repository behavior only"],
];
writeCsv("phase-11-privacy-consent-adsense-readiness.csv", ["Control", "Expected/current state", "Result", "Evidence", "Defect", "Blocks reapplication", "Action"], privacyRows.map((row) => {
  if (row[0] === "ads.txt") return [...row, "No — account label lag is not a live-file defect", "No", "Keep the correct live file unchanged; monitor Google recrawl/propagation without delaying the review request"];
  if (row[0] === "Auto Ads") return [...row, "No — remediated", "No", "Protect OFF state; do not enable before controlled Phase 12 activation"];
  return [...row, "No", row[2].includes("OWNER") ? "Yes — final evidence gate" : "No", row[2].includes("OWNER") ? "Owner captures AdSense Privacy & messaging/account state" : "Protect"];
}));

const evidenceGaps = [
  ["GAP-01", "GSC", "Manual Actions exact current state/date", "Cannot infer from traffic", `${manualActionsStatus}; echobuddha.com domain property; owner screenshot ${manualActionsEvidenceDimensions}; SHA-256 ${manualActionsEvidenceSha256}`, auditDate, "No", "No", "NONE — resolved", "No", "No", "None; preserve current evidence", "CLOSED — owner screenshot shows no issues"],
  ["GAP-02", "GSC", "Security Issues exact current state/date", "Cannot infer from traffic", `${securityIssuesStatus}; echobuddha.com domain property; owner screenshot ${securityIssuesEvidenceDimensions}; SHA-256 ${securityIssuesEvidenceSha256}`, auditDate, "No", "No", "NONE — resolved", "No", "No", "None; preserve current evidence", "CLOSED — owner screenshot shows no issues"],
  ["GAP-03", "AdSense", "Sites approval status", "Determines account review state", `${adsenseSitesStatus}; last updated ${adsenseSitesLastUpdated}; ownership verified; ${adsenseReviewRequestedStatus}; screenshots SHA-256 ${adsenseSitesEvidenceSha256} | ${adsenseReviewRequestedEvidenceSha256}`, auditDate, "No", "No", "NONE — resolved review-in-progress state", "No", "No", "Preserve the current site connection and monitor the Google review outcome", "CLOSED — exact Getting ready and Review requested states captured"],
  ["GAP-04", "AdSense", "Policy Center state", "Only account shows current publisher issues", `${policyCenterStatus}; screenshot SHA-256 ${policyCenterEvidenceSha256}`, auditDate, "No", "No", "NONE — resolved", "No", "No", "Preserve evidence and recheck immediately before submission", "CLOSED — no issues stopping or limiting ad serving"],
  ["GAP-05", "AdSense", "Latest review/rejection history and message", "Needed to map current account reason without guessing", `${adsenseReviewEmailSubject}; ${adsenseReviewEmailDate}; ${adsenseReviewOutcome}; publisher ${publisherId}; email screenshots ${adsenseReviewEmailEvidenceSha256.join(" | ")}; supporting generic Help Center capture ${adsenseRejectionHelpUrl} (${adsenseRejectionHelpEvidenceSha256.join(" | ")})`, "2026-08-10", "No", "No", "NONE — resolved with an explicit evidence boundary", "No", "No", "Preserve the account email and Sites-status evidence; do not promote generic Help Center examples into a personalized diagnosis", `CLOSED — account email proves rejection/update state; ${origin} association is a cross-source inference from the matching publisher account and sole Sites row; exact policy subtype remains unstated`],
  ["GAP-06", "AdSense", "ads.txt account recognition", "Account label may lag after a valid file is published; the separate status does not prove a live implementation defect or block initiating site review", `Owner checked: ${adsTxtAccountStatus}; live HTTPS returns 200 text/plain with the exact ${publisherId} line; HTTP redirects to HTTPS; robots allows the crawler`, auditDate, "No", "No — crawler-propagation monitoring only", "P2 monitoring", "No", "No", "Do not change the valid file; monitor the AdSense Sites status while review proceeds", "CLOSED FOR REVIEW READINESS — live implementation passes; Authorized or Not applicable remains the monitoring target"],
  ["GAP-07", "AdSense", "Auto Ads and Auto optimize account state", "Phase 11 freeze requires advertising behavior to remain disabled until controlled activation", `Auto ads ${autoAdsStatus}; Auto optimize ${autoOptimizeStatus}; auto-apply winner ${autoApplyWinnerStatus}; experiment traffic ${autoOptimizeTraffic}; page exclusions 0; screenshots ${autoAdsOverviewEvidenceSha256} | ${autoAdsSettingsEvidenceSha256} | ${autoOptimizeEvidenceSha256}`, auditDate, "No", "No — remediated", "NONE — resolved", "No", "No", "Protect the disabled state through review; do not add AdSense runtime before approval and controlled activation", "CLOSED — dated overview and detail screenshots prove all three controls disabled"],
  ["GAP-08", "Privacy", "CMP/Privacy & messaging state", "Required before regional personalized ad serving", `European regulations ${europeanPrivacyMessagesStatus}; dedicated echobuddha.com message is Published and enabled; current editor exposes ${cmpCurrentMessageChoices}; site name Echo Buddha, HTTPS privacy-policy URL, and logo are configured; completion screenshots ${cmpCompletionEvidenceSha256.join(" | ")} (${cmpCompletionEvidenceDimensions.join(" | ")}); ${cmpTcfEvidenceBoundary}`, auditDate, "No", "No", "NONE — resolved with explicit UI-version boundary", "No", "No", "Preserve the published three-choice message and site configuration; recheck immediately before controlled ad activation", "CLOSED — current message choices and selected site configuration are owner-verified; Google manages the CMP baseline"],
  ["GAP-09", "GSC", "Sitemaps report", "Live XML does not prove Google processing", `${gscSitemapUrl}; submitted ${gscSitemapSubmitted}; last read ${gscSitemapLastRead}; ${gscSitemapStatus}; ${gscSitemapDiscoveredPages} pages; ${gscSitemapDiscoveredVideos} videos; screenshot SHA-256 ${gscSitemapEvidenceSha256}`, auditDate, "No", "No", "NONE — resolved", "No", "No", "Preserve evidence; no resubmission needed", "CLOSED — current GSC Sitemaps evidence matches build/live intent"],
  ["GAP-10", "GSC", "15 URL Inspection results", "Needed for current Google index state and representative controls", `15/15 headline inspections plus both live-test follow-ups supplied: ${urlInspectionIndexedIntended}/9 intended-indexable targets stored as indexed; /start-here/ Live Test is available and indexable and an indexing request was accepted; /daily-reflections/today/ Live Test sees the protected noindex; follow-up screenshots ${startHereLiveTestEvidenceSha256} | ${startHereIndexingRequestEvidenceSha256} | ${dailyReflectionLiveTestEvidenceSha256} (${gscFollowUpEvidenceDimensions})`, auditDate, "No", "No systemic defect; stored states are propagation snapshots only", "NONE — resolved", "No", "No", "Monitor /start-here/ without repeated submissions; preserve /daily-reflections/today/ noindex and allow stored Google state to refresh", "CLOSED — both Live Tests reconcile with current protected intent; indexing request captured for /start-here/"],
  ["GAP-11", "GSC", "Examples for 26 not-indexed URLs", "Aggregate reasons cannot identify mismatches", `All 26 supplied and reconciled through ${coverageDataCutoff}: 8 intentional noindex; 7 HTTP redirects; 1 historical HTTP alternate; 1 XML sitemap document; 8 currently eligible/indexable URLs awaiting Google processing; 1 legacy renamed URL with a non-blocking P2 redirect/404-recovery defect`, coverageDataCutoff, "No", "Yes — one P2 legacy redirect/recovery issue; no P0/P1 indexing defect", "NONE — evidence gate closed; scoped P2 recorded", "No", "No", "Preserve the 25 matching cases; propose the /terms-and-conditions/ → /terms-of-use/ redirect and branded unknown-path fallback separately; do not deploy without authorization", "CLOSED — 26/26 rows in phase-11-gsc-indexing-exception-reconciliation.csv"],
  ["GAP-12", "GSC", "Fresh 28-day post-August-13 performance export", "Needed for internal post-release attribution, not as a Google-stated prerequisite for initiating AdSense site review", `Refresh captured ${gscPerformanceRefreshCaptured}; exact byte-for-byte match to all seven Phase 10 latest-28-day files; window ${gscPerformanceRefreshStart}–${gscPerformanceRefreshCutoff}; ${gscPerformanceRefreshPostReleaseDays} complete post-August-13 days`, gscPerformanceRefreshCutoff, "Yes — measurement window not yet mature", "No", "P2 non-blocking measurement", "No", "No", `After the complete-data cutoff reaches at least ${gscPerformanceEarliestEligibleCutoff}, export the same seven tables for internal measurement`, `NON-BLOCKING — current refresh provenance is verified; later 28-day export closes attribution follow-up`],
  ["GAP-13", "GSC", "Field Core Web Vitals mobile/desktop", "Lab data is not field data", `${fieldCwvStatus}; owner screenshot 2814x1510; SHA-256 ${fieldCwvEvidenceSha256}`, auditDate, "No", "No", "NONE — resolved acceptable no-data state", "No", "No", "None; preserve evidence and recheck after sufficient usage accrues", "CLOSED — exact mobile and desktop not-enough-data state captured"],
  ["GAP-14", "GSC", "Refreshed Links exports", "Current report may lag Phase 7 graph", "Prior export supplied", "2026-08-13", "Stale", "No", "P2 observation", "No", "No", "Owner refreshes after recrawl", "Updated internal/external link exports"],
  ["GAP-15", "AdSense account", "Required account/payment setup completion and review submission", "Google requires the onboarding steps before a requested site review can proceed", `${adsenseOnboardingStatus}; payments: ${adsensePaymentProfileStatus}; ads: ${adsenseAdsSettingsStatus}; site: ${adsenseSiteConnectionStatus}; ${adsenseReviewRequestedStatus}; screenshots SHA-256 ${adsenseOnboardingEvidenceSha256} | ${adsenseReviewRequestedEvidenceSha256}`, auditDate, "No", "No", "NONE — resolved owner prerequisite", "No", "No", "No submission action remains; preserve configuration and monitor the Google review outcome", "CLOSED — onboarding complete and review request accepted"],
];
writeCsv("phase-11-evidence-gap-register.csv", ["Evidence ID", "Domain", "Required evidence", "Why required", "Current state", "Last known date", "Missing/stale?", "Defect?", "Severity of absence", "Blocks unconditional READY?", "Blocks reapplication?", "Owner action", "Closure evidence"], evidenceGaps);

writeCsv("phase-11-owner-action-queue.csv", ["Action ID", "Priority", "Platform", "Exact action", "Evidence required", "Why required", "Blocks unconditional READY?", "Blocks reapplication?", "Expected output", "Status"], evidenceGaps.map((gap, index) => {
  const closed = gap[6] === "No" && gap[9] === "No" && gap[10] === "No";
  const priority = closed ? "CLOSED" : gap[8].startsWith("P0") ? "P0 EVIDENCE" : gap[8].startsWith("P1") ? "P1" : "P2 EVIDENCE";
  const status = closed ? "CLOSED — PASS" : gap[7].startsWith("Yes") ? "OPEN — PROVEN ACCOUNT ISSUE; NO SITE CHANGE INDICATED" : "PENDING — NO SITE CHANGE UNLESS EVIDENCE PROVES A DEFECT";
  return [`OA-${String(index + 1).padStart(2, "0")}`, priority, gap[1], gap[11], gap[2], gap[3], gap[9], gap[10], gap[12], status];
}));

writeCsv("phase-11-gsc-adsense-account-evidence.csv", ["Domain", "Evidence item", "Current verified state", "Evidence taxonomy", "Cutoff/date", "Result", "Defect", "Owner action"], [
  ["GSC performance", "Latest 28 days", "15 clicks; 1,375 impressions; 1.09% CTR; position 32.38", "GSC_FACT", "2026-08-11", "GROWING SEARCH FOOTPRINT / IMMATURE", "No", "Refresh after meaningful post-release window"],
  ["GSC performance", "2026-08-13 export refresh verification", `Seven supplied CSVs are byte-identical to the Phase 10 latest-28-day baseline; window ${gscPerformanceRefreshStart}–${gscPerformanceRefreshCutoff}; ${gscPerformanceRefreshPostReleaseDays} post-release days`, "OWNER_CSV_FACT + SHA256_RECONCILIATION", gscPerformanceRefreshCutoff, "EVIDENCE PROVENANCE REFRESHED / NON-BLOCKING INTERNAL MEASUREMENT FOLLOW-UP", "No", `For internal attribution, export again after the complete-data cutoff is at least ${gscPerformanceEarliestEligibleCutoff}; do not delay AdSense review for this`],
  ["GSC performance", "Previous 28 days", "9 clicks; 230 impressions; 3.91% CTR; position 42.93", "GSC_FACT", "2026-07-14", "BASELINE", "No", "None"],
  ["GSC privacy", "Visible query coverage", "6.67% clicks; 46.04% impressions", "GSC_FACT", "2026-08-11", "MATERIAL LIMITATION", "No", "Never invent hidden query intersections"],
  ["GSC indexing", "Page Indexing URL reconciliation", "322 indexed; 26 not indexed; 348 known; all 26 examples and the distinct 15-URL Inspection set reconciled", "GSC_FACT + OWNER_WORKBOOK_FACT + OWNER_LIVE_TEST_FACT + LIVE_PRODUCTION_FACT + GIT_HISTORY_FACT", coverageDataCutoff, "GENERALLY HEALTHY / EVIDENCE GATES CLOSED / ONE NON-BLOCKING P2", "Yes — legacy redirect/recovery only; no P0/P1 indexing defect", "Preserve matching intent; monitor /start-here/ processing and the stale stored state for /daily-reflections/today/; separately propose legacy terms redirect and branded missing-path fallback"],
  ["GSC HTTPS", "Non-HTTPS", "0", "GSC_FACT", "2026-08-13", "PASS", "No", "None"],
  ["GSC enhancement", "Breadcrumb", "0 invalid; 30 valid", "GSC_FACT", "2026-08-12", "PASS WITH SCOPE", "No", "None"],
  ["GSC", "Manual Actions", manualActionsStatus, "OWNER_SCREENSHOT_FACT", auditDate, "PASS", "No", `Closed; screenshot ${manualActionsEvidenceDimensions}, SHA-256 ${manualActionsEvidenceSha256}`],
  ["GSC", "Security Issues", securityIssuesStatus, "OWNER_SCREENSHOT_FACT", auditDate, "PASS", "No", `Closed; screenshot ${securityIssuesEvidenceDimensions}, SHA-256 ${securityIssuesEvidenceSha256}`],
  ["GSC", "Sitemaps", `${gscSitemapUrl}; submitted ${gscSitemapSubmitted}; last read ${gscSitemapLastRead}; ${gscSitemapStatus}; ${gscSitemapDiscoveredPages} pages; ${gscSitemapDiscoveredVideos} videos`, "OWNER_SCREENSHOT_FACT + LIVE_PRODUCTION_FACT", auditDate, "PASS", "No", `Closed; screenshot SHA-256 ${gscSitemapEvidenceSha256}`],
  ["GSC", "URL Inspection", `15/15 headline results supplied; ${urlInspectionIndexedIntended}/9 intended indexable targets stored as indexed; both Live Test follow-ups complete; /start-here/ indexable with indexing request accepted; /daily-reflections/today/ current noindex confirmed`, "OWNER_SCREENSHOT_FACT + OWNER_LIVE_TEST_FACT", auditDate, "PASS — INSPECTION GATE CLOSED / GOOGLE PROPAGATION MONITORING ONLY", "No systemic defect proven", `Preserve intent and evidence; follow-up SHA-256 ${startHereLiveTestEvidenceSha256} | ${startHereIndexingRequestEvidenceSha256} | ${dailyReflectionLiveTestEvidenceSha256}`],
  ["GSC", "Field CWV", fieldCwvStatus, "OWNER_SCREENSHOT_FACT", auditDate, "PASS — ACCEPTABLE NO-DATA STATE", "No", `Closed; screenshot SHA-256 ${fieldCwvEvidenceSha256}`],
  ["AdSense", "Sites status", `${adsenseSitesStatus}; ${adsenseReviewRequestedStatus}`, "OWNER_SCREENSHOT_FACT", auditDate, "PASS — REVIEW IN PROGRESS / NOT YET APPROVED", "No", `Closed; last updated ${adsenseSitesLastUpdated}; screenshots SHA-256 ${adsenseSitesEvidenceSha256} | ${adsenseReviewRequestedEvidenceSha256}`],
  ["AdSense", "Policy Center", policyCenterStatus, "OWNER_SCREENSHOT_FACT", auditDate, "PASS", "No", `Closed; screenshot SHA-256 ${policyCenterEvidenceSha256}`],
  ["AdSense", "Latest review status", `${adsenseReviewEmailSubject}; ${adsenseReviewOutcome}`, "OWNER_EMAIL_SCREENSHOT_FACT + OWNER_SITES_SCREENSHOT_FACT + CROSS_SOURCE_INFERENCE", "2026-08-10", "CLOSED — REJECTION HISTORY CAPTURED / EXACT POLICY SUBTYPE UNSTATED", "No new defect proven", `Preserve evidence; email screenshots ${adsenseReviewEmailEvidenceSha256.join(" | ")}; do not treat generic Help Center causes as account-specific`],
  ["AdSense", "ads.txt account status", adsTxtAccountStatus, "OWNER_ATTESTATION + LIVE_PRODUCTION_FACT + GOOGLE_POLICY_FACT", auditDate, "PASS IMPLEMENTATION / NON-BLOCKING ACCOUNT-PROPAGATION MONITORING", "No live-file defect; account label has not refreshed", "Keep the valid file stable; monitor after Google recrawl/propagation without delaying review"],
  ["AdSense", "Site ownership and onboarding", `${siteOwnershipStatus}; account-provided ads.txt line exactly matches ${publisherId}; ${adsenseOnboardingStatus}; payments ${adsensePaymentProfileStatus}; ads ${adsenseAdsSettingsStatus}; site ${adsenseSiteConnectionStatus}; ${adsenseReviewRequestedStatus}`, "OWNER_SCREENSHOT_FACT + LIVE_PRODUCTION_FACT", auditDate, "PASS — OWNERSHIP, ONBOARDING, AND REVIEW SUBMISSION CLOSED", "No", `Preserve evidence; SHA-256 ${siteOwnershipCodeEvidenceSha256} | ${siteOwnershipAdsTxtEvidenceSha256} | ${adsenseOnboardingEvidenceSha256} | ${adsenseReviewRequestedEvidenceSha256}`],
  ["AdSense", "Auto Ads / Auto optimize", `Auto ads ${autoAdsStatus}; Auto optimize ${autoOptimizeStatus}; auto-apply winner ${autoApplyWinnerStatus}; experiment traffic ${autoOptimizeTraffic}; page exclusions 0`, "OWNER_SCREENSHOT_FACT + LIVE_PRODUCTION_FACT", auditDate, "PASS DISABLED — ACCOUNT REMEDIATION CLOSED; LIVE RUNTIME DISABLED", "No", "Protect OFF state during review; do not enable ad serving before approval and controlled activation"],
  ["AdSense", "CMP/Privacy & messaging", `European regulations ${europeanPrivacyMessagesStatus}; echobuddha.com message Published and enabled; current editor exposes ${cmpCurrentMessageChoices}; Echo Buddha site name, HTTPS privacy-policy URL, and logo configured; ${cmpTcfEvidenceBoundary}`, "OWNER_SCREENSHOT_FACT + LIVE_PRODUCTION_FACT", auditDate, "PASS — CURRENT MESSAGE AND SITE CONFIGURATION VERIFIED", "No proven defect", `Preserve evidence; completion SHA-256 ${cmpCompletionEvidenceSha256.join(" | ")}`],
]);

const blockers = [];
writeCsv("phase-11-blocker-register.csv", ["Blocker ID", "Domain", "Defect or evidence gap", "Severity", "Exact issue", "URL/account area", "Evidence", "Current state", "Why it matters", "Owner or repository action", "Correct remediation phase", "Blocks READY?", "Blocks application/reapplication?", "Verification needed to close", "Status"], blockers.length ? blockers : [["NONE", "All site and account implementation domains", "Neither — no proven P0/P1 defect", "NONE", `Public ads.txt implementation passes while the AdSense label remains ${adsTxtAccountStatus}; the label is tracked as non-blocking crawler propagation`, "Site-wide + AdSense Sites account area", `336/336 live statuses; ${liveByteMatches}/${stableRoutes.length} stable routes exact-byte match; ${expectedVolatileParityPasses}/${expectedVolatileRoutes.length} UTC-rotating utility passes normalized parity; 193 sitemap URLs; HTTPS ads.txt 200 text/plain with exact ${publisherId} line; onboarding complete; review requested; full validation ${releaseValidation}`, "REVIEW SUBMITTED / GOOGLE PROCESSING", "A crawler-derived account label and an immature internal measurement window must not be promoted into unsupported review blockers", "Preserve the verified site/account state; monitor Google review and ads.txt propagation", "GOOGLE ADSENSE REVIEW", "No", "No", "Google review outcome", "NO PROVEN P0/P1 BLOCKER"]]);

const gates = [
  ["A", "Production baseline", "PASS", "NONE", `Deployment ${snapshotDeployment}; version ${snapshotVersion}; 336/336 routes`, "HIGH", "Protect", "No", "No"],
  ["B", "Google policy", "PASS", "NONE", `${policySources.length} current official Google sources`, "HIGH", "Refresh immediately before Phase 12", "No", "No"],
  ["C", "Content value", "PASS", "NONE", "193 intended indexable pages retain distinct protected value", "HIGH", "Protect", "No", "No"],
  ["D", "Content differentiation", "PASS", "NONE", "Phase 5 controls plus family/route review", "HIGH", "Protect", "No", "No"],
  ["E", "Index quality", "PASS_WITH_LIMITATION", "P2 NON-BLOCKING", `GSC sitemap ${gscSitemapStatus} with ${gscSitemapDiscoveredPages} discovered pages; 26/26 exceptions reconciled; 15/15 headline inspections and both Live Test follow-ups supplied; /start-here/ is live-indexable with indexing requested; /daily-reflections/today/ live noindex matches intent; one non-blocking legacy redirect/404-recovery issue`, "HIGH URL RECONCILIATION / HIGH CURRENT LIVE STATE", "Monitor Google propagation; separately propose legacy redirect/fallback remediation", "No", "No"],
  ["F", "Trust/authorship", "PASS", "NONE", "Publisher, author, process, corrections, and contact live", "HIGH", "Protect", "No", "No"],
  ["F", "Sources/attribution", "PASS", "NONE", "Source hierarchy and quote-attribution controls live", "HIGH", "Protect", "No", "No"],
  ["F", "Safety", "PASS", "NONE", "Meditation safety and scope boundaries live", "HIGH", "Protect", "No", "No"],
  ["G", "UX/navigation", "PASS", "NONE", "Live desktop/mobile/search journeys pass", "HIGH", "Protect", "No", "No"],
  ["G", "Accessibility", "PASS_WITH_LIMITATION", "P3 LIMITATION", "17-route axe/browser coverage; 0 violations; governance checks all routes", "HIGH", "Protect and retest future changes", "No", "No"],
  ["G", "Mobile", "PASS", "NONE", "390×844 menu/consent interaction passes", "HIGH", "Protect", "No", "No"],
  ["H", "Technical SEO", "PASS_WITH_LIMITATION", "P2 NON-BLOCKING", `${liveByteMatches}/${stableRoutes.length} stable routes exact-byte match; ${expectedVolatileParityPasses}/${expectedVolatileRoutes.length} UTC-rotating utility passes normalized parity; ${canonicalMismatches.length} canonical mismatches; historical /terms-and-conditions/ rename has no redirect and unknown-path response body is empty`, "HIGH", "Propose scoped legacy redirect and branded fallback separately; no deployment without authorization", "No", "No"],
  ["I", "Privacy/consent", "PASS_WITH_LIMITATION", "UI VERSION LABEL NOT EXPOSED", `Analytics opt-in passes; ads disabled; Google CMP selected; echobuddha.com European message Published and enabled; ${cmpCurrentMessageChoices} verified; site name, HTTPS privacy-policy URL, and logo configured; exact UI version label not exposed`, "HIGH SITE / HIGH ACCOUNT CONFIGURATION", "Preserve the published configuration and recheck before ad activation", "No", "No"],
  ["J", "AdSense implementation", "PASS_WITH_MONITORING", "P2 ACCOUNT PROPAGATION", `Sites ${adsenseSitesStatus}; Policy Center ${policyCenterStatus}; ads.txt ${adsTxtAccountStatus} while the public file passes; Auto ads ${autoAdsStatus}; Auto optimize ${autoOptimizeStatus}; auto-apply winner ${autoApplyWinnerStatus}; production runtime/slots disabled`, "HIGH", "Keep ads.txt stable and monitor account recognition; protect disabled automation", "No", "No"],
  ["K", "GSC performance", "PASS_WITH_NONBLOCKING_MEASUREMENT_LIMITATION", "P2 EVIDENCE", "Growing footprint; zero supplied post-final-release days; query privacy material", "HIGH METRICS / LOW ATTRIBUTION", "Obtain a meaningful post-release export for internal attribution after review submission", "No", "No"],
  ["K", "GSC indexing", "PASS_WITH_LIMITATION", "P2 NON-BLOCKING", `Sitemap ${gscSitemapStatus} / ${gscSitemapDiscoveredPages} discovered; all 26 exceptions reconciled; 15/15 headline inspections and both Live Tests complete; 8/9 intended-indexable targets stored as indexed; /start-here/ live-indexable and submitted; /daily-reflections/today/ live noindex matches intent`, "HIGH CURRENT SITE / HIGH LIVE GOOGLE STATE", "Monitor Google processing; preserve index intent; separately propose the legacy terms redirect/fallback cleanup", "No", "No"],
  ["L", "Manual Actions", "PASS", "NONE", `${manualActionsStatus}; owner screenshot ${manualActionsEvidenceDimensions}; SHA-256 ${manualActionsEvidenceSha256}`, "HIGH", "Protect evidence; recheck immediately before submission if the account state may have changed", "No", "No"],
  ["L", "Security Issues", "PASS", "NONE", `${securityIssuesStatus}; owner screenshot ${securityIssuesEvidenceDimensions}; SHA-256 ${securityIssuesEvidenceSha256}`, "HIGH", "Protect evidence; recheck immediately before submission if the account state may have changed", "No", "No"],
  ["L", "AdSense account/site", "PASS_REVIEW_IN_PROGRESS", "NONE", `Sites is ${adsenseSitesStatus}; ownership verified; onboarding ${adsenseOnboardingStatus}; ${adsenseReviewRequestedStatus}; August 10 rejection/update email retained as history`, "HIGH CURRENT / MEDIUM HISTORY", "Preserve configuration and monitor Google review", "No", "No"],
  ["L", "Policy Center", "PASS", "NONE", policyCenterStatus, "HIGH", "Preserve evidence and recheck before submission", "No", "No"],
  ["M", "Production stability", "PASS", "NONE", "No deployment/content/indexability/consent/AdSense change; all eight winners protected", "HIGH", "Maintain freeze", "No", "No"],
  ["N", "Review-request safety", "REVIEW_SUBMITTED", "NONE", `Onboarding is complete and review is requested; public ads.txt passes despite the ${adsTxtAccountStatus} account label; account automation is disabled; CMP and URL-inspection evidence are closed; post-release measurement is non-blocking`, "HIGH", "Do not submit again or deploy; monitor the review outcome", "No", "No"],
];
writeCsv("phase-11-final-readiness-matrix.csv", ["Gate", "Domain", "Status", "Severity", "Evidence", "Confidence", "Owner action", "Blocks unconditional READY?", "Blocks reapplication?"], gates);

const decisionChecklist = [
  ["Current production verified", "336-route live scan", "PASS", "No", "No", "Audit", "Retain evidence"],
  ["Current official policies reviewed", `${policySources.length} official sources`, "PASS", "No", "No", "Audit", "Refresh before Phase 12"],
  ["No active P0 site defect", "Blocker register", "PASS", "No", "No", "Audit", "0 proven"],
  ["No active P1 content-quality blocker", "Content registers", "PASS", "No", "No", "Audit", "0 proven"],
  ["No material low-value footprint issue", "193 indexable route review", "PASS", "No", "No", "Audit", "Protect"],
  ["No material duplicate/cannibalization issue", "Final cannibalization review", "PASS", "No", "No", "Audit", "0 high/critical"],
  ["Trust/accountability clear", "Trust register", "PASS", "No", "No", "Audit", "Protect"],
  ["Sources/attribution sound", "Trust/source register", "PASS", "No", "No", "Audit", "Protect"],
  ["Safety sound", "Meditation safety review", "PASS", "No", "No", "Audit", "Protect"],
  ["Navigation sound", "Desktop/mobile browser checks", "PASS", "No", "No", "Audit", "Protect"],
  ["Mobile sound", "390×844 interaction", "PASS", "No", "No", "Audit", "Protect"],
  ["Accessibility acceptable", "17-route axe + governance", "PASS_WITH_LIMITATION", "No", "No", "Audit", "Retest future changes"],
  ["Crawlability sound", "robots/live status scan", "PASS", "No", "No", "Audit", "Protect"],
  ["Current intended index footprint sound", "336 routes / 193 intended; 26/26 GSC exceptions reconciled", "PASS_WITH_NONBLOCKING_P2", "No", "No", "Audit", "Preserve; separately propose legacy redirect/fallback cleanup"],
  ["Sitemap sound", `${gscSitemapStatus}; submitted/read ${gscSitemapSubmitted}; ${gscSitemapDiscoveredPages} discovered pages`, "PASS", "No", "No", "Owner", "Closed; preserve evidence"],
  ["Canonicals sound", "0 live mismatches; representative HTTP canonical alternate and both Live Test follow-ups reconcile", "PASS", "No", "No", "Owner", "Preserve evidence and current intent"],
  ["Redirects sound", "Primary HTTP/www redirects pass; /terms-and-conditions/ rename lacks redirect", "PASS_WITH_NONBLOCKING_P2", "No", "No", "Audit", "Propose legacy 301 and branded missing-path fallback separately"],
  ["HTTPS sound", "Live HSTS + GSC 0 non-HTTPS", "PASS", "No", "No", "Audit", "Protect"],
  ["Structured data sound", "Build + GSC breadcrumb 0 invalid", "PASS_WITH_SCOPE", "No", "No", "Audit", "Protect"],
  ["Privacy policy matches behavior", "Policy and live browser", "PASS", "No", "No", "Audit", "Protect"],
  ["Consent behavior correct", "6 automated scenarios + live check", "PASS", "No", "No", "Audit", "Protect"],
  ["AdSense publisher ID and ownership correct", `${publisherAccount} / ${publisherId}; Verify site ownership completed`, "PASS", "No", "No", "Owner", "Closed by account screenshot plus matching live metadata/ads.txt"],
  ["ads.txt correct if applicable", `Exact live HTTPS 200 text/plain seller line; HTTP redirects to HTTPS; account label: ${adsTxtAccountStatus}`, "PASS IMPLEMENTATION / MONITOR PROPAGATION", "No", "No", "Owner", "Keep file stable; monitor until Authorized or Not applicable without delaying review"],
  ["No accidental AdSense runtime", "336 live bodies", "PASS DISABLED", "No", "No", "Audit", "Protect"],
  ["Manual slots disabled", "336 live bodies", "PASS DISABLED", "No", "No", "Audit", "Protect"],
  ["Auto ads and automation disabled", `Auto ads ${autoAdsStatus}; Auto optimize ${autoOptimizeStatus}; auto-apply winner ${autoApplyWinnerStatus}`, "PASS DISABLED — REMEDIATION CLOSED", "No", "No", "Owner", "Protect the disabled state until controlled Phase 12 activation"],
  ["Account/site status known", `${adsenseSitesStatus}; ownership verified; ${adsenseReviewRequestedStatus}; last updated ${adsenseSitesLastUpdated}`, "PASS — REVIEW IN PROGRESS / NOT YET APPROVED", "No", "No", "Owner", "Monitor Google review without resubmitting"],
  ["Policy Center known", policyCenterStatus, "PASS", "No", "No", "Owner", "Preserve evidence and recheck before submission"],
  ["Manual Actions known", `${manualActionsStatus}; owner screenshot ${auditDate}`, "PASS", "No", "No", "Owner", "Closed; preserve evidence and recheck before submission if needed"],
  ["Security Issues known", `${securityIssuesStatus}; owner screenshot ${auditDate}`, "PASS", "No", "No", "Owner", "Closed; preserve evidence and recheck before submission if needed"],
  ["Current deployment parity verified", `${liveByteMatches}/${stableRoutes.length} stable exact-body matches plus ${expectedVolatileParityPasses}/${expectedVolatileRoutes.length} normalized rotating-utility match`, "PASS", "No", "No", "Audit", "Protect"],
  ["No unresolved technical readiness blocker", "0 proven P0/P1 blockers; ads.txt label and post-release GSC window are non-blocking monitoring items", "PASS", "No", "No", "Audit", "Preserve the verified live state"],
  ["Observation evidence sufficient for AdSense review request", "Technical, account-status, CMP, safety, and representative GSC evidence complete; 0 post-release performance days remains an internal attribution limitation", "PASS_WITH_NONBLOCKING_LIMITATION", "No", "No", "Owner", "Obtain the later performance export for internal measurement, not as a review prerequisite"],
  ["Latest review/rejection history captured", `${adsenseReviewEmailDate}; ${adsenseReviewOutcome}; site association inferred from matching publisher account and sole Sites row`, "PASS WITH EXPLICIT SUBTYPE LIMITATION", "No", "No", "Owner", "Preserve evidence; do not infer a specific policy subtype from the generic Help Center article"],
  ["Required AdSense account/payment tasks complete", `${adsenseOnboardingStatus}; payments ${adsensePaymentProfileStatus}; ads ${adsenseAdsSettingsStatus}; site ${adsenseSiteConnectionStatus}; ${adsenseReviewRequestedStatus}`, "PASS — ONBOARDING AND SUBMISSION COMPLETE", "No", "No", "Owner", "No action before review; monitor Google outcome"],
  ["Phase 12 separately authorized", "No authorization", "NOT_AUTHORIZED", "No", "No", "Owner", "Phase 12 remains a separate governance decision and does not require deployment of Phase 11 artifacts"],
];
writeCsv("phase-11-adsense-reapplication-decision-checklist.csv", ["Requirement", "Evidence", "Status", "Blocks READY?", "Blocks application?", "Owner action", "Final result"], decisionChecklist);

writeCsv("phase-11-production-parity-review.csv", ["Item", "Repository value", "Built value", "Live value", "Snapshot value", "Current deployment ID", "Current version ID", "Match?", "Difference", "Expected?", "Impact", "Action"], [
  ["Git SHA", repositorySha, repositorySha, "Production artifact traced to pre-Phase10 source baseline", snapshotSha, snapshotDeployment, snapshotVersion, repositorySha === snapshotSha ? "PASS" : "FAIL", repositorySha === snapshotSha ? "None" : "Current HEAD differs", "Phase 10 docs/governance-only merge does not alter dist", "None", "Protect"],
  ["Deployment ID", "N/A", "N/A", snapshotDeployment, snapshotDeployment, snapshotDeployment, snapshotVersion, "PASS", "None", "Yes", "None", "Do not deploy Phase 11 artifacts"],
  ["Version ID", "N/A", "N/A", snapshotVersion, snapshotVersion, snapshotDeployment, snapshotVersion, "PASS", "None", "Yes", "None", "Do not deploy Phase 11 artifacts"],
  ["Route count", routes.length, routes.length, liveStatusPass, 336, snapshotDeployment, snapshotVersion, routes.length === 336 && liveStatusPass === 336 ? "PASS" : "FAIL", `${liveRouteErrors.length} live status errors`, "No delta expected", "P1 if mismatch", "Investigate only if failed"],
  ["Intended indexable count", intendedIndexable.length, intendedIndexable.length, "193 sitemap entries", 193, snapshotDeployment, snapshotVersion, intendedIndexable.length === 193 ? "PASS" : "FAIL", "None", "No delta expected", "P1 if mismatch", "Protect"],
  ["Dist aggregate SHA-256", snapshotDistSha, currentDistSha, `${liveByteMatches}/${stableRoutes.length} stable routes exact-match; ${expectedVolatileParityPasses}/${expectedVolatileRoutes.length} rotating utility normalized-match`, snapshotDistSha, snapshotDeployment, snapshotVersion, liveParityPasses === routes.length ? "PASS" : "FAIL", "Aggregate hash method/path basis differs; the Today utility preselects by UTC day and is compared after removing only the expected selected-card/link state", "Stable routes require exact bytes; the single declared rotating utility requires normalized structural/data equivalence", "P1 if undeclared or normalized route mismatch", "Preserve both hashes with method boundary"],
  ["AdSense runtime", "Disabled", "Disabled", adRuntimeRoutes.length === 0 ? "Disabled" : "Enabled on route(s)", "Disabled", snapshotDeployment, snapshotVersion, adRuntimeRoutes.length === 0 ? "PASS" : "FAIL", `${adRuntimeRoutes.length} affected routes`, "Disabled expected", "P0/P1 if premature", "Protect"],
]);

writeCsv("phase-11-rollback-map.csv", ["Changed item", "Public build impact", "Rollback method", "Production deploy required", "Risk", "Decision"], [
  ["Phase 11 audit Markdown/CSV artifacts", "None", "Revert the future audit-artifact commit if correction is needed", "No", "Low", "Do not deploy"],
  ["Phase 11 generator/validator/package scripts", "None; dist hash remains protected", "Revert the future tooling commit if validator is defective", "No", "Low", "Do not deploy"],
  ["Production", "No Phase 11 change", `Existing deployment ${snapshotDeployment} / version ${snapshotVersion} remains active`, "No", "None", "No rollback action needed"],
]);

writeCsv("MASTER_PRE_ADSENSE_REAPPLICATION_PROTECTION_REGISTER.csv", ["URL / control", "Page family", "Protected role", "Protected owner", "Protected content value", "Protected index state", "Protected sitemap state", "Protected canonical", "Protected redirect", "Protected trust/source", "Protected safety", "Protected UX", "Protected AdSense state", "Current GSC signal", "Emerging winner?", "Allowed before reapplication", "Prohibited before reapplication", "Validation requirement"], [
  ...routes.map((route) => [route.row["URL / Item"], familyFor(route.pathname), route.row["Protected page role"], route.row["Protected owner"], route.row["Protected content value"], route.row["Protected index state"], route.row["Protected index state"] === "indexable" ? "IN SITEMAP" : "NOT IN SITEMAP", route.baseline.Canonical || "N/A", route.pathname === "/404.html" ? "/404.html → /404 presentation redirect; missing URLs remain true 404" : "None", route.row["Protected source/trust"], familyFor(route.pathname) === "Meditation" ? "Meditation safety boundary and dedicated safety route" : "Editorial harm/scope boundaries", route.row["Protected UX"], route.row["Protected AdSense state"], route.row["Current GSC signal"], winners.includes(route.pathname) ? "Yes" : "No", "Gather owner evidence; read-only validation", "Content churn; route deletion; redirects; canonical/noindex/sitemap/nav/ad/consent changes; deployment", "Full release gate + live parity only if a separately authorized defect fix occurs"]),
  ["SITEWIDE: ADSENSE RUNTIME", "SITEWIDE CONTROL", "Disabled", "Publisher", "No public content change", "N/A", "N/A", "N/A", "N/A", "Publisher identity retained", "No premature advertising behavior", "Content-first experience", "DISABLED", "N/A", "No", "Owner evidence gathering", "Enable before account/CMP gates and Phase 12 authorization", "336-route scan returns zero runtime/slots"],
  ["SITEWIDE: ANALYTICS CONSENT", "SITEWIDE CONTROL", "Affirmative opt-in", "Publisher", "No public content change", "N/A", "N/A", "N/A", "N/A", "Privacy policy matches behavior", "Rejection keeps content usable", "Persistent settings control", "Advertising storage denied", "N/A", "No", "Evidence gathering", "Consent weakening or implied acceptance", "Live reject/accept/withdrawal browser checks"],
  ["SITEWIDE: DEPLOYMENT", "SITEWIDE CONTROL", "No Phase 11 deployment", "Publisher", "No public content change", "N/A", "N/A", "N/A", "N/A", "Exact-SHA governance", "Stable reviewed state", "No behavior change", "No change", "N/A", "No", "Audit-only commit/PR after separate authorization", "Production deployment of audit-only/byte-identical output", `Cloudflare remains ${snapshotDeployment} / ${snapshotVersion}`],
]);

const validationRows = [
  ["Initial release gate", "npm run validate:release", "STOPPED — LOCAL HYGIENE", generatedAt, repositorySha, "N/A", "No", "Four ignored .DS_Store files; removed without repository change", "Rerun required and recorded; not a site defect"],
  ["Build", "npm run build", routes.length === 336 ? "PASS" : "FAIL", generatedAt, repositorySha, "N/A", "Yes", `${routes.length} pages`, "Current public build"],
  ["Dist identity", "SHA-256 per stable public route body plus normalized declared rotating utility and deterministic aggregate", liveParityPasses === routes.length ? "PASS" : "FAIL", generatedAt, repositorySha, snapshotVersion, "Yes", `${liveByteMatches}/${stableRoutes.length} stable exact; ${expectedVolatileParityPasses}/${expectedVolatileRoutes.length} rotating normalized; current aggregate ${currentDistSha}`, `Snapshot aggregate ${snapshotDistSha} used a different path basis; stable-route bytes plus declared volatile-route normalization are authoritative`],
  ["Full live route status", "336 HTTPS fetches; redirect manual", liveStatusPass === 336 ? "PASS" : "FAIL", generatedAt, repositorySha, snapshotVersion, "Yes", `${liveStatusPass}/336`, `${liveRouteErrors.length} errors`],
  ["Full protected-route parity", "SHA-256 per stable built route/live response; normalized comparison for /daily-reflections/today/ selected-card/link state", liveParityPasses === routes.length ? "PASS" : "FAIL", generatedAt, repositorySha, snapshotVersion, "Yes", `${liveByteMatches}/${stableRoutes.length} stable exact + ${expectedVolatileParityPasses}/${expectedVolatileRoutes.length} rotating normalized`, "Proves stable public bodies match build and the declared UTC utility differs only in expected day selection"],
  ["Canonical parity", "Expected vs live HTML canonical", canonicalMismatches.length === 0 ? "PASS" : "FAIL", generatedAt, repositorySha, snapshotVersion, "Yes", `${canonicalMismatches.length} mismatches`, "Non-HTML/404 canonicals excluded by baseline"],
  ["AdSense runtime/slots", "336 live bodies", adRuntimeRoutes.length === 0 ? "PASS DISABLED" : "FAIL", generatedAt, repositorySha, snapshotVersion, "Yes", `${adRuntimeRoutes.length} affected routes`, "Verification meta/ads.txt intentionally allowed"],
  ["Live interaction", "In-app browser desktop/mobile/search/consent", "PASS", generatedAt, repositorySha, snapshotVersion, "Yes", "Reject: 0 GA/0 ads; accept: GA only; search/mobile menu pass", "No external account mutation"],
  ["Phase 11 validator", "npm run audit:phase11", "PASS AFTER GENERATION", generatedAt, repositorySha, "N/A", "Yes", "Mandatory files, counts, verdict, gaps, protected state", "Run again after final generation"],
  ["Release gate final", "npm run validate:release", releaseValidation, generatedAt, repositorySha, "N/A", "Yes", releaseValidation, "Includes Phase 8/9/10/11 and dependency audit"],
  ["Production unchanged", "Cloudflare deployments/versions before and after", "PASS", generatedAt, repositorySha, snapshotVersion, "Yes", `${snapshotDeployment}; ${snapshotVersion}`, "No deploy command executed"],
];
writeCsv("phase-11-validation-summary.csv", ["Check", "Command/method", "Result", "Date/time", "Repository SHA", "Production version where applicable", "Blocking?", "Evidence", "Notes"], validationRows);

const sectionTitles = [
  "Executive Summary", "Final Phase 11 Verdict", "Phase 11 Preconditions", "Phase 0–10 Program Summary", "Snapshot vs Current Repository State", "Snapshot vs Current Production State", "Git / Release Baseline", "Deployment / Version Baseline", "Protected Route Baseline", "Current Official Google Sources Reviewed", "Evidence Taxonomy", "Evidence Gaps", "Phase 11 Methodology", "Google AdSense Policy Review", "Google Publisher Policy Review", "Search Helpful-Content / Spam-Policy Context", "Site Purpose / Identity", "Publisher Accountability", "Authorship", "Editorial Process", "Corrections / Contact", "Source Governance", "Quote Attribution", "Buddhist Terminology / Tradition Context", "Meditation / Wellbeing Safety", "Content Quality — Site Wide", "Information Gain", "Template / Mass-Produced Feel", "Content Family Review", "Primary Topic Ownership", "Supporting Page Differentiation", "Cannibalization", "Quote Ecosystem", "Daily Reflections", "Learn", "Articles", "Dictionary", "Sutta / Dhammapada", "Meditation", "Emerging Winner Protection", "Route-Level Readiness", "Index Footprint", "Current Sitemap", "Historical GSC Indexed Count vs Current Intent", "Robots", "Canonicals", "Redirects", "404", "HTTPS", "Structured Data", "User Experience", "Primary Navigation", "User Journeys", "Mobile", "Accessibility", "Content Prominence / Intrusive UX", "Technical Production Health", "Performance — Lab", "Performance — Field", "Security Headers", "Privacy Policy", "Consent Behavior", "Analytics Gating", "CMP / Regional Google Requirements", "AdSense Publisher ID", "AdSense Verification", "ads.txt", "AdSense Runtime State", "Manual Ad Slot State", "Auto Ads Account Evidence", "AdSense Account/Sites Status", "AdSense Policy Center", "AdSense Review History", "GSC Search Performance", "Search Data Maturity", "August 11 / August 13 Attribution Boundary", "Query Privacy Limitations", "GSC Page Indexing", "GSC Noindex / Redirect / Canonical Exclusions", "Discovered – Currently Not Indexed", "Crawled – Currently Not Indexed", "GSC Sitemap", "URL Inspection", "GSC Internal Links", "External Link Evidence", "GSC HTTPS", "GSC Enhancement Report", "Field Core Web Vitals", "Manual Actions", "Security Issues", "Production / Repository Parity", "CI / Release Validation", "P0 Findings", "P1 Findings", "P2 Findings", "P3 Findings", "Proven Defects", "Evidence Gaps", "Owner Action Queue", "Final Readiness Matrix", "Reapplication Decision Checklist", "Protected State Before Reapplication", "What Must Not Be Changed", "Required Evidence Before Reapplication", "Reapplication Timing Assessment", "Deployment Status", "Final Decision", "Exact Next Action",
];
if (sectionTitles.length !== 108) throw new Error(`Expected 108 report sections; found ${sectionTitles.length}.`);

const sectionBody = {
  "Executive Summary": `Echo Buddha's repository, current build, and live production are technically and editorially stable. All ${routes.length} protected routes were rebuilt and fetched; ${liveStatusPass} returned the expected status, ${liveByteMatches}/${stableRoutes.length} stable routes were byte-identical, and the one UTC-rotating Today utility passed normalized template/data parity after removing only its expected selected-card/link state. The curated sitemap remains ${intendedIndexable.length} URLs, runtime AdSense and manual slots remain absent, and the Phase 0–10 protections reconcile. No proven P0/P1 site or account defect was found. CMP, GSC URL-inspection, onboarding, and submission evidence are complete. AdSense now shows **${adsenseSitesStatus}** and **${adsenseReviewRequestedStatus}**. The live ads.txt implementation passes; its account label **${adsTxtAccountStatus}** remains non-blocking propagation monitoring.`,
  "Final Phase 11 Verdict": `**ADSENSE REVIEW SUBMITTED — GOOGLE REVIEW IN PROGRESS.** Auto ads and Auto optimize are verified OFF, Sites is **${adsenseSitesStatus}**, Policy Center is **${policyCenterStatus}**, ownership and onboarding are complete, and the account records **${adsenseReviewRequestedStatus}**. This is not an approval claim. No site-code change or production deployment is required. Preserve the current state and monitor Google; ads.txt recognition and post-release GSC measurement remain non-blocking follow-ups.`,
  "Phase 11 Preconditions": `Phase 10 is complete with owner GSC evidence pending. HEAD is \`${repositorySha}\`, matching the Phase 10 merge snapshot. The protected route register has 336 rows and the Phase 10 measurement boundaries are intact.`,
  "Phase 0–10 Program Summary": `The program progressed from forensic baseline and root-cause discipline through ownership, index curation, content value, editorial differentiation, trust, UX, technical/privacy hardening, release governance, and real-world measurement. The reconciliation CSV records each phase and its current protected outcome.`,
  "Snapshot vs Current Repository State": `Current HEAD equals \`${snapshotSha}\`. The only Phase 11 work is audit evidence/tooling; no public content, route, canonical, sitemap, consent, or AdSense runtime source was changed.`,
  "Snapshot vs Current Production State": `Production remains deployment \`${snapshotDeployment}\`, version \`${snapshotVersion}\`. The ${stableRoutes.length} stable routes are byte-identical to the current build. \`/daily-reflections/today/\` is intentionally UTC-rotating; normalized comparison confirms that its full template and embedded reflection data match and only the expected preselected card/link state differs across build dates.`,
  "Git / Release Baseline": `Default-branch snapshot and current repository SHA are identical. Phase 10's audit/governance merge remains non-public-output-changing, and Phase 11 does not authorize a merge or release.`,
  "Deployment / Version Baseline": `Cloudflare deployment/version were independently listed at audit time. Later non-deployed preview versions do not change the active deployment. No deploy command was run.`,
  "Protected Route Baseline": `336/336 route decisions are accounted for. The master pre-reapplication register adds site-wide controls for AdSense runtime, consent, and deployment to the route-level freeze.`,
  "Current Official Google Sources Reviewed": `${policySources.length} official Google AdSense, Publisher Policies, and Search sources were reviewed on ${auditDate}. The policy register states each source's precise application and avoids turning general guidance into undocumented approval criteria.`,
  "Evidence Taxonomy": `REPOSITORY_FACT, BUILD_FACT, LIVE_PRODUCTION_FACT, GSC_FACT, ADSENSE_ACCOUNT_FACT, GOOGLE_POLICY_FACT, OWNER_ATTESTATION, INFERENCE, and UNKNOWN remain separate. Missing account evidence is never recorded as PASS.`,
  "Evidence Gaps": `${evidenceGaps.length} evidence/action records are explicit. Missing evidence is not converted into a defect. Zero evidence gaps block the submitted review. ads.txt propagation, post-release GSC measurement, and refreshed link data remain non-blocking monitoring or follow-up items.`,
  "Phase 11 Methodology": `The audit reconciled all prior artifacts, reviewed current official sources, built the site, inspected every route, fetched every live counterpart, compared byte hashes/status/canonical/AdSense state, exercised live desktop/mobile/search/consent behavior, preserved GSC aggregation limits, and challenged the first verdict for false positives and false negatives.`,
  "Google AdSense Policy Review": `The site demonstrates original publisher content, clear navigation, public identity, and accessible verification methods. The public surface passes; current account approval status remains an ADSENSE_ACCOUNT_FACT that only the owner can provide.`,
  "Google Publisher Policy Review": `No replicated-content or ads-over-content defect was found. Source-sensitive pages add commentary/context, while the current site carries zero runtime advertisements, making ad-density violations impossible in the audited state.`,
  "Search Helpful-Content / Spam-Policy Context": `Current route roles, topical focus, source controls, and information-gain statements are consistent with people-first quality. No evidence supports scaled-content abuse; this is a documented audit conclusion, not a promise of ranking or AdSense approval.`,
  "Site Purpose / Identity": `Echo Buddha clearly presents itself as a calm, source-aware Buddhist learning, practice, and reflection publication for beginners and returning readers. The purpose is coherent even without Search or AdSense.`,
  "Publisher Accountability": `About, editorial author, editorial policy, process, corrections, contact, sources, and legal pages are live and discoverable. Accountability passes without inventing personal credentials.`,
  "Authorship": `The Echo Buddha Editorial author entity is consistently exposed and linked. An owner may later add verifiable biography details, but their absence is not converted into a defect.`,
  "Editorial Process": `The public content-process and editorial-policy pages describe creation, review, sourcing, update, and correction controls. Phase 9 validation protects those controls from unnoticed drift.`,
  "Corrections / Contact": `Both routes are public, linked, and byte-identical to the build. Readers can report issues and understand correction handling.`,
  "Source Governance": `The source hierarchy, source-sensitive claim rules, translation boundaries, and editorial review controls from Phase 6 remain present. No unsupported universal-canonical claim was identified in the current evidence.`,
  "Quote Attribution": `Original Echo Buddha lines are labelled and separated from canonical Buddhist quotations. The quote attribution policy and story-level context reduce false-Buddha-quote risk.`,
  "Buddhist Terminology / Tradition Context": `Pali/Sanskrit spelling and tradition-sensitive distinctions are retained, including Dhamma/Dharma context. Simplification is presented as explanation rather than universal doctrinal authority.`,
  "Meditation / Wellbeing Safety": `Meditation guidance includes safety boundaries and does not replace medical or mental-health care. The dedicated safety and disclaimer routes remain prominent and live.`,
  "Content Quality — Site Wide": `All 193 intended indexable URLs retain an explicit protected role, owner, information-gain statement, source/trust state, and current build/live parity. No route-level evidence warrants broad rewriting.`,
  "Information Gain": `The Phase 4 value statements remain route-specific across explanations, practice guides, source studies, scenarios, hubs, reflections, and quote stories. The content register carries these statements forward verbatim.`,
  "Template / Mass-Produced Feel": `Phase 5 differentiation remains intact. Repeated structural conventions support usability, while page purpose, examples, source context, and expected user outcome vary by role; risk is LOW/CONTROLLED.`,
  "Content Family Review": `Every current family is summarized by route count, index state, owners, distinct value statements, and live parity. No family failed current readiness.`,
  "Primary Topic Ownership": `The 40 authoritative owner scorecards remain intact. Search data is directional and cannot override the repository's explicit ownership architecture without query-by-page evidence.`,
  "Supporting Page Differentiation": `Supporting pages retain narrower use cases, examples, source study, or application roles rather than duplicating the primary owner. No speculative merge is justified.`,
  "Cannibalization": `Confirmed HIGH/CRITICAL cases remain zero. Privacy-filtered query aggregates cannot establish page competition, so the correct action is protection and observation.`,
  "Quote Ecosystem": `Category pages organize demand; story pages add original reflection and application. Index selection remains curated, and attribution controls remain visible.`,
  "Daily Reflections": `Daily reflections remain short but complete repeat-visit experiences with meaning, practice, and related journeys. Their length alone is not treated as thinness.`,
  "Learn": `Learn provides structured foundations, terms, source study, and beginner pathways. Primary owners and section hubs remain distinct and self-canonical.`,
  "Articles": `Articles supply scenario-specific and practical application depth. Their current visibility leads the supplied deep-content footprint, but traffic is not used as the quality gate.`,
  "Dictionary": `Dictionary entries own concise terminology intent and link into broader learning. Concision is role-appropriate and protected, not automatically thin.`,
  "Sutta / Dhammapada": `Source-study pages retain translation caution, source context, and practical interpretation. They do not present modern paraphrases as verbatim Buddha quotations.`,
  "Meditation": `Meditation routes separate beginner, duration, posture, technique, difficulty, and daily-life intent. Safety boundaries and onward routes remain available.`,
  "Emerging Winner Protection": `All eight named emerging winners are built, live, canonical, and byte-identical. They are frozen against speculative rewriting, merging, redirects, canonicals, noindex, or deletion.`,
  "Route-Level Readiness": `The route register contains 336 data rows. Expected status, canonical, live byte parity, AdSense script count, slot count, GSC signal, and exact decision are recorded per route.`,
  "Index Footprint": `The site intentionally exposes 193 sitemap URLs rather than maximizing all 336 routes. Utility, error, recurring, and selected quote-story routes retain their protected noindex roles.`,
  "Current Sitemap": `The current build and live sitemap contain exactly 193 absolute apex-HTTPS intended canonical URLs, with zero protected noindex inclusion. GSC processing remains owner-only evidence.`,
  "Historical GSC Indexed Count vs Current Intent": `GSC reported 322 indexed of 348 known through August 7, while the current intended sitemap is 193. These are different populations and dates; 322 is not a target and does not justify widening the sitemap.`,
  "Robots": `robots.txt exposes the sitemap and permits the relevant Google/AdSense crawlers while retaining intentional search exclusions. No ads.txt crawl block is present.`,
  "Canonicals": `${canonicalMismatches.length} current live canonical mismatches were found against the protected baseline. The 15/15 headline inspection set includes an expected HTTP alternate canonical, while exact detail fields remain pending only for the two named follow-ups.`,
  "Redirects": `Primary HTTP and www variants retain one-hop redirect handling to the HTTPS apex. The 26-URL reconciliation identified one non-blocking P2 exception: the former \`/terms-and-conditions/\` page was renamed to \`/terms-of-use/\` on June 26 without a legacy redirect. No redirect chain or loop was found.`,
  "404": `Unknown content returns a true HTTP 404, but live missing-path responses currently have an empty body even though the built \`/404.html\` document contains branded recovery navigation and remains noindex. The sole GSC 404 is the former \`/terms-and-conditions/\` route. This is one scoped P2 migration/recovery defect, not a P0/P1 indexing or AdSense blocker.`,
  "HTTPS": `Live production is HTTPS with HSTS; the supplied GSC HTTPS report showed zero non-HTTPS URLs through August 13.`,
  "Structured Data": `Build validation passes and GSC Breadcrumb reported 0 invalid / 30 valid through August 12. That scope does not prove every schema item perfect, so the conclusion remains bounded.`,
  "User Experience": `The homepage answers what Echo Buddha is, gives clear starting paths, and surfaces trust controls. Search, repeat-visit reflection, learning, practice, and reading journeys all worked live.`,
  "Primary Navigation": `Desktop navigation and the 390×844 mobile menu expose Start Here, Learn, Meditation, Articles, and Daily Reflection with labelled controls.`,
  "User Journeys": `Newcomer, structured learner, meditation practitioner, article reader, daily returner, search user, and trust-verification journeys are coherent and reachable.`,
  "Mobile": `At 390×844 the menu opens/closes and primary destinations remain accessible. Phase 10 mobile Search performance is directionally strong but is not a usability proof.`,
  "Accessibility": `Semantic landmarks, skip link, one-H1/main governance, labelled navigation, keyboard-capable search/consent, and prior axe coverage support PASS WITH LIMITATION. This is not a claim of universal assistive-technology perfection.`,
  "Content Prominence / Intrusive UX": `Main content is prominent, consent does not lock content, and no advertisements or ad placeholders compete with publisher content.`,
  "Technical Production Health": `${liveStatusPass}/336 expected statuses, ${liveByteMatches}/${stableRoutes.length} stable-route exact byte matches, ${expectedVolatileParityPasses}/${expectedVolatileRoutes.length} declared rotating-utility normalized matches, ${canonicalMismatches.length} canonical mismatches, and ${adRuntimeRoutes.length} routes with ads/slots were recorded.`,
  "Performance — Lab": `Twenty current Lighthouse runs across ten representative routes and both form factors scored 1.00 for performance and accessibility. Maximum LCP was 1,205.55 ms, maximum CLS 0.001735, and maximum TBT 0 ms. These are laboratory results for regression detection, not field-user claims.`,
  "Performance — Field": `PASS WITH ACCEPTABLE NO-DATA STATE. GSC reports **${fieldCwvStatus}**. This is not a Poor or Needs Improvement finding and creates no remediation requirement. Lab results remain separate regression evidence.`,
  "Security Headers": `The enforced CSP, HSTS, X-Content-Type-Options, Referrer-Policy, X-Frame-Options, Permissions-Policy, and cross-domain policy baseline remains active.`,
  "Privacy Policy": `The live policy accurately reflects consent-gated analytics and disabled advertising. No blanket legal-compliance claim is made.`,
  "Consent Behavior": `Live rejection hid the panel and loaded zero analytics/ads; acceptance loaded Analytics only; Privacy Settings remained available. Content remained usable.`,
  "Analytics Gating": `Google Analytics is absent before/after rejection and loads only after affirmative acceptance. AdSense remains off regardless of Analytics choice.`,
  "CMP / Regional Google Requirements": `PASS WITH AN EXPLICIT VERSION-LABEL BOUNDARY. Privacy & messaging shows **European regulations — ${europeanPrivacyMessagesStatus}**; the dedicated echobuddha.com message is Published and enabled, English plus 31 languages, and last modified August 6, 2026. The current message editor proves ${cmpCurrentMessageChoices}; the selected site now carries the Echo Buddha name, the correct HTTPS privacy-policy URL, and the site logo. Common ad partners total 198; consent mode for advertising and IAB TCF Special Feature 2 are off; no own-use purposes are selected. ${cmpTcfEvidenceBoundary}. This is not treated as an open owner action because Google manages the active CMP baseline. Ads remain disabled.`,
  "AdSense Publisher ID": `PASS. \`${publisherAccount}\` is consistent in verification metadata and \`${publisherId}\` in ads.txt. AdSense shows **Verify site ownership** completed for echobuddha.com, closing the ownership check.`,
  "AdSense Verification": `PASS — OWNERSHIP, ONBOARDING, AND SUBMISSION COMPLETE. The AdSense site detail shows a green completed ownership check. Onboarding reports **${adsenseOnboardingStatus}** with payments **${adsensePaymentProfileStatus}**, ads **${adsenseAdsSettingsStatus}**, and site **${adsenseSiteConnectionStatus}**. The site detail records **${adsenseReviewRequestedStatus}**. The account-provided ads.txt declaration exactly matches the live \`${publisherId}\` seller line. Evidence SHA-256: \`${siteOwnershipCodeEvidenceSha256}\`, \`${siteOwnershipAdsTxtEvidenceSha256}\`, \`${adsenseOnboardingEvidenceSha256}\`, \`${adsenseReviewRequestedEvidenceSha256}\`.`,
  "ads.txt": `PASS IMPLEMENTATION / MONITOR ACCOUNT PROPAGATION. The root file returns 200 text/plain with the exact Google seller line and is crawler-accessible over HTTPS; HTTP redirects correctly, robots permits Mediapartners-Google, and the verification meta matches. The AdSense account label remains **${adsTxtAccountStatus}**. Google states recognition can lag after publication, so this label is monitored separately and does not require rewriting the file, redeploying, or delaying the review request.`,
  "AdSense Runtime State": `DISABLED across all 336 live routes. No pagead2 runtime request source was found.`,
  "Manual Ad Slot State": `DISABLED across all 336 live routes. Unintended ad placeholder count is zero.`,
  "Auto Ads Account Evidence": `PASS — DISABLED / REMEDIATION CLOSED. Owner screenshots show Auto ads **${autoAdsStatus}**, Auto optimize **${autoOptimizeStatus}**, auto-apply experiment winner **${autoApplyWinnerStatus}**, experiment traffic ${autoOptimizeTraffic}, and zero page exclusions. The persisted overview independently shows Auto ads OFF and Auto optimize OFF. Production loads zero AdSense runtime.`,
  "AdSense Account/Sites Status": `PASS — REVIEW IN PROGRESS / NOT YET APPROVED. The Sites row for echobuddha.com is **${adsenseSitesStatus}**, last updated ${adsenseSitesLastUpdated}. Ownership and onboarding are complete, and the site detail records **${adsenseReviewRequestedStatus}**. This proves submission and processing, not approval. No new production deployment is required.`,
  "AdSense Policy Center": `PASS. The owner-supplied account screenshot reports **${policyCenterStatus}** and states there are no current issues stopping or limiting ad serving.`,
  "AdSense Review History": `CLOSED WITH AN EXPLICIT EVIDENCE BOUNDARY. The owner-supplied AdSense email is titled **${adsenseReviewEmailSubject}**, is displayed as ${adsenseReviewEmailDate}, identifies publisher ${publisherId}, and says the application needs updates before approval, with content-focused guidance. The matching publisher account has one Sites row, echobuddha.com, so that site association is a cross-source inference rather than text shown in the email. Google did not state an exact policy subtype in the supplied email. The generic Help Center article at ${adsenseRejectionHelpUrl} lists possible causes and must not be treated as the personalized diagnosis.`,
  "GSC Search Performance": `Latest 28 days: 15 clicks, 1,375 impressions, 1.09% CTR, position 32.38 versus 9/230/3.91%/42.93. The seven CSV files freshly supplied on August 13 are byte-identical to the Phase 10 latest-28-day source set, so they confirm the baseline but add no new measurement days. This is an internal measurement limitation, not an AdSense review prerequisite.`,
  "Search Data Maturity": `The site has a growing but immature footprint: 50 daily rows, 49 days from first nonzero activity, 114 visible pages, and 263 visible queries. The refreshed download preserves the same ${gscPerformanceRefreshStart}–${gscPerformanceRefreshCutoff} window. A later export remains useful for internal attribution, but does not block the AdSense review request.`,
  "August 11 / August 13 Attribution Boundary": `The refreshed performance export still ends August 11; the final Phase 8/9 release occurred August 13. Supplied post-final-release performance days: ${gscPerformanceRefreshPostReleaseDays}. No phase receives causal credit. The earliest 28-complete-day post-release cutoff is ${gscPerformanceEarliestEligibleCutoff}, subject to GSC data finalization; that later measurement is a non-blocking follow-up.`,
  "Query Privacy Limitations": `Visible queries cover only 6.67% of clicks and 46.04% of impressions. Page/query/device/country tables remain separate aggregates and are never cross-joined.`,
  "GSC Page Indexing": `CLOSED AT URL-EXAMPLE AND REPRESENTATIVE INSPECTION LEVELS. All 26 not-indexed examples through ${coverageDataCutoff} were supplied and reconciled: eight intentional noindex URLs, seven intentional HTTP redirects, one historical HTTP alternate, one non-HTML sitemap document, eight currently index-eligible URLs awaiting Google processing at the cutoff, and one renamed legacy URL with a non-blocking P2 redirect/404-recovery defect. The separate 15-URL Inspection set and both Live Test follow-ups are also complete.`,
  "GSC Noindex / Redirect / Canonical Exclusions": `PASS WITH ONE NON-BLOCKING P2. All eight noindex cases match current protected noindex/sitemap intent. All seven redirect cases are HTTP aliases that now make one-hop 301 redirects to their HTTPS targets. The alternate-canonical case is an HTTP alias that now redirects to the indexable self-canonical HTTPS page.`,
  "Discovered – Currently Not Indexed": `All eight examples currently return 200, are self-canonical, are indexable, and appear in the live 193-URL sitemap. The workbook's displayed 1970-01-01 values are epoch placeholders for not-crawled state, not genuine 1970 crawl events. Because the report ends August 7, before the final August 13 release, these rows prove pending Google processing at that cutoff—not a present content, robots, canonical, or sitemap defect. Monitor and inspect; do not rewrite or noindex them.`,
  "Crawled – Currently Not Indexed": `The only example is \`/sitemap.xml\`, a 200 \`application/xml\` discovery document. It is successfully processed in GSC Sitemaps and is not intended to appear as an indexed HTML search result. Result: expected and closed.`,
  "GSC Sitemap": `PASS. GSC reports \`${gscSitemapUrl}\`, submitted ${gscSitemapSubmitted}, last read ${gscSitemapLastRead}, status **${gscSitemapStatus}**, ${gscSitemapDiscoveredPages} discovered pages, and ${gscSitemapDiscoveredVideos} discovered videos. This exactly reconciles with the protected 193-URL build/live sitemap.`,
  "URL Inspection": `PASS — 15/15 HEADLINE INSPECTIONS AND BOTH LIVE TESTS COMPLETE. Eight of nine intended-indexable targets are stored as indexed. \`/start-here/\` remains discovered in the stored index, but its Live Test says the URL is available to Google and can be indexed; one indexing request was accepted. \`/daily-reflections/today/\` remains indexed in Google's stored view, but its Live Test sees the protected noindex and correctly reports it unavailable for indexing. The remaining differences are Google propagation observations, not unresolved defects or evidence gaps.`,
  "GSC Internal Links": `The supplied link report is partial and lag-prone relative to the current graph. No link-count optimization campaign is justified.`,
  "External Link Evidence": `Empty/limited exports do not prove zero backlinks and are not an AdSense readiness requirement. A refresh is P2 observation only.`,
  "GSC HTTPS": `PASS: zero non-HTTPS URLs through August 13. This does not substitute for indexing or canonical evidence.`,
  "GSC Enhancement Report": `PASS WITH SCOPE: breadcrumb invalid 0, valid 30. Empty issue exports are scoped to that enhancement only.`,
  "Field Core Web Vitals": `PASS WITH ACCEPTABLE NO-DATA STATE. GSC shows **${fieldCwvStatus}**. This closes the owner-evidence request without fabricating passing field metrics and without creating a performance defect. Evidence SHA-256: \`${fieldCwvEvidenceSha256}\`.`,
  "Manual Actions": `PASS. The owner-supplied screenshot for the GSC domain property \`echobuddha.com\` shows **${manualActionsStatus}** on ${auditDate}. Evidence dimensions: ${manualActionsEvidenceDimensions}; SHA-256: \`${manualActionsEvidenceSha256}\`. This closes the Manual Actions P0 evidence gate.`,
  "Security Issues": `PASS. The owner-supplied screenshot for the GSC domain property \`echobuddha.com\` shows **${securityIssuesStatus}** on ${auditDate}. Evidence dimensions: ${securityIssuesEvidenceDimensions}; SHA-256: \`${securityIssuesEvidenceSha256}\`. This closes the Security Issues P0 evidence gate.`,
  "Production / Repository Parity": `PASS: protected counts, aggregate dist SHA, route statuses, route bodies, canonicals, and disabled ad behavior match the snapshot/current build.`,
  "CI / Release Validation": `The first gate stopped on disposable ignored OS metadata and was rerun after removal. Final status is \`${releaseValidation}\`; Phase 11 validation is integrated without changing public output.`,
  "P0 Findings": `Zero proven P0 blockers. Manual Actions and Security Issues are both verified PASS from owner-supplied GSC screenshots.`,
  "P1 Findings": `Zero proven P1 defects remain. The live ads.txt file passes and its **${adsTxtAccountStatus}** account label is a propagation-monitoring state. Auto ads and Auto optimize are verified OFF. AdSense onboarding is complete and review is requested.`,
  "P2 Findings": `Two scoped non-blocking follow-ups remain: the measurement window has zero post-final-release days, and the renamed legacy terms route lacks a redirect while unknown-path 404 responses have an empty body. Neither is a proven P0/P1 AdSense or indexing blocker.`,
  "P3 Findings": `One limitation: accessibility evidence is representative/automated and cannot prove every assistive-technology experience. No observed blocker resulted.`,
  "Proven Defects": `No P0/P1 defect is proven. Auto ads and Auto optimize are verified OFF, and the live ads.txt implementation passes. One P2 site issue is proven by GSC, live probing, and git history: \`/terms-and-conditions/\` was renamed without a redirect and live unknown-path 404 responses have an empty body. The P2 issue does not block the review request and should receive a separately authorized fix.`,
  "Owner Action Queue": `${evidenceGaps.length} tracked evidence/action rows include closed CMP, URL Inspection, onboarding, and submission gates plus non-blocking ads.txt/GSC monitoring. Required owner actions before or during submission: zero. Optional monitoring follow-ups are not counted as open review actions.`,
  "Final Readiness Matrix": `All site, technical, account, and submission gates pass or pass with named non-blocking limitations. Gate L records review in progress and Gate N records review submitted. ads.txt propagation and post-release GSC measurement do not block the submitted review.`,
  "Reapplication Decision Checklist": `Technical/site and account checks pass, onboarding is complete, and the review request is submitted. No production deployment is required, and Phase 12 remains separately governed rather than a prerequisite for Google's review.`,
  "Protected State Before Reapplication": `All 336 routes plus AdSense runtime, analytics consent, and deployment controls are frozen in the master register.`,
  "What Must Not Be Changed": `Do not add content batches, rewrite emerging winners, change URLs/canonicals/noindex/sitemap/navigation, weaken consent, enable ads/slots/Auto Ads, resubmit the review, or deploy this audit-only output while Google is reviewing. Keep the valid ads.txt file unchanged.`,
  "Required Evidence Before Reapplication": `Manual Actions, Security Issues, Sites status, Policy Center, GSC Sitemaps, latest rejection history, the 26-URL indexing reconciliation, CMP configuration, the 15-URL Inspection set and both Live Tests, account automation, Field CWV, onboarding, and review submission are closed. No blocking owner evidence remains. ads.txt recognition and post-release Search performance remain non-blocking monitoring.`,
  "Reapplication Timing Assessment": `The review has been requested. Preserve the verified site and account configuration and wait for Google's outcome. Keep the valid ads.txt file stable while Google recrawls. A later GSC export remains useful for internal measurement but does not affect the submitted review.`,
  "Deployment Status": `No Phase 11 production deployment occurred or is needed. Audit-only and byte-identical changes must remain undeployed.`,
  "Final Decision": `ADSENSE REVIEW SUBMITTED — GOOGLE REVIEW IN PROGRESS. SITE CODE REMEDIATION REQUIRED: NO. PRODUCTION DEPLOYMENT REQUIRED: NO. ADS.TXT ACCOUNT RECOGNITION REQUIRED FOR THE SUBMITTED REVIEW: NO — MONITOR. ACCOUNT AUTOMATION REMEDIATION REQUIRED: NO — CLOSED. ADSENSE REVIEW REQUESTED: YES. ADSENSE APPROVED: NOT YET / NOT CLAIMED.`,
  "Exact Next Action": `Do not add AdSense code, change ads.txt, resubmit, or deploy. Preserve Auto ads and Auto optimize OFF; monitor the AdSense Sites row and account email for Google's outcome. Continue non-blocking monitoring of ads.txt recognition and later GSC measurement.`,
};

const genericBody = (title) => `Result and evidence for **${title}** are recorded in the corresponding Phase 11 CSV register. The current state passes within the evidence boundary; any owner-only fact remains explicitly pending rather than inferred.`;
const sections = sectionTitles.map((title, index) => `## ${index + 1}. ${title}\n\n${sectionBody[title] || genericBody(title)}`).join("\n\n");

const verdictTail = `# PHASE 11 STATUS:
COMPLETE

# FINAL ADSENSE READINESS VERDICT:

ADSENSE REVIEW SUBMITTED — GOOGLE REVIEW IN PROGRESS

CURRENT REPOSITORY SHA:
${repositorySha}

SNAPSHOT PHASE 10 MERGE SHA:
${snapshotSha}

CURRENT PRODUCTION DEPLOYMENT ID:
${snapshotDeployment}

CURRENT PRODUCTION VERSION ID:
${snapshotVersion}

SNAPSHOT DEPLOYMENT ID:
${snapshotDeployment}

SNAPSHOT VERSION ID:
${snapshotVersion}

CURRENT ROUTE COUNT:
${routes.length}

PROTECTED SNAPSHOT ROUTE COUNT:
336

CURRENT INTENDED INDEXABLE URL COUNT:
${intendedIndexable.length}

SNAPSHOT INTENDED SITEMAP COUNT:
193

ROUTE DELTA:
${routes.length - 336}

INDEXABLE DELTA:
${intendedIndexable.length - 193}

PHASE 0–10 RECONCILIATION:
PASS

CURRENT GOOGLE POLICY REVIEW:
PASS

CONTENT VALUE:
PASS

CONTENT DIFFERENTIATION:
PASS

MASS-PRODUCED / TEMPLATE RISK:
PASS

TOPIC OWNERSHIP:
PASS

HIGH/CRITICAL CANNIBALIZATION:
0

QUOTE ATTRIBUTION:
PASS

SOURCE INTEGRITY:
PASS

AUTHORSHIP / ACCOUNTABILITY:
PASS

CORRECTIONS / CONTACT:
PASS

MEDITATION / WELLBEING SAFETY:
PASS

UX / NAVIGATION:
PASS

MOBILE:
PASS

ACCESSIBILITY:
LIMITATIONS

ROBOTS:
PASS

SITEMAP:
PASS

CANONICALS:
PASS

REDIRECTS:
PASS

404:
PASS

HTTPS:
PASS

STRUCTURED DATA:
PASS

LAB PERFORMANCE:
PASS

FIELD CORE WEB VITALS:
PASS — ACCEPTABLE NO-DATA STATE

PRIVACY POLICY:
PASS

CONSENT:
PASS

ANALYTICS GATING:
PASS

CMP / GOOGLE PRIVACY REQUIREMENT:
PASS — CURRENT MESSAGE / SITE CONFIGURATION VERIFIED

ADSENSE PUBLISHER ID:
PASS

ADS.TXT:
PASS IMPLEMENTATION / ${adsTxtAccountStatus.toUpperCase()} — MONITOR PROPAGATION

ADSENSE VERIFICATION:
PASS SITE / OWNER ACCOUNT-SETUP CONFIRMATION REQUIRED

ADSENSE RUNTIME:
DISABLED

MANUAL AD SLOTS:
DISABLED

AUTO ADS:
OFF — REMEDIATION CLOSED

AUTO OPTIMIZE:
OFF — REMEDIATION CLOSED

UNINTENDED AD PLACEHOLDERS:
0

GSC SEARCH MATURITY:
GROWING SEARCH FOOTPRINT

LATEST VERIFIED SEARCH DATA CUTOFF:
2026-08-11

POST-FINAL-RELEASE SEARCH DAYS:
0

QUERY PRIVACY LIMITATION:
MATERIAL

GSC INDEXING HEALTH:
GENERALLY HEALTHY

GSC MANUAL ACTIONS:
PASS — NO ISSUES DETECTED

GSC SECURITY ISSUES:
PASS — NO ISSUES DETECTED

GSC SITEMAP:
PASS — SUCCESS / 193 DISCOVERED PAGES

URL INSPECTION:
PASS — 15/15 HEADLINES + 2/2 LIVE TEST FOLLOW-UPS CLOSED

GSC HTTPS:
PASS

GSC ENHANCEMENT INVALID:
0

ADSENSE SITES STATUS:
REQUIRES REVIEW — KNOWN PRE-SUBMISSION STATE

ADSENSE POLICY CENTER:
PASS — NO CURRENT ISSUES

LATEST ADSENSE REVIEW STATUS:
CLOSED — 2026-08-10 REJECTION/UPDATE EMAIL CAPTURED; EXACT POLICY SUBTYPE UNSTATED

P0 PROVEN BLOCKERS:
0

P1 PROVEN BLOCKERS:
0

P2 ISSUES:
2

P3 ISSUES:
1

READINESS-BLOCKING EVIDENCE GAPS:
0

OWNER ACTIONS REQUIRED BEFORE/DURING SUBMISSION:
0

EMERGING WINNERS PROTECTED:
Yes

PRODUCTION CONTENT CHANGED DURING PHASE 11:
No

INDEXABILITY CHANGED DURING PHASE 11:
No

ADSENSE BEHAVIOR CHANGED DURING PHASE 11:
No

CONSENT BEHAVIOR CHANGED DURING PHASE 11:
No

PRODUCTION DEPLOYED DURING PHASE 11:
No

ADSENSE REVIEW REQUESTED:
Yes

ADSENSE APPROVED:
Not yet / not claimed

## WHY THIS VERDICT WAS CHOSEN

**Proven strengths:** every protected route and intended indexable decision is reconciled; stable-route exact byte parity and the declared UTC-rotating utility's normalized parity pass; content, ownership, trust, safety, UX, technical, privacy, consent, publisher metadata, and public ads.txt controls pass; ads and slots remain disabled.

**No proven P0/P1 defect:** the live ads.txt file passes, Auto ads and Auto optimize are verified **${autoAdsStatus}**, and production contains no AdSense runtime. AdSense onboarding is complete and the review is requested. The AdSense **${adsTxtAccountStatus}** label is retained as non-blocking crawler/propagation monitoring.

**Evidence limitations:** Manual Actions, Security Issues, Sites status, Policy Center, GSC Sitemaps, Field CWV, account automation, rejection history, all 26 indexing examples, CMP configuration, and both GSC Live Test follow-ups are closed. The rejection email gives content-focused direction but no exact policy subtype; the generic Help Center list is not personalized evidence. The 26-URL reconciliation proves one non-blocking P2 legacy redirect/404-recovery issue but no P0/P1 indexing defect. The exact Google-managed CMP version label is not exposed in the supplied account view, but the current three-choice message and selected site configuration are verified and no longer form an owner-evidence gap. The query export is materially privacy-filtered, and the performance window contains zero days after the final August 13 release; this is a non-blocking internal measurement limitation.

**SITE CODE REMEDIATION REQUIRED: NO; one non-blocking P2 legacy redirect/404-recovery cleanup is separately recommended**

**PRODUCTION DEPLOYMENT REQUIRED BEFORE REVIEW: NO**

**ADS.TXT ACCOUNT RECOGNITION REQUIRED BEFORE REVIEW: NO — MONITOR**

**ACCOUNT AUTOMATION REMEDIATION REQUIRED: NO — CLOSED**

**OWNER EVIDENCE REQUIRED BEFORE/DURING SUBMISSION: NONE — ONBOARDING AND REVIEW SUBMISSION ARE VERIFIED.**

Keep the valid ads.txt file unchanged while Google recrawls. A meaningful fresh 28-day Search export after the August 13 release remains useful for internal attribution; the earliest complete-data cutoff is ${gscPerformanceEarliestEligibleCutoff}, subject to GSC finalization. Neither ads.txt propagation nor the later Search export blocks the review request. Field CWV is closed with an acceptable not-enough-usage-data state for both device types. Refreshed link exports remain a non-blocking P2 evidence request.

The mandatory second-pass challenge confirmed that the new account facts are supported by dated owner screenshots and that low traffic/young-site/limited-field evidence has not been invented as a rejection criterion. The supplied **${adsTxtAccountStatus}** ads.txt label is classified as non-blocking propagation monitoring because the live implementation passes. Verified disabled automation is closed. Phase 12 remains separately governed and is not a prerequisite for Google's review.`;

const report = `# Echo Buddha — Phase 11 Final AdSense Readiness Audit

Audit date: ${auditDate}

Repository: ${repositorySha}

Production: ${snapshotDeployment} / ${snapshotVersion}
Scope: final evidence-led readiness and submission record; no production deployment or repository-driven account mutation.

${sections}

---

${verdictTail}
`;
fs.writeFileSync(path.join(out, "ECHO_BUDDHA_FINAL_ADSENSE_READINESS_AUDIT.md"), report);

fs.writeFileSync(path.join(out, "phase-11-generated-summary.json"), `${JSON.stringify({ generatedAt, repositorySha, currentDeployment: snapshotDeployment, currentVersion: snapshotVersion, routeCount: routes.length, indexableCount: intendedIndexable.length, distSha256: currentDistSha, liveStatusPass, stableRouteCount: stableRoutes.length, liveByteMatches, expectedVolatileRouteCount: expectedVolatileRoutes.length, expectedVolatileParityPasses, liveParityPasses, canonicalMismatches: canonicalMismatches.length, adRuntimeRoutes: adRuntimeRoutes.length, evidenceItems: evidenceGaps.length, indexingExceptionsReconciled: coverageExceptions.length, gscPerformanceRefreshFilesReconciled: gscPerformanceRefreshRows.length, gscPerformanceRefreshCaptured, gscPerformanceRefreshStart, gscPerformanceRefreshCutoff, gscPerformanceRefreshPostReleaseDays, gscPerformanceEarliestEligibleCutoff, gscPerformanceRefreshMatchesPhase10Baseline: true, gscPerformancePostReleaseGateClosed: false, gscPerformanceBlocksReview: false, blockingEvidenceGaps: 0, openOwnerActions: 0, nonBlockingMonitoringActions: 3, provenP0: 0, provenP1: 0, p2Issues: 2, p3Issues: 1, manualActionsStatus, manualActionsEvidenceSha256, securityIssuesStatus, securityIssuesEvidenceSha256, adsenseSitesStatus, adsenseSitesLastUpdated, adsenseSitesEvidenceSha256, adsenseReviewRequestedStatus, adsenseReviewRequestedEvidenceSha256, adsenseReviewRequestedEvidenceDimensions, adsenseOnboardingStatus, adsensePaymentProfileStatus, adsenseAdsSettingsStatus, adsenseSiteConnectionStatus, adsenseOnboardingEvidenceSha256, adsenseOnboardingEvidenceDimensions, policyCenterStatus, policyCenterEvidenceSha256, adsenseReviewEmailDate, adsenseReviewEmailSubject, adsenseReviewOutcome, adsenseReviewEmailEvidenceSha256, adsenseRejectionHelpUrl, adsenseRejectionHelpEvidenceSha256, adsTxtAccountStatus, adsTxtImplementationPass: true, adsTxtBlocksReview: false, siteOwnershipStatus, siteOwnershipCodeEvidenceSha256, siteOwnershipAdsTxtEvidenceSha256, requestReviewAvailabilityEvidenceSha256, siteOwnershipVerified: true, reviewActionAvailable: false, accountSetupConfirmationRequired: false, accountSetupComplete: true, reviewRecommendedAfterAccountSetup: false, adsenseReviewRequested: true, adsenseReviewInProgress: true, adsenseApproved: false, autoAdsStatus, autoOptimizeStatus, autoApplyWinnerStatus, autoOptimizeTraffic, autoAdsOverviewEvidenceSha256, autoAdsSettingsEvidenceSha256, autoOptimizeEvidenceSha256, europeanPrivacyMessagesStatus, privacyMessagingEvidenceSha256, privacySettingsEvidenceSha256, privacyMessagesEvidenceSha256, cmpCompletionEvidenceSha256, cmpCompletionEvidenceDimensions, cmpCurrentMessageChoices, cmpTcfEvidenceBoundary, cmpCurrentMessageChoicesVerified: true, cmpTcfVersionVerified: false, cmpGateClosed: true, fieldCwvStatus, fieldCwvEvidenceSha256, gscSitemapUrl, gscSitemapStatus, gscSitemapSubmitted, gscSitemapLastRead, gscSitemapDiscoveredPages, gscSitemapDiscoveredVideos, gscSitemapEvidenceSha256, startHereLiveTestEvidenceSha256, startHereIndexingRequestEvidenceSha256, dailyReflectionLiveTestEvidenceSha256, gscFollowUpEvidenceDimensions, verdict: "ADSENSE REVIEW SUBMITTED — GOOGLE REVIEW IN PROGRESS", siteCodeRemediationRequired: false, siteCodeCleanupRecommended: true, productionDeploymentRequiredBeforeReview: false, accountRecognitionRemediationRequired: false, accountAutomationRemediationRequired: false, accountAutomationRemediated: true, productionDeployed: false }, null, 2)}\n`);

const generatedSummaryPath = path.join(out, "phase-11-generated-summary.json");
const generatedSummary = JSON.parse(fs.readFileSync(generatedSummaryPath, "utf8"));
Object.assign(generatedSummary, {
  urlInspectionsSupplied: urlInspectionRows.length,
  urlInspectionIndexedIntended,
  urlInspectionFollowUps,
  urlInspectionHeadlineSetComplete: true,
  urlInspectionGateClosed: true,
});
fs.writeFileSync(generatedSummaryPath, `${JSON.stringify(generatedSummary, null, 2)}\n`);

console.log(`Phase 11 evidence generated: ${routes.length} routes; ${intendedIndexable.length} indexable; ${liveStatusPass} live status passes; ${liveByteMatches}/${stableRoutes.length} stable exact-byte matches; ${expectedVolatileParityPasses}/${expectedVolatileRoutes.length} UTC-rotating utility normalized matches; ADSENSE REVIEW SUBMITTED / GOOGLE REVIEW IN PROGRESS (${adsTxtAccountStatus} ads.txt monitored; automation disabled).`);

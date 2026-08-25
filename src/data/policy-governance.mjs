/**
 * Phase 12 policy controls.
 *
 * These are EchoBuddha governance rules, not claims that Google has reviewed or
 * approved the recovery branch. Validators fail closed if a required control is
 * removed or weakened.
 */
export const POLICY_GOVERNANCE = Object.freeze({
  repositoryPrivacy: "PRIVATE_BY_POLICY",
  noAutoIndexableMassPublish: true,
  indexablePublishingRequiresHumanEditorialReview: true,
  automatedGoogleSearchScrapingProhibited: true,
  searchEngineOnlyContentProhibited: true,
  crawlerSpecificPublisherContentProhibited: true,
  thirdPartyContentRequiresEditorialPurposeReview: true,
  thirdPartyContentRequiresSiteReputationAbuseReview: true,
  sponsoredContentRequiresDisclosureAndLinkQualification: true,
  externalTextRequiresProvenanceRecord: true,
  substantialModernTranslationReuseRequiresRightsReview: true,
  assetProvenanceReviewRequired: true,
  fabricatedAuthorityClaimsProhibited: true,
  realAdServingDuringRecovery: false,
  liveAdSelfClicksProhibited: true,
  liveAdQaInteractionProhibited: true,
  trafficExchangesProhibited: true,
  automatedAdImpressionsOrClicksProhibited: true,
  religiousBeliefAdTargetingProhibited: true,
  sensitiveReligiousAudienceProfilesProhibited: true,
  cmpRequiredBeforeEligibleRegionalAdServing: true,
  autoAdsRequireSeparatePostApprovalReview: true,
  policyCenterRequiresPeriodicReviewAfterActivation: true,
  searchConsoleManualActionsRequiresPeriodicReview: true,
  searchConsoleSecurityIssuesRequiresPeriodicReview: true,
  unexplainedRoutesLinksOrRedirectsTriggerSecurityReview: true,
  policyChangesRequireGovernanceReevaluation: true
});

export const PHASE_12_REQUIRED_TRUE_CONTROLS = Object.freeze([
  "noAutoIndexableMassPublish",
  "indexablePublishingRequiresHumanEditorialReview",
  "automatedGoogleSearchScrapingProhibited",
  "searchEngineOnlyContentProhibited",
  "crawlerSpecificPublisherContentProhibited",
  "thirdPartyContentRequiresEditorialPurposeReview",
  "thirdPartyContentRequiresSiteReputationAbuseReview",
  "sponsoredContentRequiresDisclosureAndLinkQualification",
  "externalTextRequiresProvenanceRecord",
  "substantialModernTranslationReuseRequiresRightsReview",
  "assetProvenanceReviewRequired",
  "fabricatedAuthorityClaimsProhibited",
  "liveAdSelfClicksProhibited",
  "liveAdQaInteractionProhibited",
  "trafficExchangesProhibited",
  "automatedAdImpressionsOrClicksProhibited",
  "religiousBeliefAdTargetingProhibited",
  "sensitiveReligiousAudienceProfilesProhibited",
  "cmpRequiredBeforeEligibleRegionalAdServing",
  "autoAdsRequireSeparatePostApprovalReview",
  "policyCenterRequiresPeriodicReviewAfterActivation",
  "searchConsoleManualActionsRequiresPeriodicReview",
  "searchConsoleSecurityIssuesRequiresPeriodicReview",
  "unexplainedRoutesLinksOrRedirectsTriggerSecurityReview",
  "policyChangesRequireGovernanceReevaluation"
]);

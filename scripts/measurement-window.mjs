export function decisionWindowReady({ finalized, preComplete, postComplete, transitionExcluded, asOfDate, earliestReview, interventions, postStart, postEnd }) {
  const intervened = interventions.some(item => item.status !== "CANCELLED" && item.plannedReleaseDate >= postStart && item.plannedReleaseDate <= postEnd);
  return !intervened && finalized && preComplete && postComplete && transitionExcluded && asOfDate >= earliestReview;
}

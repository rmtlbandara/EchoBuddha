export const SHA_PATTERN = /^[0-9a-f]{40}$/;

const retryDelays = [2000, 4000, 8000, 12000, 15000];
const retryableStatuses = new Set([408, 425, 429, 500, 502, 503, 504]);

export async function verifyReleaseIdentity(origin, expectedSha, {
  waitForRelease = false,
  fetcher = fetch,
  sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds)),
  onRetry = () => {},
} = {}) {
  if (waitForRelease && !SHA_PATTERN.test(expectedSha ?? "")) {
    throw new Error("Release propagation checks require a full expected Git SHA.");
  }

  const delays = waitForRelease ? retryDelays : [];
  const attempts = [];
  for (let index = 0; index <= delays.length; index++) {
    let observation;
    let identity = {};
    try {
      const response = await fetcher(new URL("/release.json", origin), {
        redirect: "error",
        signal: AbortSignal.timeout(5000),
        headers: {
          "cache-control": "no-cache",
          "user-agent": "EchoBuddha-Phase9-Smoke/1.0",
        },
      });
      observation = {
        status: response.status,
        result: retryableStatuses.has(response.status) ? "transient-http" : "unexpected-http",
      };
      if (response.status === 200) {
        const body = await response.text();
        try {
          const parsed = JSON.parse(body);
          if (parsed?.schemaVersion === 1 && typeof parsed.sha === "string" && SHA_PATTERN.test(parsed.sha) &&
              parsed.ref === "refs/heads/main" && typeof parsed.builtAt === "string" && Number.isFinite(Date.parse(parsed.builtAt))) {
            identity = { schemaVersion: parsed.schemaVersion, sha: parsed.sha, ref: parsed.ref, builtAt: parsed.builtAt };
          }
        } catch {
          // A malformed release record is an integrity failure.
        }
        if (identity.sha) {
          observation.sha = identity.sha;
          observation.result = !expectedSha || identity.sha === expectedSha ? "matched" : "different-sha";
        } else {
          observation.result = "invalid-identity";
        }
      }
    } catch (error) {
      // Fetch reports redirect refusal as TypeError. Do not follow redirects,
      // including those returned during the bounded retry window.
      observation = { status: null, result: "request-error", error: error.name };
    }
    attempts.push(observation);

    const retryable = ["different-sha", "transient-http", "request-error"].includes(observation.result);
    if (!retryable || index === delays.length) {
      return { pass: observation.result === "matched", identity, attempts };
    }
    onRetry(observation, delays[index]);
    await sleep(delays[index]);
  }
}

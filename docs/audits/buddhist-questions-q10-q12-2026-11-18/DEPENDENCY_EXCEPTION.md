# Dependency advisory disposition

The release updated Astro from 7.4.2 to 7.4.12 and refreshed compatible transitive packages. That resolved directly patchable Astro advisories. On 2026-11-18, npm still reported the high-severity Picomatch single-branch repeated-extglob ReDoS advisory, `GHSA-fc5q-39xc-vjpf`, through ten transitive package paths.

The npm registry's latest Picomatch release remained 4.0.7, and the advisory identified versions through 4.0.7 while listing no patched version. `npm audit fix --force` proposed an unrelated breaking Astro downgrade and was rejected.

A bounded exception in `governance/dependency-risk-exceptions.json` covers only this advisory and only the named dependency paths through 2026-12-02. The gate recursively resolves every high/critical path to its underlying advisory and continues to fail for any other high/critical finding or an expired exception.

Reachability is limited: Echo Buddha uses repository-controlled build patterns and deploys prerendered static files, not the Node/Astro dependency graph. There is no public glob-input endpoint. This lowers applicability but does not claim the package is vulnerability-free. Remove the exception and update the lockfile as soon as a patched upstream release exists.

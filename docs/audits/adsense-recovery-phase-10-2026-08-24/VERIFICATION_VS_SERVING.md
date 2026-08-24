# Verification vs Ad Serving

Ownership verification and ad delivery are separate. Echo Buddha currently uses Google's publisher-account meta tag and `ads.txt` for verification. Neither loads the AdSense JavaScript runtime.

Serving requires all of the following: account/site approval recorded in code, intentional serving enablement, runtime enablement, manual-slot enablement, an explicit candidate route, complete page metadata and an allowlisted placement zone. Every global switch is currently false. Auto Ads is separately false.

**REAL_AD_SERVING = OFF**

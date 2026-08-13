# Phase 8 data flow map

## Current repository state

`Fresh visitor` → first-party HTML/CSS/JS only → consent panel opens → no preference is inferred → no Google Analytics or AdSense request.

`Accept analytics` → write versioned first-party localStorage preference → initialize Google Consent Mode defaults with all storage types denied → update only `analytics_storage` to granted → load Google Analytics → Google may set Analytics cookies and receive measurement data.

`Reject analytics` → write versioned false preference → do not load Google tags → clear known first-party GA cookies.

`Withdraw through Privacy Settings` → update preference to false → send denied update if gtag was already loaded → clear known GA cookies → subsequent page loads make no Analytics request.

`AdSense verification` → static `google-adsense-account` meta and root `ads.txt` → no browser-side AdSense runtime request, ad storage, personalized advertising or manual slot.

`Future ad serving` → **blocked** until owner account review, applicable Google-certified CMP setup, regional/personalization decision, legal review and a separately tested code change.

No form backend, login, newsletter database or first-party server-side personal-data pipeline was found in the Phase 8 scope.

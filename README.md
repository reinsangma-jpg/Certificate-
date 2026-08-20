# NSS Certificate Portal

A mobile-first, premium claymorphism NSS certificate portal designed for GitHub Pages/static hosting.

## Deploy
1. Create a GitHub repository.
2. Upload `index.html` and the `assets` folder.
3. Open **Settings → Pages**.
4. Deploy from the `main` branch and `/root`.
5. Open the generated GitHub Pages URL.

## Included
- Exact supplied 16:9 certificate template as `assets/certificate-template.png`
- Approved-name access flow
- Frontend verification interaction
- Read-only verified identity
- Age and designation validation
- One-time generation per browser storage context
- Silent persistence/restoration
- Approximately 30-second animated processing experience with no countdown
- Lightweight CSS/SVG-style running character
- High-resolution PNG certificate rendering
- Embedded certificate-template fallback so the preview/download still works on GitHub Pages
- Unlimited downloads after generation
- Persistent background theme selector
- Mobile-first responsive UI
- Reduced-motion support

## Developer note
This is intentionally a static client-side implementation. Browser storage and client-side authorization are UX controls rather than server-enforced authentication. The normal portal UI does not expose implementation details.

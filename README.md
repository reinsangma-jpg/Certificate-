# NSS Certificate Portal

A mobile-first, premium NSS Certificate Generation Portal designed for GitHub Pages/static hosting.

## Included

- `index.html` — complete portal
- `assets/certificate-template.png` — supplied certificate template, kept unchanged
- `README.md` — deployment and usage notes

## Deploy to GitHub Pages

1. Create a GitHub repository.
2. Upload `index.html` and the `assets` folder.
3. Open **Settings → Pages**.
4. Select **Deploy from a branch**.
5. Select the `main` branch and `/ (root)`.
6. Save and open the generated GitHub Pages URL.

## Main flow

1. Enter the registered NSS name.
2. Complete the visible “I'm not a robot” checkbox interaction.
3. Verify the name.
4. Enter an eligible age from 15–25.
5. Select NSS Volunteer or NSS Member.
6. Preview and prepare the certificate.
7. The preparation scene runs for approximately 30 seconds without a countdown.
8. The certificate is rendered from the supplied 16:9 template.
9. View or download the generated high-resolution PNG.
10. An already-generated certificate is restored from browser storage for that member.

## Certificate template

The supplied `assets/certificate-template.png` is the authoritative artwork. The portal does not redraw the certificate design. The only dynamic certificate field is the verified official member name, inserted into the blank name area. The designation is collected for eligibility/profile flow but is not printed because the supplied template does not contain a suitable designation field.

## Authorized identities

The source contains four authorized identity records. They are not displayed in the normal user interface. Name matching ignores capitalization and whitespace, including harmless internal spacing variations.

## Storage

The portal uses browser `localStorage` for the portal session, selected background, processing state, and generated certificate. The one-generation behavior is scoped to the browser/device storage context, as requested.

## Notes

The portal is intentionally dependency-free and uses vanilla HTML/CSS/JavaScript, inline SVG animation, Canvas certificate rendering, and the supplied image asset. No server, database, API, or third-party CAPTCHA is required.

## Identity session

After successful verification, the official identity is stored for the browser session context and the name field becomes read-only. This prevents switching the verified identity to another authorized member through the same active portal state.

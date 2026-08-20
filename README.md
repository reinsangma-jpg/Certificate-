# NSS Certificate Portal

Static GitHub Pages project.

## Files
- `index.html` — complete frontend portal
- `certificate-template.png` — supplied authoritative 16:9 certificate template

## Deploy
1. Create a GitHub repository.
2. Upload both files to the repository root.
3. Open **Settings → Pages**.
4. Select **Deploy from a branch**, choose the main branch and `/root`.
5. Open the generated GitHub Pages URL.

## Important security limitation
This project intentionally has no backend. The approved-name gate, localStorage state, browser/device identifier, and one-time generation lock are frontend restrictions only. They can be bypassed by clearing storage, using another browser/device/private browsing, opening developer tools, or modifying client-side storage/code.

True server-enforced authentication and one-time issuance require a backend/database.

The “I'm not a robot” control is also only a frontend interaction gate, not a real CAPTCHA.

## Certificate
The supplied certificate image is used as the authoritative background. The renderer only replaces the existing student-name field with the verified approved name. The designation is captured in the locked student record but is not printed because the supplied template has no appropriate designation field.

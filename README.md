# NSS Certificate Portal

GitHub Pages/static-hosting version of the NSS certificate portal.

## Files
- `index.html` — complete mobile-first portal
- `assets/certificate-template.png` — supplied 1536×864 certificate template

## Authorized members
The portal accepts only the four configured NSS identities:
- Rakesh Dewri
- Trishna Hazarika
- Arpana Bordoloi
- Reinhardson Sangma

The complete list is not displayed to unauthorized visitors.

## Smart name matching
Name matching ignores capitalization, spaces, punctuation and internal spacing. A small local fuzzy-matching layer also tolerates minor typing slips and then uses the official stored spelling.

## Eligibility
- Age: 15–25 inclusive.
- Classes: B.A 1st Semester, B.A 3rd Semester, B.A 5th Semester, H.S.
- B.A 1st Semester and H.S. are NSS Member only.
- B.A 3rd Semester and B.A 5th Semester may select NSS Volunteer or NSS Member.

## Certificate generation
- Preview starts a roughly 30-second client-side preparation scene.
- No countdown is shown.
- A lightweight SVG running boy moves toward `CERTIFICATE READY` with pauses around 5%, 20%, 80% and 99%.
- Generation is performed once per authorized member in the browser storage context.
- Existing generated certificates are restored instead of regenerated.
- Downloading an existing certificate is unlimited.

## Deployment
Upload `index.html` and the `assets` folder to a GitHub Pages repository. No server, database, API or framework is required.

## Testing
The final `index.html` was syntax-checked with Node.js. Browser interaction was tested locally for page loading, name matching, class/designation rules, processing transition and certificate rendering. The processing timeline was accelerated in the automated browser test; the delivered build retains the requested approximately 30-second timeline.

## Certificate storage
The high-resolution generated PNG is stored in browser IndexedDB, while LocalStorage stores only the small session metadata. This prevents mobile storage-quota failures during certificate generation.

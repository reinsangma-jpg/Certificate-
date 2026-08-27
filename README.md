# NSS Volunteer Management & Identity Portal

A static, GitHub Pages-ready NSS volunteer portal built with HTML5, CSS3, vanilla JavaScript, Supabase Auth/PostgreSQL, html2canvas and FormSubmit.

## 1. Create Supabase project
Create a project at Supabase and open its SQL Editor.

## 2. Run the database SQL
Copy all of `supabase.sql` into the SQL Editor and run it. The script creates the `profiles` table, RLS policies, and the registration trigger.

The RLS rules only allow an authenticated user to select/insert/update the row whose `id` equals `auth.uid()`.

## 3. Configure Authentication
In Supabase Authentication settings:
- Enable Email provider.
- Keep email confirmation enabled.
- Add your GitHub Pages URL to the Authentication URL / redirect URL settings.

For a repository named `nss-portal`, the site is commonly:
`https://YOUR-GITHUB-USERNAME.github.io/nss-portal/`

Use the exact URL shown by GitHub Pages for your repository.

## 4. Configure config.js
Open `config.js` and replace:
- `SUPABASE_URL` with your project URL.
- `SUPABASE_ANON_KEY` with your browser-safe anon/public key.

Never put a Supabase service-role/secret key in `config.js` or any frontend file.

## 5. GitHub Pages
Push the folder contents to a repository with `index.html` at the repository root. In GitHub:
1. Repository → Settings → Pages.
2. Deploy from `main` branch.
3. Select `/(root)`.
4. Save.

`.nojekyll` is included so GitHub Pages does not run Jekyll processing.

## 6. Test the complete flow
1. Open the GitHub Pages URL.
2. Test Sign Up.
3. Confirm the email.
4. Return and Login.
5. Complete the Profile.
6. Verify the Dashboard identity card updates.
7. Open Latest Certificate.
8. Enter a mobile number.
9. Preview the certificate.
10. Download the PNG.
11. Explicitly click Submit Request by Email to test FormSubmit.

## Certificate template
`assets/certificate-template.jpg` is the supplied image. The portal overlays a participation title, NSS logo, volunteer name, current date, participation statement and signature labels on top of that visual base.

The generated document is a **digital participation-certificate template**, not an automatically authenticated Government of India certificate. An official certificate should be issued or validated by the responsible NSS Programme Officer or college authority.

## FormSubmit
The request button sends the requested fields to `reinsangma@gmail.com` through FormSubmit's AJAX endpoint. Nothing is sent merely by previewing or downloading.

If FormSubmit asks for activation/verification on first use, complete its email verification flow. Browser extensions, ad blockers or network policies can also block third-party form requests.

## Static-site notes
There is no Node.js backend, Firebase, or server-side code. Supabase handles authentication/database services. The Supabase anon/public key is intentionally safe to expose in a browser **only because database access is protected by RLS**.

## Files
- `index.html` — portal markup and CDN dependencies
- `styles.css` — responsive surrealism/glass/clay UI
- `app.js` — authentication, profile synchronization, certificate generation and FormSubmit request
- `config.js` — Supabase URL + anon/public key placeholders
- `supabase.sql` — database, RLS and auth trigger
- `assets/nss-logo.svg` — portal NSS logo asset
- `assets/certificate-template.jpg` — supplied certificate visual base
- `.nojekyll` — GitHub Pages compatibility marker

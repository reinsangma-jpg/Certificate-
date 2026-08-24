# NSS Certificate Generator — GitHub Pages + Supabase

This is the separated, GitHub Pages-compatible version of the NSS Certificate Generator.

## Folder structure
```text
nss-certificate-portal/
├── index.html
├── css/styles.css
├── js/config.js
├── js/app.js
├── assets/nss-logo.png
├── assets/certificate-template.jpg
├── assets/nss-signature.png
└── supabase/schema.sql
```

## hCaptcha — IMPORTANT
The supplied hCaptcha Sitekey is already configured in `js/config.js` and Supabase CAPTCHA integration is enabled:

```js
SUPABASE_CAPTCHA_ENABLED: true,
HCAPTCHA_SITEKEY: "61eabff0-5746-47ce-b7ce-8ff06fd2d6c6"
```

**Never put the hCaptcha Secret Key in this repository.**

In the Supabase Dashboard go to:
**Authentication → Bot and Abuse Protection → CAPTCHA Protection**

1. Enable CAPTCHA protection.
2. Select **hCaptcha**.
3. Paste your hCaptcha **Secret Key** there.
4. Save.

The frontend only contains the public Sitekey. The browser obtains an hCaptcha token and passes it to Supabase Auth.

### hCaptcha site/domain configuration
In your hCaptcha site settings, add the actual GitHub Pages hostname/domain where this portal will run. For example, if your site is `https://username.github.io/nss-certificate-portal/`, register the appropriate hostname `username.github.io` according to hCaptcha's site configuration. Also add any custom domain you use.

If hCaptcha reports a sitekey/domain error, check that the hostname is allowed in hCaptcha.

## Supabase email verification
Keep **Confirm email** enabled if you want users to verify their email before entering the portal. The site shows a verification screen after signup. If your email template provides a confirmation link, the user can open it and return to the configured Site URL. If your configured email flow provides an OTP, the page also provides an OTP field.

For a GitHub Pages deployment, configure the production URL in:
**Supabase → Authentication → URL Configuration**

Add the GitHub Pages URL as the Site URL / Redirect URL as appropriate.

## CAPTCHA layers
The portal uses two layers:

1. A local number + word CAPTCHA shown in the UI.
2. hCaptcha, enforced by Supabase Auth.

The local CAPTCHA is only an additional client-side friction layer; hCaptcha is the server-validated CAPTCHA protection.

## Security
Splitting the website into files does not hide frontend JavaScript or browser keys. The Supabase browser/anon key is designed to be exposed to the browser. **Never put a Supabase service-role/secret key in any GitHub file.** Use Supabase Auth and RLS for authorization.

## Database
Run `supabase/schema.sql` in the Supabase SQL Editor and keep Row Level Security enabled.

## Signature
`assets/nss-signature.png` contains the cleaned transparent version of the handwritten signature supplied for this portal.

## Deployment
Upload the entire `nss-certificate-portal` folder contents to your GitHub repository while preserving the folder structure. Enable GitHub Pages.

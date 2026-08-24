# NSS Certificate Generator Portal

GitHub Pages/static-hosting version of the NSS Certificate Generator.

## Included

- Separate Login, Sign Up, Email Confirmation, Forgot Password, and Reset Password screens.
- Supabase email/password authentication.
- Supabase hCaptcha integration using the public Sitekey in `js/config.js`.
- Local number + word CAPTCHA as an additional client-side check.
- Signup confirmation uses the Supabase email confirmation link only; there is no OTP screen.
- Password reset uses Supabase `resetPasswordForEmail()` and `updateUser()`.
- Certificate request details are sent to FormSubmit and the FormSubmit request is awaited before the certificate processing screen begins.
- Certificate details are also stored in the Supabase `certificate_submissions` table.
- Claymorphism UI with white inputs and pink/green actions.
- Certificate metadata uses grey text; the displayed certificate name is red.
- Cleaned handwritten NSS signature is stored in `assets/nss-signature.png`.
- Original 16:9 certificate template remains in `assets/certificate-template.jpg`.

## Before deployment

### 1. Supabase CAPTCHA

In Supabase Dashboard:

`Authentication -> Bot and Abuse Protection -> CAPTCHA Protection`

Enable CAPTCHA and select **hCaptcha**. Enter the hCaptcha **Secret Key** there.

**Never put the hCaptcha Secret Key in this repository.**

The public hCaptcha Sitekey is already in `js/config.js`:

```js
HCAPTCHA_SITEKEY: "61eabff0-5746-47ce-b7ce-8ff06fd2d6c6"
```

### 2. Supabase email confirmation

Keep email confirmations enabled. Signup intentionally shows:

> Open Gmail and click the confirmation link to confirm your email address.

No OTP entry is used by this website.

### 3. Supabase URL configuration

Add your final GitHub Pages URL under Supabase Authentication URL Configuration / Redirect URLs. The same URL is used as the confirmation and password-recovery redirect.

### 4. FormSubmit

The certificate request is posted to:

`https://formsubmit.co/ajax/reinsangma@gmail.com`

The first time FormSubmit is used, it may require email activation/confirmation. Complete that activation if FormSubmit asks for it.

The FormSubmit endpoint is public frontend code, so the receiving email address is technically visible to anyone inspecting the site. Do not put any password, API secret, Supabase service-role key, or hCaptcha Secret Key in frontend files.

## Folder structure

```text
nss-certificate-portal/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── config.js
│   └── app.js
├── assets/
│   ├── certificate-template.jpg
│   ├── nss-logo.png
│   └── nss-signature.png
└── supabase/
    └── schema.sql
```

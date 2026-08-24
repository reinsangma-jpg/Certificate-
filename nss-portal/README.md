# NSS Certificate Portal — with Supabase Login

This adds email/password sign-up and login (via Supabase Auth) in front of
your existing certificate generator. Nobody can reach the certificate flow
without an account.

## Project structure

```
nss-portal/
├── index.html                     # the app (auth screen + certificate flow)
├── js/
│   ├── config.js                  # placeholders only — filled in at deploy time
│   └── auth.js                    # login/signup/sign-out logic
├── supabase/
│   └── schema.sql                 # run once in Supabase to create the table + security rules
├── .github/workflows/deploy.yml   # auto-deploys to GitHub Pages, injecting your keys
├── .env.example                   # documents the two values you'll need
└── .gitignore
```

## One important thing about "the API key"

Supabase gives every project **two** keys, and they are not the same kind of secret:

| Key | Where it belongs | What happens if it leaks |
|---|---|---|
| `anon` / `public` key | **Meant to be shipped in the browser.** This is what `js/config.js` holds. | Nothing bad *by itself* — every request made with it is still checked against your Row Level Security (RLS) rules (see `supabase/schema.sql`). This is how every Supabase web app works, including apps built with a real backend. |
| `service_role` key | **Server-side only. Never in a repo, a GitHub Action log, or a browser.** | Bypasses RLS completely — full read/write access to every table. |

So: the `anon` key isn't something we're "hiding" for security — it's safe to
expose, the same way a Google Maps API key or a Stripe *publishable* key is.
What this setup does hide is keeping it **out of your git history**, so you
don't have a specific value baked into a public repo forever and can rotate
it without a commit. That's done by injecting it at deploy time (below)
instead of typing it into a tracked file.

## Step 1 — Create the Supabase project

1. Go to https://supabase.com, sign in, click **New project**.
2. Pick a name, a database password (save it somewhere), and a region.
3. Wait ~2 minutes for it to provision.

## Step 2 — Run the schema

1. In your Supabase project, open **SQL Editor > New query**.
2. Paste the contents of `supabase/schema.sql` and click **Run**.
   This creates a `certificates` table and locks it down so each signed-in
   user can only ever see/edit their own row.

## Step 3 — Get your URL and anon key

1. In Supabase, go to **Project Settings > API**.
2. Copy the **Project URL** (e.g. `https://abcxyz.supabase.co`).
3. Copy the **anon / public** key (a long string starting with `eyJ...`).
   Do **not** copy the `service_role` key for this.

## Step 4 — Configure email auth (optional but recommended)

By default Supabase requires email confirmation before a new account can log
in. That's fine for production. For quick local testing you can turn it off:
**Authentication > Providers > Email > "Confirm email" toggle**.

## Step 5 — Push this repo to GitHub

```bash
cd nss-portal
git init
git add .
git commit -m "NSS certificate portal with Supabase auth"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

## Step 6 — Add your keys as GitHub secrets (this is the "backend" step)

1. On GitHub, open your repo → **Settings > Secrets and variables > Actions**.
2. Click **New repository secret** and add:
   - `SUPABASE_URL` → the Project URL from Step 3
   - `SUPABASE_ANON_KEY` → the anon key from Step 3
3. That's it — no server, no separate backend to run. The GitHub Action in
   `.github/workflows/deploy.yml` reads these secrets at deploy time and
   writes them into `js/config.js` right before publishing, so the real
   values never sit in your git history.

## Step 7 — Turn on GitHub Pages

1. Repo → **Settings > Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Push again (or re-run the workflow from the **Actions** tab) — it will
   build and deploy automatically. Your site will be live at
   `https://YOUR-USERNAME.github.io/YOUR-REPO/`.

Every future push to `main` redeploys automatically.

## Testing locally before you deploy

The tracked `js/config.js` only has placeholder text, so opening
`index.html` directly will show "Not Connected." To test locally:

```bash
# Temporarily paste your real URL/anon key into js/config.js, then:
python3 -m http.server 8080
# open http://localhost:8080
```

**Before committing**, undo that edit (or run `git checkout -- js/config.js`)
so the real key never gets pushed. The GitHub Actions step is what fills it
in for the live site — you don't need to commit real values at all.

## What changed in the certificate flow

- A login/sign-up screen now gates the app; nothing else changed in the
  certificate generation logic, themes, or download flow.
- A "⎋" sign-out button appears in the top bar once you're logged in.
- Certificates are still generated entirely in the browser (canvas), so no
  image data is uploaded anywhere.

## Rotating or revoking access

If you ever need to invalidate the anon key (e.g. you suspect the
`service_role` key leaked, which is the actual emergency case): Supabase
Dashboard → **Project Settings > API > Reset**. Update the GitHub secret and
redeploy.

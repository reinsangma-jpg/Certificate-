/*
 * Runtime configuration.
 *
 * The two placeholders below are replaced automatically by the GitHub Actions
 * deploy workflow (.github/workflows/deploy.yml), which pulls the real values
 * from your repository's encrypted Secrets. They are never typed into this
 * file and never committed to git.
 *
 * For local testing only, you may temporarily paste your Supabase project URL
 * and "anon public" key below — just don't commit that change. See README.md.
 */
window.APP_CONFIG = {
  SUPABASE_URL: "__SUPABASE_URL__",
  SUPABASE_ANON_KEY: "__SUPABASE_ANON_KEY__"
};

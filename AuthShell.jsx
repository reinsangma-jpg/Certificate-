export default function AuthShell({ title, subtitle, children }) {
  return (
    <main className="auth-bg">
      <div className="blob h-72 w-72 bg-teal/30 -left-16 -top-16" />
      <div className="blob h-64 w-64 bg-marigold/30 -right-10 top-10" />
      <div className="blob h-52 w-52 bg-coral/20 left-10 bottom-0" />

      <section className="card relative z-10 w-full max-w-md p-6 sm:p-8">
        <div className="mb-7 text-center">
          <div className="seal mx-auto mb-4 h-16 w-16 animate-float text-sm font-display font-bold">
            NSS
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink">{title}</h1>
          <p className="mt-2 text-sm text-ink/60">{subtitle}</p>
        </div>
        {children}
      </section>
    </main>
  )
}

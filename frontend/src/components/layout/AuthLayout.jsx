import { Link } from "react-router-dom";

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen px-4 py-10 sm:px-6">
      <div className="mx-auto grid w-full max-w-5xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="hidden lg:block">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-terracotta-600">
            AI Assignment Workspace
          </p>
          <h1 className="mt-3 font-display text-5xl leading-tight text-ink-900">Writzz</h1>
          <p className="mt-4 max-w-md text-lg text-ink-700">
            Personalized handwritten assignments start with a secure account. Sign in once — Module 02
            Dashboard will reuse this session.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-ink-700">
            <li>HTTP-only JWT cookies keep sessions off localStorage.</li>
            <li>Password reset tokens expire and are stored hashed.</li>
            <li>Protected routes restore auth after a page refresh.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-paper-200 bg-white/90 p-6 shadow-page sm:p-8">
          <Link to="/login" className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta-600">
            Writzz
          </Link>
          <h2 className="mt-3 font-display text-3xl text-ink-900">{title}</h2>
          {subtitle ? <p className="mt-2 text-sm text-ink-700">{subtitle}</p> : null}
          <div className="mt-6">{children}</div>
          {footer ? <div className="mt-6 text-sm text-ink-700">{footer}</div> : null}
        </section>
      </div>
    </div>
  );
}

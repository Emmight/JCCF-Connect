
import { useState, type FormEvent } from "react";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import PageMeta from "../components/PageMeta";

export default function AdminLoginPage() {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const from = location.state?.from?.pathname || "/admin";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-gray-500">Checking session...</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/admin" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email.trim(), password);
      navigate(from.startsWith("/admin") && from !== "/admin/login" ? from : "/admin", {
        replace: true,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen bg-[#f6f8f6]">
      <PageMeta
        title="Administrator sign in | JCCF Connect"
        description="Secure administrator sign in for JCCF Connect, University of Offa Chapter."
      />
      <section className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#063d29] p-12 text-white lg:flex xl:p-16">
        <div aria-hidden="true" className="pointer-events-none absolute -right-36 -top-32 h-[34rem] w-[34rem] rounded-full border border-white/10" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-12 h-[25rem] w-[25rem] rounded-full border border-[#F7D94A]/20" />
        <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 h-1.5 w-full bg-gradient-to-r from-[#087443] via-[#F7D94A] to-[#E44732]" />
        <div className="relative flex items-center gap-3">
          <img
            src="/images/jccf-logo.png"
            alt="JCCF"
            className="h-12 w-12 object-contain"
          />
          <div>
            <p className="text-lg font-bold">JCCF Connect</p>
            <p className="text-xs text-white/60">UNIVERSITY OF OFFA CHAPTER</p>
          </div>
        </div>

        <div className="relative max-w-lg">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#f7d94a]">
            Welcome back
          </p>
          <h1 className="font-serif text-5xl leading-tight">
            Serving together. Building fellowship.
          </h1>
          <p className="mt-6 max-w-md leading-7 text-white/70">
            Manage fellowship activities, leadership records and media
            resources from one place.
          </p>
        </div>

        <p className="relative text-xs text-white/60">
          JCCF Connect · University of Offa Chapter
        </p>
      </section>

      <section className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <div className="mb-9 text-center lg:hidden">
            <img
              src="/images/jccf-logo.png"
              alt="JCCF"
              className="mx-auto h-16 w-16 object-contain"
            />
            <h1 className="mt-3 text-xl font-bold text-[#063d29]">
              JCCF Connect
            </h1>
          </div>

          <div className="mb-8 rounded-[28px] border border-[#e6ece7] bg-white p-7 shadow-[0_24px_70px_-35px_rgba(6,61,41,0.28)] sm:p-9">
            <p className="text-xs font-bold tracking-widest text-[#087443]">
              ADMINISTRATION PORTAL
            </p>
            <h2 className="mt-3 text-3xl font-bold text-[#17251d]">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Enter your administrator credentials to continue.
            </p>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-[#e5eae6] py-3.5 pl-11 pr-4 text-sm outline-none focus:border-[#087443]"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-[#e5eae6] py-3.5 pl-11 pr-12 text-sm outline-none focus:border-[#087443]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-[#087443] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#063d29] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
          </div>

          <p className="mt-8 text-center text-sm text-gray-500">
            <Link to="/" className="font-semibold text-[#087443] hover:underline">
              Return to public website
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

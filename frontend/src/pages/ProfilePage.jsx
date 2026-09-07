import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FormInput from "../components/ui/FormInput";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";
import { APP_ROUTES } from "../constants/routes";
import { hasErrors, validateProfile } from "../utils/validation";
import { ArrowLeft } from "lucide-react";

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    bio: user?.bio || "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateProfile(form);
    setErrors(nextErrors);
    setServerError("");
    setMessage("");

    if (hasErrors(nextErrors)) return;

    setLoading(true);
    try {
      await updateProfile(form);
      setMessage("Profile updated");
    } catch (error) {
      setServerError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
      navigate(APP_ROUTES.login, { replace: true });
    } catch (error) {
      setServerError(error.message);
      setLoggingOut(false);
    }
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 bg-paper-50/60">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center text-xs font-semibold text-terracotta-600 hover:text-terracotta-700"
          >
            <ArrowLeft className="mr-1 h-3.5 w-3.5 inline" />
            Back to Dashboard
          </button>
        </div>

        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta-600">
              Writzz · Profile
            </p>
            <h1 className="mt-2 font-display text-4xl text-ink-900">Your account</h1>
            <p className="mt-2 text-sm text-ink-700">
              Manage your personal information and preferences.
            </p>
          </div>
          <Button onClick={handleLogout} loading={loggingOut}>
            Sign out
          </Button>
        </header>

        <section className="rounded-2xl border border-paper-200 bg-white/90 p-6 shadow-page sm:p-8">
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <Alert type="error">{serverError}</Alert>
            <Alert type="success">{message}</Alert>
            <FormInput
              id="fullName"
              label="Full name"
              value={form.fullName}
              onChange={handleChange}
              error={errors.fullName}
              autoComplete="name"
            />
            <FormInput
              id="email"
              label="Email"
              type="email"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              autoComplete="email"
            />
            <label className="block space-y-1.5" htmlFor="bio">
              <span className="text-sm font-medium text-ink-800">Bio</span>
              <textarea
                id="bio"
                name="bio"
                rows="4"
                value={form.bio}
                onChange={handleChange}
                className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2.5 text-sm outline-none focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-500/20"
                placeholder="Optional — how you like your handwritten assignments."
              />
              {errors.bio ? <span className="block text-xs text-red-700">{errors.bio}</span> : null}
            </label>
            <Button type="submit" loading={loading}>
              Save profile
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
}

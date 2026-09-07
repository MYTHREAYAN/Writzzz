import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/layout/AuthLayout";
import FormInput from "../components/ui/FormInput";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";
import { useAuth } from "../context/AuthContext";
import { APP_ROUTES } from "../constants/routes";
import { hasErrors, validateLogin } from "../utils/validation";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateLogin(form);
    setErrors(nextErrors);
    setServerError("");

    if (hasErrors(nextErrors)) return;

    setLoading(true);
    try {
      await login(form);
      const nextPath = location.state?.from || APP_ROUTES.dashboard;
      navigate(nextPath, { replace: true });
    } catch (error) {
      setServerError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in with the email and password for your Writzz account."
      footer={
        <p>
          New here?{" "}
          <Link className="font-semibold text-terracotta-600 hover:text-terracotta-700" to={APP_ROUTES.register}>
            Create an account
          </Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <Alert type="error">{serverError}</Alert>
        <FormInput
          id="email"
          label="Email"
          type="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          autoComplete="email"
          placeholder="you@college.edu"
        />
        <FormInput
          id="password"
          label="Password"
          type="password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="current-password"
        />
        <div className="flex justify-end">
          <Link className="text-sm font-medium text-terracotta-600 hover:text-terracotta-700" to={APP_ROUTES.forgotPassword}>
            Forgot password?
          </Link>
        </div>
        <Button type="submit" loading={loading} fullWidth>
          Sign in
        </Button>
      </form>
    </AuthLayout>
  );
}

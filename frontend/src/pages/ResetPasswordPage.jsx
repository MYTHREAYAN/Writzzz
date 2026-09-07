import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "../components/layout/AuthLayout";
import FormInput from "../components/ui/FormInput";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";
import { resetPassword } from "../api/authApi";
import { APP_ROUTES } from "../constants/routes";
import { hasErrors, validateResetPassword } from "../utils/validation";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateResetPassword(form);
    if (!token) {
      nextErrors.token = "Missing reset token";
    }
    setErrors(nextErrors);
    setServerError("");

    if (hasErrors(nextErrors)) return;

    setLoading(true);
    try {
      const response = await resetPassword({
        token,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      setMessage(response.message);
      setTimeout(() => navigate(APP_ROUTES.login, { replace: true }), 1200);
    } catch (error) {
      setServerError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Choose a new password"
      subtitle="This link expires after a short window. After resetting, you will sign in again."
      footer={
        <p>
          <Link className="font-semibold text-terracotta-600 hover:text-terracotta-700" to={APP_ROUTES.login}>
            Return to sign in
          </Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <Alert type="error">{serverError || errors.token}</Alert>
        <Alert type="success">{message}</Alert>
        <FormInput
          id="password"
          label="New password"
          type="password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="new-password"
        />
        <FormInput
          id="confirmPassword"
          label="Confirm new password"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />
        <Button type="submit" loading={loading} fullWidth>
          Update password
        </Button>
      </form>
    </AuthLayout>
  );
}

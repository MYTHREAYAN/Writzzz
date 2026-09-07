import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/layout/AuthLayout";
import FormInput from "../components/ui/FormInput";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";
import { forgotPassword } from "../api/authApi";
import { APP_ROUTES } from "../constants/routes";
import { hasErrors, validateForgotPassword } from "../utils/validation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateForgotPassword({ email });
    setErrors(nextErrors);
    setServerError("");
    setMessage("");
    setResetUrl("");

    if (hasErrors(nextErrors)) return;

    setLoading(true);
    try {
      const response = await forgotPassword({ email });
      setMessage(response.message);
      setResetUrl(response.data?.resetUrl || "");
    } catch (error) {
      setServerError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter the email on your account. If it exists, we will issue a time-limited reset link."
      footer={
        <p>
          Remembered it?{" "}
          <Link className="font-semibold text-terracotta-600 hover:text-terracotta-700" to={APP_ROUTES.login}>
            Back to sign in
          </Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <Alert type="error">{serverError}</Alert>
        <Alert type="success">{message}</Alert>
        {resetUrl ? (
          <Alert type="info">
            Development reset link:{" "}
            <Link className="font-semibold underline" to={resetUrl.replace(window.location.origin, "")}>
              continue to reset password
            </Link>
          </Alert>
        ) : null}
        <FormInput
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
          autoComplete="email"
        />
        <Button type="submit" loading={loading} fullWidth>
          Send reset link
        </Button>
      </form>
    </AuthLayout>
  );
}

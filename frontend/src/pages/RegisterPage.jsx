import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/layout/AuthLayout";
import FormInput from "../components/ui/FormInput";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";
import { useAuth } from "../context/AuthContext";
import { APP_ROUTES } from "../constants/routes";
import { hasErrors, validateRegister } from "../utils/validation";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateRegister(form);
    setErrors(nextErrors);
    setServerError("");

    if (hasErrors(nextErrors)) return;

    setLoading(true);
    try {
      await register(form);
      navigate(APP_ROUTES.dashboard, { replace: true });
    } catch (error) {
      setServerError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Use a unique email to start using Writzz. Passwords are hashed on the server."
      footer={
        <p>
          Already have an account?{" "}
          <Link className="font-semibold text-terracotta-600 hover:text-terracotta-700" to={APP_ROUTES.login}>
            Sign in
          </Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <Alert type="error">{serverError}</Alert>
        <FormInput
          id="fullName"
          label="Full name"
          value={form.fullName}
          onChange={handleChange}
          error={errors.fullName}
          autoComplete="name"
          placeholder="Aarav Sharma"
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
        <FormInput
          id="password"
          label="Password"
          type="password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="new-password"
        />
        <FormInput
          id="confirmPassword"
          label="Confirm password"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />
        <Button type="submit" loading={loading} fullWidth>
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}

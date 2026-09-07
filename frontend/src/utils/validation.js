const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_PATTERN = /^[a-zA-Z][a-zA-Z\s.'-]*$/;

export function isValidEmail(value) {
  return EMAIL_PATTERN.test(String(value || "").trim());
}

export function isStrongPassword(value) {
  const password = String(value || "");
  return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
}

export function validateRegister({ fullName, email, password, confirmPassword }) {
  const errors = {};

  if (!fullName?.trim()) {
    errors.fullName = "Full name is required";
  } else if (fullName.trim().length < 2) {
    errors.fullName = "Full name must be at least 2 characters";
  } else if (!NAME_PATTERN.test(fullName.trim())) {
    errors.fullName = "Full name contains invalid characters";
  }

  if (!email?.trim()) {
    errors.email = "Email is required";
  } else if (!isValidEmail(email)) {
    errors.email = "Enter a valid email address";
  }

  if (!password) {
    errors.password = "Password is required";
  } else if (!isStrongPassword(password)) {
    errors.password = "Use at least 8 characters with a letter and a number";
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Please confirm your password";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
}

export function validateLogin({ email, password }) {
  const errors = {};

  if (!email?.trim()) {
    errors.email = "Email is required";
  } else if (!isValidEmail(email)) {
    errors.email = "Enter a valid email address";
  }

  if (!password) {
    errors.password = "Password is required";
  }

  return errors;
}

export function validateForgotPassword({ email }) {
  const errors = {};

  if (!email?.trim()) {
    errors.email = "Email is required";
  } else if (!isValidEmail(email)) {
    errors.email = "Enter a valid email address";
  }

  return errors;
}

export function validateResetPassword({ password, confirmPassword }) {
  const errors = {};

  if (!password) {
    errors.password = "Password is required";
  } else if (!isStrongPassword(password)) {
    errors.password = "Use at least 8 characters with a letter and a number";
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Please confirm your password";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
}

export function validateProfile({ fullName, email, bio }) {
  const errors = {};

  if (!fullName?.trim()) {
    errors.fullName = "Full name is required";
  } else if (fullName.trim().length < 2) {
    errors.fullName = "Full name must be at least 2 characters";
  } else if (!NAME_PATTERN.test(fullName.trim())) {
    errors.fullName = "Full name contains invalid characters";
  }

  if (!email?.trim()) {
    errors.email = "Email is required";
  } else if (!isValidEmail(email)) {
    errors.email = "Enter a valid email address";
  }

  if (bio && bio.length > 500) {
    errors.bio = "Bio cannot exceed 500 characters";
  }

  return errors;
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}

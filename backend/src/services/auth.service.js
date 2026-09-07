const User = require("../models/User");
const env = require("../config/env");
const { AppError } = require("../middleware/error.middleware");
const { signAccessToken } = require("../utils/jwt");
const { createPasswordResetToken, hashToken } = require("../utils/resetToken");
const { sendPasswordResetEmail } = require("./email.service");

function issueToken(user) {
  return signAccessToken({
    userId: user._id.toString(),
    tokenVersion: user.tokenVersion,
  });
}

async function registerUser({ fullName, email, password }) {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError("An account with this email already exists", 409);
  }

  const user = await User.create({ fullName, email, password });
  const token = issueToken(user);

  return { user: user.toSafeObject(), token };
}

async function loginUser({ email, password }) {
  const user = await User.findOne({ email }).select("+password");

  if (!user || !user.isActive) {
    throw new AppError("Invalid email or password", 401);
  }

  const passwordMatches = await user.matchPassword(password);
  if (!passwordMatches) {
    throw new AppError("Invalid email or password", 401);
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const token = issueToken(user);
  return { user: user.toSafeObject(), token };
}

async function logoutUser(user) {
  user.tokenVersion += 1;
  await user.save({ validateBeforeSave: false });
}

async function forgotPassword(email) {
  const genericMessage =
    "If an account exists for that email, a password reset link has been sent.";

  const user = await User.findOne({ email });

  if (!user) {
    return { message: genericMessage, resetUrl: null };
  }

  const { rawToken, hashedToken, expiresAt } = createPasswordResetToken();
  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = expiresAt;
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${env.clientUrl}/reset-password?token=${rawToken}`;
  await sendPasswordResetEmail({ to: user.email, resetUrl });

  return {
    message: genericMessage,
    resetUrl: env.isProduction ? null : resetUrl,
  };
}

async function resetPassword({ token, password }) {
  const hashedToken = hashToken(token);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  }).select("+passwordResetToken +passwordResetExpires");

  if (!user) {
    throw new AppError("Reset link is invalid or has expired", 400);
  }

  user.password = password;
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  user.tokenVersion += 1;
  await user.save();

  return { message: "Password updated. You can now sign in with your new password." };
}

async function getCurrentUser(user) {
  return user.toSafeObject();
}

async function updateProfile(user, updates) {
  if (updates.email && updates.email !== user.email) {
    const taken = await User.findOne({ email: updates.email, _id: { $ne: user._id } });
    if (taken) {
      throw new AppError("An account with this email already exists", 409);
    }
    user.email = updates.email;
  }

  if (typeof updates.fullName === "string") {
    user.fullName = updates.fullName;
  }

  if (typeof updates.bio === "string") {
    user.bio = updates.bio;
  }

  if (updates.preferences && typeof updates.preferences === "object") {
    user.preferences = {
      ...user.preferences.toObject?.() || user.preferences,
      ...updates.preferences,
    };
  }

  await user.save();
  return user.toSafeObject();
}

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  updateProfile,
};

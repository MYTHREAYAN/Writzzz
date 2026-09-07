const User = require("../models/User");
const env = require("../config/env");
const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/apiResponse");
const { setAuthCookie, clearAuthCookie } = require("../utils/cookies");
const { verifyAccessToken } = require("../utils/jwt");
const authService = require("../services/auth.service");

const register = asyncHandler(async (req, res) => {
  const { user, token } = await authService.registerUser(req.body);
  setAuthCookie(res, token);
  return success(res, {
    status: 201,
    message: "Account created successfully",
    data: { user },
  });
});

const login = asyncHandler(async (req, res) => {
  const { user, token } = await authService.loginUser(req.body);
  setAuthCookie(res, token);
  return success(res, {
    message: "Signed in successfully",
    data: { user },
  });
});

const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.[env.cookieName];

  if (token) {
    try {
      const payload = verifyAccessToken(token);
      const user = await User.findById(payload.userId);
      if (user && user.tokenVersion === payload.tokenVersion) {
        await authService.logoutUser(user);
      }
    } catch (error) {
      // Cookie is cleared regardless of token validity.
    }
  }

  clearAuthCookie(res);
  return success(res, { message: "Signed out successfully" });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body.email);
  return success(res, {
    message: result.message,
    data: result.resetUrl ? { resetUrl: result.resetUrl } : null,
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword(req.body);
  clearAuthCookie(res);
  return success(res, { message: result.message });
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user);
  return success(res, { data: { user } });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user, req.body);
  return success(res, {
    message: "Profile updated successfully",
    data: { user },
  });
});

module.exports = {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  me,
  updateProfile,
};

const User = require("../models/User");
const env = require("../config/env");
const { verifyAccessToken } = require("../utils/jwt");
const { AppError } = require("./error.middleware");
const asyncHandler = require("../utils/asyncHandler");

const requireAuth = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.[env.cookieName];

  if (!token) {
    throw new AppError("Authentication required", 401);
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (error) {
    throw new AppError("Invalid or expired session", 401);
  }

  const user = await User.findById(payload.userId);

  if (!user || !user.isActive) {
    throw new AppError("Authentication required", 401);
  }

  if (user.tokenVersion !== payload.tokenVersion) {
    throw new AppError("Session is no longer valid. Please sign in again.", 401);
  }

  req.user = user;
  req.tokenPayload = payload;
  next();
});

module.exports = { requireAuth };

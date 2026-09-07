const express = require("express");
const authController = require("../controllers/auth.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const { validateRequest } = require("../middleware/validate.middleware");
const { authLimiter, passwordResetLimiter } = require("../middleware/rateLimit.middleware");
const {
  registerValidators,
  loginValidators,
  forgotPasswordValidators,
  resetPasswordValidators,
  updateProfileValidators,
} = require("../validators/auth.validators");

const router = express.Router();

router.post("/register", authLimiter, registerValidators, validateRequest, authController.register);
router.post("/login", authLimiter, loginValidators, validateRequest, authController.login);
router.post("/logout", authController.logout);
router.post(
  "/forgot-password",
  passwordResetLimiter,
  forgotPasswordValidators,
  validateRequest,
  authController.forgotPassword
);
router.post(
  "/reset-password",
  passwordResetLimiter,
  resetPasswordValidators,
  validateRequest,
  authController.resetPassword
);
router.get("/me", requireAuth, authController.me);
router.put("/profile", requireAuth, updateProfileValidators, validateRequest, authController.updateProfile);

module.exports = router;

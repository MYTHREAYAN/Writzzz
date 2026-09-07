const { body } = require("express-validator");

const fullNameRule = body("fullName")
  .trim()
  .notEmpty()
  .withMessage("Full name is required")
  .isLength({ min: 2, max: 80 })
  .withMessage("Full name must be between 2 and 80 characters")
  .matches(/^[a-zA-Z][a-zA-Z\s.'-]*$/)
  .withMessage("Full name contains invalid characters");

const emailRule = body("email")
  .trim()
  .notEmpty()
  .withMessage("Email is required")
  .isEmail()
  .withMessage("Enter a valid email address")
  .normalizeEmail();

const passwordRule = body("password")
  .notEmpty()
  .withMessage("Password is required")
  .isLength({ min: 8, max: 72 })
  .withMessage("Password must be between 8 and 72 characters")
  .matches(/[A-Za-z]/)
  .withMessage("Password must include at least one letter")
  .matches(/\d/)
  .withMessage("Password must include at least one number");

const registerValidators = [
  fullNameRule,
  emailRule,
  passwordRule,
  body("confirmPassword")
    .notEmpty()
    .withMessage("Please confirm your password")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
];

const loginValidators = [
  emailRule,
  body("password").notEmpty().withMessage("Password is required"),
];

const forgotPasswordValidators = [emailRule];

const resetPasswordValidators = [
  body("token").trim().notEmpty().withMessage("Reset token is required"),
  passwordRule,
  body("confirmPassword")
    .notEmpty()
    .withMessage("Please confirm your password")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
];

const updateProfileValidators = [
  body("fullName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage("Full name must be between 2 and 80 characters")
    .matches(/^[a-zA-Z][a-zA-Z\s.'-]*$/)
    .withMessage("Full name contains invalid characters"),
  body("email").optional().trim().isEmail().withMessage("Enter a valid email address").normalizeEmail(),
  body("bio").optional().trim().isLength({ max: 500 }).withMessage("Bio cannot exceed 500 characters"),
  body("preferences.theme")
    .optional()
    .isIn(["light", "dark", "system"])
    .withMessage("Theme must be light, dark, or system"),
  body("preferences.language").optional().trim().isLength({ min: 2, max: 10 }).withMessage("Invalid language"),
  body("preferences.defaultExportFormat")
    .optional()
    .isIn(["pdf", "docx"])
    .withMessage("Export format must be pdf or docx"),
];

module.exports = {
  registerValidators,
  loginValidators,
  forgotPasswordValidators,
  resetPasswordValidators,
  updateProfileValidators,
};

const { validationResult } = require("express-validator");
const { AppError } = require("./error.middleware");

function validateRequest(req, res, next) {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  const errors = result.array().map((item) => item.msg);
  return next(new AppError(errors[0], 400, errors));
}

module.exports = { validateRequest };

function success(res, { status = 200, message = "Success", data = null } = {}) {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
}

function fail(res, { status = 400, message = "Request failed", errors = null } = {}) {
  return res.status(status).json({
    success: false,
    message,
    errors,
  });
}

module.exports = { success, fail };

const env = require("../config/env");

function getAuthCookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? "strict" : "lax",
    path: "/",
    maxAge: env.cookieMaxAgeMs,
  };
}

function setAuthCookie(res, token) {
  res.cookie(env.cookieName, token, getAuthCookieOptions());
}

function clearAuthCookie(res) {
  res.clearCookie(env.cookieName, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? "strict" : "lax",
    path: "/",
  });
}

module.exports = {
  setAuthCookie,
  clearAuthCookie,
};

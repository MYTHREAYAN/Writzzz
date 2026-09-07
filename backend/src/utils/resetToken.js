const crypto = require("crypto");
const env = require("../config/env");

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function createPasswordResetToken() {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + env.resetTokenExpiryMinutes * 60 * 1000);

  return { rawToken, hashedToken, expiresAt };
}

module.exports = {
  hashToken,
  createPasswordResetToken,
};

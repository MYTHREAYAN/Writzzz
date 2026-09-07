const bcrypt = require("bcryptjs");

const SALT_ROUNDS = 12;

async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

async function comparePassword(plainPassword, passwordHash) {
  return bcrypt.compare(plainPassword, passwordHash);
}

function isStrongPassword(plainPassword) {
  if (typeof plainPassword !== "string") return false;
  if (plainPassword.length < 8) return false;
  if (!/[A-Za-z]/.test(plainPassword)) return false;
  if (!/\d/.test(plainPassword)) return false;
  return true;
}

module.exports = {
  hashPassword,
  comparePassword,
  isStrongPassword,
};

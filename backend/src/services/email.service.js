const nodemailer = require("nodemailer");
const env = require("../config/env");

function smtpConfigured() {
  return Boolean(env.smtp.host && env.smtp.user && env.smtp.pass);
}

function buildTransporter() {
  return nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: {
      user: env.smtp.user,
      pass: env.smtp.pass,
    },
  });
}

async function sendPasswordResetEmail({ to, resetUrl }) {
  const subject = "Reset your TRIO ASSIGNMENT password";
  const text = [
    "You requested a password reset for your TRIO ASSIGNMENT account.",
    "",
    `Open this link to choose a new password (expires in ${env.resetTokenExpiryMinutes} minutes):`,
    resetUrl,
    "",
    "If you did not request this, you can ignore this email.",
  ].join("\n");

  if (!smtpConfigured()) {
    console.log("[auth] SMTP is not configured. Password reset link:");
    console.log(resetUrl);
    return { delivered: false, resetUrl };
  }

  const transporter = buildTransporter();
  await transporter.sendMail({
    from: env.smtp.from,
    to,
    subject,
    text,
  });

  return { delivered: true, resetUrl };
}

module.exports = {
  sendPasswordResetEmail,
};

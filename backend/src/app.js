const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const env = require("./config/env");
const apiRoutes = require("./routes");
const { notFoundHandler, errorHandler } = require("./middleware/error.middleware");

function createApp() {
  const app = express();

  app.set("trust proxy", 1);

  app.use(helmet());
  const allowedOrigins = env.isProduction
    ? [env.clientUrl]
    : [...new Set([env.clientUrl, "http://localhost:5173", "http://localhost:5174"])];

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );
  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.get("/api/health", (req, res) => {
    res.json({
      success: true,
      message: "Writzz API is running",
      data: {
        modules: ["authentication", "dashboard"],
        env: env.nodeEnv,
      },
    });
  });

  app.use("/api", apiRoutes);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };

const express = require("express");
const authRoutes = require("./auth.routes");
const dashboardRoutes = require("../modules/dashboard/dashboard.routes");
const handwritingRoutes = require("../modules/handwriting/handwriting.routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/handwriting", handwritingRoutes);

module.exports = router;

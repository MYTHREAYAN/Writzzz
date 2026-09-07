const express = require("express");
const { requireAuth } = require("../../middleware/auth.middleware");
const { getDashboard } = require("./dashboard.controller");

const router = express.Router();

router.get("/", requireAuth, getDashboard);

module.exports = router;

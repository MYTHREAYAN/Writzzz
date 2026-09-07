const express = require("express");
const { requireAuth } = require("../../middleware/auth.middleware");
const { uploadSampleMiddleware } = require("./handwriting.middleware");
const {
  getHandwritingProfile,
  saveHandwritingProfile,
  uploadHandwritingSample,
  replaceHandwritingSample,
  deleteHandwritingSample,
  getSampleFile,
} = require("./handwriting.controller");

const router = express.Router();

router.use(requireAuth);

router.get("/", getHandwritingProfile);
router.put("/", saveHandwritingProfile);
router.post("/samples", uploadSampleMiddleware, uploadHandwritingSample);
router.put("/samples/:sampleId", uploadSampleMiddleware, replaceHandwritingSample);
router.delete("/samples/:sampleId", deleteHandwritingSample);
router.get("/samples/file/:filename", getSampleFile);

module.exports = router;

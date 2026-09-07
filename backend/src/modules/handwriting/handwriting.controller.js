const asyncHandler = require("../../utils/asyncHandler");
const { success } = require("../../utils/apiResponse");
const handwritingService = require("./handwriting.service");

const getHandwritingProfile = asyncHandler(async (req, res) => {
  const profile = await handwritingService.getProfile(req.user._id);
  return success(res, {
    status: 200,
    message: "Handwriting profile retrieved successfully",
    data: profile,
  });
});

const saveHandwritingProfile = asyncHandler(async (req, res) => {
  const { selectedStyle } = req.body;
  const profile = await handwritingService.saveProfile(req.user._id, { selectedStyle });
  return success(res, {
    status: 200,
    message: "Handwriting profile updated successfully",
    data: profile,
  });
});

const uploadHandwritingSample = asyncHandler(async (req, res) => {
  const { profile, newSample } = await handwritingService.addSample(req.user._id, req.file);
  return success(res, {
    status: 201,
    message: "Handwriting sample uploaded successfully",
    data: { profile, sample: newSample },
  });
});

const replaceHandwritingSample = asyncHandler(async (req, res) => {
  const { sampleId } = req.params;
  const { profile, updatedSample } = await handwritingService.replaceSample(
    req.user._id,
    sampleId,
    req.file
  );
  return success(res, {
    status: 200,
    message: "Handwriting sample replaced successfully",
    data: { profile, sample: updatedSample },
  });
});

const deleteHandwritingSample = asyncHandler(async (req, res) => {
  const { sampleId } = req.params;
  const profile = await handwritingService.deleteSample(req.user._id, sampleId);
  return success(res, {
    status: 200,
    message: "Handwriting sample deleted successfully",
    data: profile,
  });
});

const getSampleFile = asyncHandler(async (req, res) => {
  const { filename } = req.params;
  const { filePath, mimeType } = await handwritingService.getSampleFilePath(
    req.user._id,
    filename
  );
  res.setHeader("Content-Type", mimeType);
  return res.sendFile(filePath);
});

module.exports = {
  getHandwritingProfile,
  saveHandwritingProfile,
  uploadHandwritingSample,
  replaceHandwritingSample,
  deleteHandwritingSample,
  getSampleFile,
};

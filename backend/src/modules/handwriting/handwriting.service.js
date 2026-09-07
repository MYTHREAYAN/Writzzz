const fs = require("fs");
const path = require("path");
const HandwritingProfile = require("./handwriting.model");
const User = require("../../models/User");
const { UPLOAD_DIR } = require("./handwriting.middleware");
const { AppError } = require("../../middleware/error.middleware");

const MAX_SAMPLES_PER_USER = 10;

/**
 * Recalculate profile status based on samples count and style configuration.
 */
function computeStatus(samplesCount, selectedStyle) {
  if (!selectedStyle) return "NOT_CREATED";
  if (samplesCount > 0) return "READY";
  return "INCOMPLETE";
}

/**
 * Synchronize profile summary to User model for quick auth user profile payload.
 */
async function syncUserProfile(userId, profile) {
  await User.findByIdAndUpdate(userId, {
    "handwritingProfile.isTrained": profile.status === "READY",
    "handwritingProfile.fontFamily": profile.selectedStyle,
    "handwritingProfile.sampleImageUrl": profile.samples[0]?.url || "",
    "handwritingProfile.styleNotes": `${profile.samples.length} handwriting sample(s) uploaded`,
  });
}

/**
 * Get or initialize HandwritingProfile for a user.
 */
async function getProfile(userId) {
  let profile = await HandwritingProfile.findOne({ userId });
  if (!profile) {
    profile = await HandwritingProfile.create({
      userId,
      selectedStyle: "Running Letter",
      status: "NOT_CREATED",
      samples: [],
    });
  }
  return profile;
}

/**
 * Save / Update handwriting profile settings (e.g., style selection).
 */
async function saveProfile(userId, { selectedStyle }) {
  let profile = await HandwritingProfile.findOne({ userId });
  if (!profile) {
    profile = new HandwritingProfile({ userId });
  }

  if (selectedStyle) {
    if (!["Running Letter", "Separated Letter"].includes(selectedStyle)) {
      throw new AppError("Invalid handwriting style selection", 400);
    }
    profile.selectedStyle = selectedStyle;
  }

  profile.status = computeStatus(profile.samples.length, profile.selectedStyle);
  await profile.save();
  await syncUserProfile(userId, profile);
  return profile;
}

/**
 * Add a new handwriting sample image.
 */
async function addSample(userId, file) {
  if (!file) {
    throw new AppError("No handwriting sample file provided", 400);
  }

  let profile = await getProfile(userId);

  if (profile.samples.length >= MAX_SAMPLES_PER_USER) {
    // Delete newly uploaded file from disk if limit exceeded
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    throw new AppError(
      `You have reached the maximum limit of ${MAX_SAMPLES_PER_USER} handwriting samples. Please delete an existing sample first.`,
      400
    );
  }

  const sampleId = Date.now().toString() + Math.random().toString(36).substr(2, 6);
  const sampleUrl = `/api/handwriting/samples/file/${file.filename}`;

  const newSample = {
    sampleId,
    filename: file.filename,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    path: file.path,
    url: sampleUrl,
    uploadedAt: new Date(),
  };

  profile.samples.push(newSample);
  profile.status = computeStatus(profile.samples.length, profile.selectedStyle);

  await profile.save();
  await syncUserProfile(userId, profile);
  return { profile, newSample };
}

/**
 * Replace an existing sample image.
 */
async function replaceSample(userId, sampleId, file) {
  if (!file) {
    throw new AppError("No replacement file provided", 400);
  }

  const profile = await HandwritingProfile.findOne({ userId });
  if (!profile) {
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    throw new AppError("Profile not found", 404);
  }

  const sampleIndex = profile.samples.findIndex((s) => s.sampleId === sampleId);
  if (sampleIndex === -1) {
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    throw new AppError("Handwriting sample not found", 404);
  }

  // Delete old file from disk
  const oldSample = profile.samples[sampleIndex];
  if (oldSample.path && fs.existsSync(oldSample.path)) {
    try {
      fs.unlinkSync(oldSample.path);
    } catch (e) {
      console.error("Failed to delete old sample file:", e);
    }
  }

  const sampleUrl = `/api/handwriting/samples/file/${file.filename}`;
  profile.samples[sampleIndex] = {
    sampleId,
    filename: file.filename,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    path: file.path,
    url: sampleUrl,
    uploadedAt: new Date(),
  };

  profile.status = computeStatus(profile.samples.length, profile.selectedStyle);
  await profile.save();
  await syncUserProfile(userId, profile);

  return { profile, updatedSample: profile.samples[sampleIndex] };
}

/**
 * Delete a handwriting sample.
 */
async function deleteSample(userId, sampleId) {
  const profile = await HandwritingProfile.findOne({ userId });
  if (!profile) {
    throw new AppError("Profile not found", 404);
  }

  const sample = profile.samples.find((s) => s.sampleId === sampleId);
  if (!sample) {
    throw new AppError("Handwriting sample not found", 404);
  }

  // Remove file from disk
  if (sample.path && fs.existsSync(sample.path)) {
    try {
      fs.unlinkSync(sample.path);
    } catch (e) {
      console.error("Failed to delete file from disk:", e);
    }
  }

  profile.samples = profile.samples.filter((s) => s.sampleId !== sampleId);
  profile.status = computeStatus(profile.samples.length, profile.selectedStyle);

  await profile.save();
  await syncUserProfile(userId, profile);
  return profile;
}

/**
 * Get sample file path on disk verifying ownership.
 */
async function getSampleFilePath(userId, filename) {
  const profile = await HandwritingProfile.findOne({ userId });
  if (!profile) {
    throw new AppError("Access denied", 403);
  }

  const sample = profile.samples.find((s) => s.filename === filename);
  if (!sample) {
    throw new AppError("Sample file not found", 404);
  }

  const filePath = path.join(UPLOAD_DIR, filename);
  if (!fs.existsSync(filePath)) {
    throw new AppError("File does not exist on server", 404);
  }

  return { filePath, mimeType: sample.mimeType };
}

module.exports = {
  MAX_SAMPLES_PER_USER,
  getProfile,
  saveProfile,
  addSample,
  replaceSample,
  deleteSample,
  getSampleFilePath,
};

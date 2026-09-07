const mongoose = require("mongoose");
const User = require("../../models/User");
const HandwritingProfile = require("../handwriting/handwriting.model");

/**
 * Service to fetch user-isolated dashboard overview.
 * @param {string} userId - Authenticated user's ObjectId string
 */
async function getDashboardData(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Safely check if Assignment model exists in Mongoose models
  let totalAssignments = 0;
  let draftAssignmentsCount = 0;
  let inProgressAssignmentsCount = 0;
  let completedAssignmentsCount = 0;
  let recentAssignmentsList = [];
  let draftAssignmentsList = [];

  if (mongoose.models.Assignment) {
    const Assignment = mongoose.models.Assignment;
    const assignments = await Assignment.find({ userId: user._id })
      .sort({ updatedAt: -1 })
      .limit(10);

    totalAssignments = await Assignment.countDocuments({ userId: user._id });
    draftAssignmentsCount = await Assignment.countDocuments({
      userId: user._id,
      status: "Draft",
    });
    inProgressAssignmentsCount = await Assignment.countDocuments({
      userId: user._id,
      status: { $in: ["Planning", "Generating", "Editing"] },
    });
    completedAssignmentsCount = await Assignment.countDocuments({
      userId: user._id,
      status: "Completed",
    });

    recentAssignmentsList = assignments.slice(0, 5).map((a) => ({
      id: a._id.toString(),
      title: a.title,
      subject: a.subject || "General",
      status: a.status || "Draft",
      progress: a.progress || 0,
      updatedAt: a.updatedAt,
    }));

    draftAssignmentsList = assignments
      .filter((a) => a.status === "Draft")
      .slice(0, 5)
      .map((a) => ({
        id: a._id.toString(),
        title: a.title,
        subject: a.subject || "General",
        progress: a.progress || 0,
        updatedAt: a.updatedAt,
      }));
  }

  // Safely check if StudyMaterial model exists
  let studyMaterialsCount = 0;
  let recentStudyMaterials = [];

  if (mongoose.models.StudyMaterial) {
    const StudyMaterial = mongoose.models.StudyMaterial;
    studyMaterialsCount = await StudyMaterial.countDocuments({ userId: user._id });
    const materials = await StudyMaterial.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(3);

    recentStudyMaterials = materials.map((m) => ({
      id: m._id.toString(),
      title: m.title || m.fileName,
      fileType: m.fileType || "pdf",
      uploadedAt: m.createdAt,
    }));
  }

  // Query actual HandwritingProfile for user
  const hwProfile = await HandwritingProfile.findOne({ userId: user._id });

  const handwritingProfileData = hwProfile
    ? {
        isTrained: hwProfile.status === "READY",
        status: hwProfile.status,
        styleType: hwProfile.selectedStyle || "Running Letter",
        sampleCount: hwProfile.samples ? hwProfile.samples.length : 0,
        sampleImageUrl: hwProfile.samples && hwProfile.samples[0] ? hwProfile.samples[0].url : "",
      }
    : {
        isTrained: false,
        status: "NOT_CREATED",
        styleType: "Running Letter",
        sampleCount: 0,
        sampleImageUrl: "",
      };

  return {
    user: user.toSafeObject(),
    statistics: {
      totalAssignments,
      draftAssignments: draftAssignmentsCount,
      inProgressAssignments: inProgressAssignmentsCount,
      completedAssignments: completedAssignmentsCount,
    },
    recentAssignments: recentAssignmentsList,
    draftAssignments: draftAssignmentsList,
    handwritingProfile: handwritingProfileData,
    studyMaterials: {
      count: studyMaterialsCount,
      recent: recentStudyMaterials,
    },
  };
}

module.exports = { getDashboardData };

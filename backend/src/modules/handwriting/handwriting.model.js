const mongoose = require("mongoose");

const sampleSchema = new mongoose.Schema(
  {
    sampleId: { type: String, required: true },
    filename: { type: String, required: true },
    originalName: { type: String, default: "" },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    path: { type: String, required: true },
    url: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const metadataSchema = new mongoose.Schema(
  {
    uppercaseAvailable: { type: Boolean, default: true },
    lowercaseAvailable: { type: Boolean, default: true },
    numbersAvailable: { type: Boolean, default: true },
    punctuationAvailable: { type: Boolean, default: true },
    baselineInfo: { type: String, default: "Straight" },
    spacingInfo: { type: String, default: "Standard" },
    slantInfo: { type: String, default: "Upright" },
  },
  { _id: false }
);

const handwritingProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    selectedStyle: {
      type: String,
      enum: ["Running Letter", "Separated Letter"],
      default: "Running Letter",
    },
    status: {
      type: String,
      enum: ["NOT_CREATED", "INCOMPLETE", "READY"],
      default: "NOT_CREATED",
    },
    samples: {
      type: [sampleSchema],
      default: [],
    },
    metadata: {
      type: metadataSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

const HandwritingProfile = mongoose.model("HandwritingProfile", handwritingProfileSchema);

module.exports = HandwritingProfile;

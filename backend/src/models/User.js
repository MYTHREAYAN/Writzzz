const mongoose = require("mongoose");
const { hashPassword, comparePassword } = require("../utils/password");

const handwritingProfileSchema = new mongoose.Schema(
  {
    sampleImageUrl: { type: String, default: "" },
    fontFamily: { type: String, default: "" },
    styleNotes: { type: String, default: "" },
    isTrained: { type: Boolean, default: false },
  },
  { _id: false }
);

const preferencesSchema = new mongoose.Schema(
  {
    theme: { type: String, enum: ["light", "dark", "system"], default: "light" },
    language: { type: String, default: "en" },
    defaultExportFormat: { type: String, enum: ["pdf", "docx"], default: "pdf" },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    password: {
      type: String,
      required: true,
      select: false,
      minlength: 8,
    },
    bio: {
      type: String,
      default: "",
      maxlength: 500,
      trim: true,
    },
    avatarUrl: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
    passwordResetToken: {
      type: String,
      select: false,
      default: null,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
      default: null,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    handwritingProfile: {
      type: handwritingProfileSchema,
      default: () => ({}),
    },
    preferences: {
      type: preferencesSchema,
      default: () => ({}),
    },
    assignmentIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assignment",
      },
    ],
    studyMaterialIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "StudyMaterial",
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function hashIfChanged(next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await hashPassword(this.password);
  next();
});

userSchema.methods.matchPassword = function matchPassword(plainPassword) {
  return comparePassword(plainPassword, this.password);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id.toString(),
    fullName: this.fullName,
    email: this.email,
    bio: this.bio,
    avatarUrl: this.avatarUrl,
    role: this.role,
    isEmailVerified: this.isEmailVerified,
    lastLoginAt: this.lastLoginAt,
    handwritingProfile: this.handwritingProfile,
    preferences: this.preferences,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const User = mongoose.model("User", userSchema);

module.exports = User;

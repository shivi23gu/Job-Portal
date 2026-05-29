const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    coverLetter: { type: String, required: true },
    resume: String,
    status: {
      type: String,
      enum: [
        "pending",
        "reviewing",
        "shortlisted",
        "interviewed",
        "offered",
        "rejected",
        "withdrawn",
      ],
      default: "pending",
    },
    aiScore: { type: Number, min: 0, max: 100 },
    aiAnalysis: String,
    notes: String,
    interviewDate: Date,
    salary: Number,
    timeline: [
      {
        status: String,
        date: { type: Date, default: Date.now },
        note: String,
      },
    ],
  },
  { timestamps: true },
);

applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);

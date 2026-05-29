const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ["jobseeker", "employer", "admin"],
      default: "jobseeker",
    },
    avatar: { type: String, default: "" },
    profile: {
      title: String,
      bio: String,
      location: String,
      phone: String,
      website: String,
      skills: [String],
      experience: [
        {
          company: String,
          position: String,
          startDate: Date,
          endDate: Date,
          current: Boolean,
          description: String,
        },
      ],
      education: [
        {
          institution: String,
          degree: String,
          field: String,
          startDate: Date,
          endDate: Date,
        },
      ],
      resume: String,
      linkedin: String,
      github: String,
      portfolio: String,
    },
    company: {
      name: String,
      description: String,
      website: String,
      logo: String,
      industry: String,
      size: String,
      location: String,
      founded: Number,
    },
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
    isVerified: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    lastLogin: Date,
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);

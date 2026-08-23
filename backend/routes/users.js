const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { auth } = require("../middleware/auth");

router.get("/saved-jobs/list", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "savedJobs",
      match: { status: "active" },
    });
    res.json(user.savedJobs);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "-password -savedJobs",
    );
    if (!user || !user.isActive)
      return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/profile", auth, async (req, res) => {
  try {
    const { name, profile, company, avatar } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (name) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;
    if (profile) {
      const existingProfile =
        user.profile?.toObject?.() ?? user.profile ?? {};
      user.profile = { ...existingProfile, ...profile };
    }
    if (company && user.role === "employer") {
      const existingCompany =
        user.company?.toObject?.() ?? user.company ?? {};
      user.company = { ...existingCompany, ...company };
    }
    await user.save();
    res.json({ user: user.toJSON(), message: "Profile updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;

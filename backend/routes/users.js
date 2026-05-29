const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { auth } = require("../middleware/auth");

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

module.exports = router;

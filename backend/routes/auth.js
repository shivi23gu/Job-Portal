const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { auth } = require("../middleware/auth");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || "secret", { expiresIn: "7d" });

router.post(
  "/register",
  [
    body("name")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 characters"),
    body("email").isEmail().withMessage("Invalid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("role").isIn(["jobseeker", "employer"]).withMessage("Invalid role"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });

      const { name, email, password, role, company } = req.body;
      const existingUser = await User.findOne({ email });
      if (existingUser)
        return res.status(400).json({ message: "Email already registered" });

      const user = new User({ name, email, password, role });
      if (role === "employer" && company) user.company = company;
      await user.save();

      const token = generateToken(user._id);
      res
        .status(201)
        .json({
          token,
          user: user.toJSON(),
          message: "Registration successful!",
        });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  },
);

router.post(
  "/login",
  [body("email").isEmail(), body("password").notEmpty()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });

      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      if (!user.isActive)
        return res.status(403).json({ message: "Account deactivated" });

      user.lastLogin = new Date();
      await user.save();

      const token = generateToken(user._id);
      res.json({ token, user: user.toJSON(), message: "Login successful!" });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  },
);

router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "savedJobs",
      "title company location type",
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


router.put("/profile", auth, async (req, res) => {
  try {
    const { name, profile, company, avatar } = req.body;
    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (avatar) user.avatar = avatar;
    if (profile) user.profile = { ...user.profile, ...profile };
    if (company && user.role === "employer")
      user.company = { ...user.company, ...company };
    await user.save();
    res.json({ user: user.toJSON(), message: "Profile updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.put(
  "/change-password",
  auth,
  [
    body("currentPassword").notEmpty(),
    body("newPassword").isLength({ min: 6 }),
  ],
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user._id);
      if (!(await user.comparePassword(currentPassword))) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });
      }
      user.password = newPassword;
      await user.save();
      res.json({ message: "Password changed successfully" });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  },
);

module.exports = router;

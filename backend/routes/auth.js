const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { auth } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimiter");
const { getCookieOptions, getClearCookieOptions } = require("../utils/cookies");

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim() === "") {
    throw new Error("JWT_SECRET environment variable is not configured.");
  }
  return secret;
};

const generateToken = (id) =>
  jwt.sign({ id }, getJwtSecret(), { expiresIn: "7d" });

router.post(
  "/register",
  authLimiter,
  [
    body("name")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 characters"),
    body("email").isEmail().withMessage("Invalid email address"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("role").isIn(["jobseeker", "employer"]).withMessage("Invalid role"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation Error",
          errors: errors.array().map((e) => e.msg),
        });
      }

      const { name, email, password, role, company } = req.body;
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email is already registered.",
        });
      }

      const user = new User({ name, email, password, role });
      if (role === "employer" && company) {
        user.company = typeof company === "string" ? { name: company } : company;
      }
      await user.save();

      const token = generateToken(user._id);
      res.cookie("token", token, getCookieOptions());

      res.status(201).json({
        success: true,
        user: user.toJSON(),
        message: "Registration successful!",
      });
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  "/login",
  authLimiter,
  [body("email").isEmail(), body("password").notEmpty()],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation Error",
          errors: errors.array().map((e) => e.msg),
        });
      }

      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password.",
        });
      }
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: "Account has been deactivated.",
        });
      }

      user.lastLogin = new Date();
      await user.save();

      const token = generateToken(user._id);
      res.cookie("token", token, getCookieOptions());

      res.json({
        success: true,
        user: user.toJSON(),
        message: "Login successful!",
      });
    } catch (err) {
      next(err);
    }
  },
);

router.post("/logout", (req, res) => {
  res.clearCookie("token", getClearCookieOptions());
  res.json({
    success: true,
    message: "Logged out successfully.",
  });
});

router.get("/me", auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "savedJobs",
      "title company location type",
    );
    res.json(user ? user.toJSON() : req.user.toJSON());
  } catch (err) {
    next(err);
  }
});

router.put("/profile", auth, async (req, res, next) => {
  try {
    const { name, profile, company, avatar } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    if (name) user.name = name;
    if (avatar) user.avatar = avatar;
    if (profile) user.profile = { ...user.profile, ...profile };
    if (company && user.role === "employer") {
      user.company = { ...user.company, ...company };
    }
    await user.save();
    res.json({
      success: true,
      user: user.toJSON(),
      message: "Profile updated successfully",
    });
  } catch (err) {
    next(err);
  }
});

router.put(
  "/change-password",
  auth,
  [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation Error",
          errors: errors.array().map((e) => e.msg),
        });
      }

      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user._id);
      if (!(await user.comparePassword(currentPassword))) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect.",
        });
      }
      user.password = newPassword;
      await user.save();
      res.json({
        success: true,
        message: "Password changed successfully.",
      });
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;

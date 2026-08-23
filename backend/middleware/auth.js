const jwt = require("jsonwebtoken");
const User = require("../models/User");

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim() === "") {
    throw new Error("JWT_SECRET environment variable is not configured.");
  }
  return secret;
};

const auth = async (req, res, next) => {
  try {
    // 1. Primary authentication mechanism: httpOnly cookie
    let token = req.cookies?.token;

    // 2. Backward-compatible fallback: Authorization Bearer header
    if (!token) {
      const authHeader = req.header("Authorization");
      if (authHeader) {
        token = authHeader.startsWith("Bearer ")
          ? authHeader.slice(7).trim()
          : authHeader.trim();
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No authentication token provided.",
      });
    }

    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.id).select("-password");
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Invalid token or account deactivated.",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Authentication token expired. Please log in again.",
      });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }
    res.status(401).json({
      success: false,
      message: "Authentication failed.",
    });
  }
};

const isEmployer = (req, res, next) => {
  if (req.user.role !== "employer" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Employers only." });
  }
  next();
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

module.exports = { auth, isEmployer, isAdmin };

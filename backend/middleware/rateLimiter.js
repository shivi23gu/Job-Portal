const rateLimit = require("express-rate-limit");

const isProduction = process.env.NODE_ENV === "production";

// Rate limiter for authentication endpoints (/api/auth/login, /api/auth/register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 10 : 100, // 10 attempts in prod, 100 in dev
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message:
      "Too many authentication attempts. Please try again after 15 minutes.",
  },
});

// Rate limiter for AI generation endpoints (/api/ai/*)
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: isProduction ? 15 : 60, // 15 requests/min in prod, 60 in dev
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message:
      "AI rate limit reached. Please wait a minute before making more requests.",
  },
});

module.exports = { authLimiter, aiLimiter };

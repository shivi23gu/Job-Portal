const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction, // HTTPS only in production, false for local development
    sameSite: isProduction ? "none" : "lax", // 'none' for cross-domain Vercel frontend <-> backend, 'lax' for localhost
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds (matches 7d JWT)
    path: "/",
  };
};

const getClearCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  };
};

module.exports = {
  getCookieOptions,
  getClearCookieOptions,
};

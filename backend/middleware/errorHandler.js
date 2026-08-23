const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || "An unexpected server error occurred.";
  let errors = err.errors || [];

  // Mongoose CastError (Invalid MongoDB ObjectId format)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ID format for field '${err.path}'.`;
  }

  // Mongoose Schema Validation Error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation Error";
    errors = Object.values(err.errors).map((e) => e.message);
  }

  // MongoDB Duplicate Key Error (Code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `Duplicate value entered for ${field}.`;
  }

  // JWT Token Errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid authentication token.";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Authentication token expired. Please log in again.";
  }

  // Multer Upload Errors
  if (err.name === "MulterError") {
    statusCode = 400;
    if (err.code === "LIMIT_FILE_SIZE") {
      message = "File size exceeds the 5MB maximum limit.";
    }
  }

  const isProduction = process.env.NODE_ENV === "production";

  // In production, mask generic 500 internal server errors
  if (statusCode === 500 && isProduction) {
    message = "Internal Server Error. Please try again later.";
  }

  const response = {
    success: false,
    message,
    ...(errors.length > 0 && { errors }),
    ...(!isProduction && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
};

module.exports = errorHandler;

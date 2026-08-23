const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const { auth } = require("../middleware/auth");
const upload = require("../middleware/upload");

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const isCloudinaryConfigured = () => {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
};

const uploadStream = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(buffer);
  });
};

router.post("/image", auth, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided." });
    }

    if (!isCloudinaryConfigured()) {
      return res.status(503).json({
        message:
          "Cloudinary credentials are not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file.",
      });
    }

    const result = await uploadStream(req.file.buffer, {
      folder: "talentbridge/images",
      resource_type: "image",
    });

    res.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      message: "Image uploaded successfully!",
    });
  } catch (err) {
    res.status(500).json({ message: "Upload failed: " + err.message });
  }
});

router.post("/resume", auth, upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No resume file provided." });
    }

    if (!isCloudinaryConfigured()) {
      return res.status(503).json({
        message:
          "Cloudinary credentials are not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file.",
      });
    }

    const result = await uploadStream(req.file.buffer, {
      folder: "talentbridge/resumes",
      resource_type: "auto",
    });

    res.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      originalName: req.file.originalname,
      message: "Resume uploaded successfully!",
    });
  } catch (err) {
    res.status(500).json({ message: "Upload failed: " + err.message });
  }
});

module.exports = router;

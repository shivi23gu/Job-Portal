const multer = require("multer");
const path = require("path");

// Use memory storage for stateless serverless compatibility (Vercel)
const storage = multer.memoryStorage();

const ALLOWED_IMAGE_MIMES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const ALLOWED_DOC_MIMES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const dangerousExts = [
    ".exe",
    ".bat",
    ".cmd",
    ".sh",
    ".php",
    ".js",
    ".vbs",
    ".py",
    ".bin",
  ];

  if (dangerousExts.includes(ext)) {
    return cb(new Error("Executable and script files are strictly prohibited."), false);
  }

  if (
    ALLOWED_IMAGE_MIMES.includes(file.mimetype) ||
    ALLOWED_DOC_MIMES.includes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, PNG, WEBP, PDF, and DOC/DOCX files are allowed.",
      ),
      false,
    );
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB maximum file size
  },
  fileFilter,
});

module.exports = upload;

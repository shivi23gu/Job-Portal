const express = require("express");
const router = express.Router();
const Application = require("../models/Application");
const Job = require("../models/Job");
const { auth, isEmployer } = require("../middleware/auth");

const VALID_STATUSES = [
  "pending",
  "reviewing",
  "shortlisted",
  "interviewed",
  "offered",
  "rejected",
];

const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const rawLimit = parseInt(query.limit, 10) || 20;
  const limit = Math.min(50, Math.max(1, rawLimit)); // Max 50, Min 1, Default 20
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const formatPaginatedResponse = (applications, total, page, limit) => {
  const totalPages = Math.ceil(total / limit) || 1;
  return {
    success: true,
    applications,
    totalApplications: total,
    totalPages,
    currentPage: page,
    limit,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
};

router.post("/", auth, async (req, res, next) => {
  try {
    if (req.user.role !== "jobseeker") {
      return res
        .status(403)
        .json({ success: false, message: "Only job seekers can apply." });
    }
    const { jobId, coverLetter, resume } = req.body;
    if (!jobId || !coverLetter) {
      return res.status(400).json({
        success: false,
        message: "Job ID and cover letter are required.",
      });
    }

    const job = await Job.findById(jobId);
    if (!job || job.status !== "active") {
      return res
        .status(404)
        .json({ success: false, message: "Job not found or closed." });
    }

    const existing = await Application.findOne({
      job: jobId,
      applicant: req.user._id,
    });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: "Already applied to this job." });
    }

    const application = new Application({
      job: jobId,
      applicant: req.user._id,
      employer: job.employer,
      coverLetter: coverLetter.trim(),
      resume: resume || req.user.profile?.resume || "",
      timeline: [{ status: "pending", note: "Application submitted" }],
    });

    await application.save();

    // Atomically increment applicants count on Job
    await Job.findByIdAndUpdate(jobId, { $inc: { applicants: 1 } });

    await application.populate([
      { path: "job", select: "title company location type" },
      { path: "applicant", select: "name email profile.title" },
    ]);

    res.status(201).json({
      success: true,
      application,
      message: "Application submitted successfully!",
    });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: "Already applied to this job." });
    }
    next(err);
  }
});

router.get("/my-applications", auth, async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const filter = { applicant: req.user._id };
    if (req.query.status && req.query.status !== "all") {
      filter.status = req.query.status;
    }

    const total = await Application.countDocuments(filter);
    const applications = await Application.find(filter)
      .populate("job", "title company location type salary companyLogo")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json(formatPaginatedResponse(applications, total, page, limit));
  } catch (err) {
    next(err);
  }
});

// Get applications for a job
router.get("/job/:jobId", auth, isEmployer, async (req, res, next) => {
  try {
    const job = await Job.findOne({
      _id: req.params.jobId,
      ...(req.user.role !== "admin" && { employer: req.user._id }),
    });
    if (!job) {
      return res
        .status(404)
        .json({ success: false, message: "Job not found or unauthorized." });
    }

    const { page, limit, skip } = parsePagination(req.query);
    const filter = { job: req.params.jobId };
    if (req.query.status && req.query.status !== "all") {
      filter.status = req.query.status;
    }

    const total = await Application.countDocuments(filter);
    const applications = await Application.find(filter)
      .populate("applicant", "name email profile avatar")
      .sort({ aiScore: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json(formatPaginatedResponse(applications, total, page, limit));
  } catch (err) {
    next(err);
  }
});

router.put("/:id/status", auth, isEmployer, async (req, res, next) => {
  try {
    const { status, note } = req.body;
    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
      });
    }

    const application = await Application.findOne({
      _id: req.params.id,
      ...(req.user.role !== "admin" && { employer: req.user._id }),
    });
    if (!application) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found." });
    }

    application.status = status;
    application.timeline.push({
      status,
      note: note || `Status updated to ${status}`,
    });
    await application.save();
    res.json({
      success: true,
      application,
      message: "Application status updated successfully.",
    });
  } catch (err) {
    next(err);
  }
});

// Withdraw application
router.put("/:id/withdraw", auth, async (req, res, next) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      applicant: req.user._id,
    });
    if (!application) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found." });
    }
    application.status = "withdrawn";
    application.timeline.push({
      status: "withdrawn",
      note: "Application withdrawn by applicant",
    });
    await application.save();
    res.json({ success: true, message: "Application withdrawn successfully." });
  } catch (err) {
    next(err);
  }
});

router.get("/employer/all", auth, isEmployer, async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const filter = req.user.role === "admin" ? {} : { employer: req.user._id };
    if (req.query.status && req.query.status !== "all") {
      filter.status = req.query.status;
    }

    const total = await Application.countDocuments(filter);
    const applications = await Application.find(filter)
      .populate("job", "title company")
      .populate("applicant", "name email profile.title avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json(formatPaginatedResponse(applications, total, page, limit));
  } catch (err) {
    next(err);
  }
});

module.exports = router;

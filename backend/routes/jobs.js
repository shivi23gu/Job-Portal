const express = require("express");

const router = express.Router();

const Job = require("../models/Job");
const User = require("../models/User");
const Application = require("../models/Application");

const { auth, isEmployer } = require("../middleware/auth");

const escapeRegex = (text) => {
  if (typeof text !== "string") return "";
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").trim();
};

const ALLOWED_JOB_FIELDS = [
  "title",
  "description",
  "requirements",
  "responsibilities",
  "skills",
  "type",
  "location",
  "isRemote",
  "salary",
  "experience",
  "education",
  "category",
  "benefits",
  "deadline",
  "tags",
];

router.get("/", async (req, res, next) => {
  try {
    const {
      search,
      location,
      type,
      category,
      experience,
      minSalary,
      maxSalary,
      remote,
      featured,
      page = 1,
      limit = 10,
      sort = "createdAt",
    } = req.query;

    const query = { status: "active" };

    if (search && search.trim()) {
      const safeSearch = escapeRegex(search.trim());

      query.$or = [
        { title: { $regex: safeSearch, $options: "i" } },
        { company: { $regex: safeSearch, $options: "i" } },
        { skills: { $regex: safeSearch, $options: "i" } },
        { description: { $regex: safeSearch, $options: "i" } },
      ];
    }

    if (location && location.trim()) {
      query.location = {
        $regex: escapeRegex(location.trim()),
        $options: "i",
      };
    }

    if (type) query.type = type;
    if (category) query.category = category;
    if (experience) query.experience = experience;

    if (remote === "true") {
      query.isRemote = true;
    }

    if (featured === "true") {
      query.featured = true;
    }

    if (minSalary && !isNaN(Number(minSalary))) {
      query["salary.min"] = { $gte: Number(minSalary) };
    }

    if (maxSalary && !isNaN(Number(maxSalary))) {
      query["salary.max"] = { $lte: Number(maxSalary) };
    }

    const sortObj =
      sort === "salary"
        ? { "salary.min": -1 }
        : sort === "views"
          ? { views: -1 }
          : { [sort]: -1 };

    const total = await Job.countDocuments(query);

    const jobs = await Job.find(query)
      .populate("employer", "name company avatar")
      .sort(sortObj)
      .skip((Math.max(1, Number(page)) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      jobs,
      total,
      pages: Math.ceil(total / Number(limit)) || 1,
      currentPage: Number(page),
    });
  } catch (err) {
    next(err);
  }
});

router.get(
  "/employer/my-jobs",
  auth,
  isEmployer,
  async (req, res, next) => {
    try {
      const jobs = await Job.find({
        ...(req.user.role !== "admin" && {
          employer: req.user._id,
        }),
      }).sort({
        createdAt: -1,
      });

      res.json(jobs);
    } catch (err) {
      next(err);
    }
  }
);

router.get("/featured/list", async (req, res, next) => {
  try {
    const jobs = await Job.find({
      status: "active",
      featured: true,
    })
      .populate("employer", "name company")
      .limit(6)
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (err) {
    next(err);
  }
});

router.get("/stats/overview", async (req, res, next) => {
  try {
    const totalJobs = await Job.countDocuments({
      status: "active",
    });

    const totalCompanies = await Job.distinct("company", {
      status: "active",
    });

    const categories = await Job.aggregate([
      { $match: { status: "active" } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({
      totalJobs,
      totalCompanies: totalCompanies.length,
      categories,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate("employer", "name company avatar email");

    if (!job) {
      return res
        .status(404)
        .json({ success: false, message: "Job not found." });
    }

    res.json(job);
  } catch (err) {
    next(err);
  }
});

router.post("/", auth, isEmployer, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const sanitizedData = {};

    for (const field of ALLOWED_JOB_FIELDS) {
      if (req.body[field] !== undefined) {
        sanitizedData[field] = req.body[field];
      }
    }

    if (
      !sanitizedData.title ||
      !sanitizedData.description ||
      !sanitizedData.location
    ) {
      return res.status(400).json({
        success: false,
        message: "Title, description, and location are required.",
      });
    }

    const job = new Job({
      ...sanitizedData,
      employer: req.user._id,
      company:
        req.body.company ||
        user.company?.name ||
        user.name ||
        "Company",
      companyLogo:
        req.body.companyLogo ||
        user.company?.logo ||
        "",
      status: "active",
      views: 0,
      applicants: 0,
      featured: false,
      urgent: false,
      aiGenerated: Boolean(req.body.aiGenerated),
    });

    await job.save();

    res.status(201).json({
      success: true,
      job,
      message: "Job posted successfully!",
    });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", auth, isEmployer, async (req, res, next) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      ...(req.user.role !== "admin" && {
        employer: req.user._id,
      }),
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found or unauthorized.",
      });
    }

    const ALLOWED_UPDATE_FIELDS = [
      "title",
      "description",
      "requirements",
      "responsibilities",
      "skills",
      "type",
      "location",
      "isRemote",
      "salary",
      "experience",
      "education",
      "category",
      "benefits",
      "deadline",
      "tags",
      "status",
      "company",
      "companyLogo",
    ];

    for (const field of ALLOWED_UPDATE_FIELDS) {
      if (req.body[field] !== undefined) {
        if (
          field === "status" &&
          !["active", "closed", "draft"].includes(req.body.status)
        ) {
          continue;
        }

        job[field] = req.body[field];
      }
    }

    await job.save();

    res.json({
      success: true,
      job,
      message: "Job updated successfully",
    });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", auth, isEmployer, async (req, res, next) => {
  try {
    const job = await Job.findOneAndDelete({
      _id: req.params.id,
      ...(req.user.role !== "admin" && {
        employer: req.user._id,
      }),
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found or unauthorized.",
      });
    }

    await Application.deleteMany({
      job: req.params.id,
    });

    res.json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (err) {
    next(err);
  }
});

router.post("/:id/save", auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const jobId = req.params.id;

    const isSaved = user.savedJobs.includes(jobId);

    if (isSaved) {
      user.savedJobs = user.savedJobs.filter(
        (id) => id.toString() !== jobId
      );
    } else {
      user.savedJobs.push(jobId);
    }

    await user.save();

    res.json({
      saved: !isSaved,
      message: isSaved ? "Job unsaved" : "Job saved!",
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
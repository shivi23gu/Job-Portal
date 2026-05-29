const express = require("express");
const router = express.Router();
const Job = require("../models/Job");
const User = require("../models/User");
const Application = require("../models/Application");
const { auth, isEmployer } = require("../middleware/auth");

router.get("/", async (req, res) => {
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
    if (search) query.$text = { $search: search };
    if (location) query.location = { $regex: location, $options: "i" };
    if (type) query.type = type;
    if (category) query.category = category;
    if (experience) query.experience = experience;
    if (remote === "true") query.isRemote = true;
    if (featured === "true") query.featured = true;
    if (minSalary || maxSalary) {
      query["salary.min"] = {};
      if (minSalary) query["salary.min"].$gte = Number(minSalary);
      if (maxSalary) query["salary.max"] = { $lte: Number(maxSalary) };
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
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      jobs,
      total,
      pages: Math.ceil(total / limit),
      currentPage: Number(page),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      "employer",
      "name company avatar email",
    );
    if (!job) return res.status(404).json({ message: "Job not found" });
    job.views += 1;
    await job.save();
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", auth, isEmployer, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const job = new Job({
      ...req.body,
      employer: req.user._id,
      company: req.body.company || user.company?.name,
      companyLogo: req.body.companyLogo || user.company?.logo,
    });
    await job.save();
    res.status(201).json({ job, message: "Job posted successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.put("/:id", auth, isEmployer, async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      employer: req.user._id,
    });
    if (!job)
      return res.status(404).json({ message: "Job not found or unauthorized" });
    Object.assign(job, req.body);
    await job.save();
    res.json({ job, message: "Job updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", auth, isEmployer, async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({
      _id: req.params.id,
      employer: req.user._id,
    });
    if (!job)
      return res.status(404).json({ message: "Job not found or unauthorized" });
    await Application.deleteMany({ job: req.params.id });
    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/employer/my-jobs", auth, isEmployer, async (req, res) => {
  try {
    const jobs = await Job.find({ employer: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:id/save", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const jobId = req.params.id;
    const isSaved = user.savedJobs.includes(jobId);
    if (isSaved) {
      user.savedJobs = user.savedJobs.filter((id) => id.toString() !== jobId);
    } else {
      user.savedJobs.push(jobId);
    }
    await user.save();
    res.json({
      saved: !isSaved,
      message: isSaved ? "Job unsaved" : "Job saved!",
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/featured/list", async (req, res) => {
  try {
    const jobs = await Job.find({ status: "active", featured: true })
      .populate("employer", "name company")
      .limit(6)
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/stats/overview", async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments({ status: "active" });
    const totalCompanies = await Job.distinct("company", { status: "active" });
    const categories = await Job.aggregate([
      { $match: { status: "active" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json({ totalJobs, totalCompanies: totalCompanies.length, categories });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

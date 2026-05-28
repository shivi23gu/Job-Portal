const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Job = require('../models/Job');
const { auth, isEmployer } = require('../middleware/auth');

// Apply to job
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'jobseeker') {
      return res.status(403).json({ message: 'Only job seekers can apply' });
    }
    const { jobId, coverLetter, resume } = req.body;
    const job = await Job.findById(jobId);
    if (!job || job.status !== 'active') return res.status(404).json({ message: 'Job not found or closed' });

    const existing = await Application.findOne({ job: jobId, applicant: req.user._id });
    if (existing) return res.status(400).json({ message: 'Already applied to this job' });

    const application = new Application({
      job: jobId,
      applicant: req.user._id,
      employer: job.employer,
      coverLetter,
      resume,
      timeline: [{ status: 'pending', note: 'Application submitted' }]
    });
    await application.save();

    job.applicants = (job.applicants || 0) + 1;
    await job.save();

    await application.populate([
      { path: 'job', select: 'title company location type' },
      { path: 'applicant', select: 'name email profile.title' }
    ]);

    res.status(201).json({ application, message: 'Application submitted successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get user's applications
router.get('/my-applications', auth, async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate('job', 'title company location type salary companyLogo')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get applications for a job (employer)
router.get('/job/:jobId', auth, isEmployer, async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.jobId, employer: req.user._id });
    if (!job) return res.status(404).json({ message: 'Job not found or unauthorized' });

    const applications = await Application.find({ job: req.params.jobId })
      .populate('applicant', 'name email profile avatar')
      .sort({ aiScore: -1, createdAt: -1 });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update application status (employer)
router.put('/:id/status', auth, isEmployer, async (req, res) => {
  try {
    const { status, note } = req.body;
    const application = await Application.findOne({ _id: req.params.id, employer: req.user._id });
    if (!application) return res.status(404).json({ message: 'Application not found' });

    application.status = status;
    application.timeline.push({ status, note: note || `Status updated to ${status}` });
    await application.save();
    res.json({ application, message: 'Application status updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Withdraw application (jobseeker)
router.put('/:id/withdraw', auth, async (req, res) => {
  try {
    const application = await Application.findOne({ _id: req.params.id, applicant: req.user._id });
    if (!application) return res.status(404).json({ message: 'Application not found' });
    application.status = 'withdrawn';
    application.timeline.push({ status: 'withdrawn', note: 'Application withdrawn by applicant' });
    await application.save();
    res.json({ message: 'Application withdrawn' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get employer's all applications
router.get('/employer/all', auth, isEmployer, async (req, res) => {
  try {
    const applications = await Application.find({ employer: req.user._id })
      .populate('job', 'title company')
      .populate('applicant', 'name email profile.title avatar')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

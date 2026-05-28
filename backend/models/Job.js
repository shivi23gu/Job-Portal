const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  company: { type: String, required: true },
  companyLogo: String,
  employer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  requirements: [String],
  responsibilities: [String],
  skills: [String],
  type: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship', 'Remote'],
    required: true
  },
  location: { type: String, required: true },
  isRemote: { type: Boolean, default: false },
  salary: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'USD' },
    period: { type: String, default: 'yearly' },
    isNegotiable: Boolean
  },
  experience: {
    type: String,
    enum: ['Entry Level', 'Mid Level', 'Senior Level', 'Lead', 'Manager', 'Executive'],
    required: true
  },
  education: String,
  category: {
    type: String,
    enum: ['Technology', 'Marketing', 'Design', 'Finance', 'Healthcare', 'Education',
      'Engineering', 'Sales', 'HR', 'Legal', 'Operations', 'Other'],
    required: true
  },
  benefits: [String],
  deadline: Date,
  status: { type: String, enum: ['active', 'closed', 'draft'], default: 'active' },
  views: { type: Number, default: 0 },
  applicants: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  urgent: { type: Boolean, default: false },
  tags: [String],
  aiGenerated: { type: Boolean, default: false }
}, { timestamps: true });

jobSchema.index({ title: 'text', description: 'text', company: 'text', skills: 'text' });
jobSchema.index({ location: 1, category: 1, type: 1, status: 1 });

module.exports = mongoose.model('Job', jobSchema);

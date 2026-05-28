import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { MapPin, Clock, DollarSign, Briefcase, Users, Eye, Send, Bookmark, BookmarkCheck, ArrowLeft, Sparkles, Building, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './JobDetail.css';

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [generatingCL, setGeneratingCL] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    axios.get(`/api/jobs/${id}`).then(r => setJob(r.data)).catch(() => navigate('/jobs')).finally(() => setLoading(false));
    if (user) {
      axios.get('/api/applications/my-applications').then(r => {
        setHasApplied(r.data.some(a => a.job?._id === id));
      }).catch(() => {});
    }
  }, [id, user, navigate]);

  const handleSave = async () => {
    if (!user) return toast.error('Please login to save');
    const { data } = await axios.post(`/api/jobs/${id}/save`);
    setIsSaved(data.saved);
    toast.success(data.message);
  };

  const generateCoverLetter = async () => {
    if (!user) return toast.error('Please login');
    setGeneratingCL(true);
    try {
      const { data } = await axios.post('/api/ai/generate-cover-letter', {
        jobTitle: job.title, company: job.company,
        jobDescription: job.description,
        userProfile: { name: user.name, title: user.profile?.title, bio: user.profile?.bio },
        skills: user.profile?.skills
      });
      setCoverLetter(data.coverLetter);
      toast.success('Cover letter generated!');
    } catch { toast.error('AI generation failed. Check your API key.'); }
    finally { setGeneratingCL(false); }
  };

  const handleApply = async () => {
    if (!coverLetter.trim()) return toast.error('Please write a cover letter');
    setApplying(true);
    try {
      await axios.post('/api/applications', { jobId: id, coverLetter, resume: user?.profile?.resume });
      toast.success('Application submitted successfully!');
      setShowApplyModal(false);
      setHasApplied(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally { setApplying(false); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!job) return null;

  const salary = job.salary?.min ? `$${(job.salary.min/1000).toFixed(0)}k${job.salary.max ? `–$${(job.salary.max/1000).toFixed(0)}k` : '+'}` : null;

  return (
    <div className="job-detail-page">
      <div className="container">
        <Link to="/jobs" className="back-btn"><ArrowLeft size={16} /> Back to Jobs</Link>

        <div className="job-detail-layout">
          <div className="job-detail-main">
            {/* Header */}
            <div className="card job-detail-header">
              <div className="jd-company-info">
                <div className="jd-logo">
                  {job.companyLogo ? <img src={job.companyLogo} alt="" /> : job.company?.charAt(0)}
                </div>
                <div>
                  <h1>{job.title}</h1>
                  <div className="jd-company">{job.company}</div>
                </div>
              </div>
              <div className="jd-tags">
                <span className="badge badge-blue">{job.type}</span>
                <span className="badge badge-purple">{job.experience}</span>
                <span className="badge badge-green">{job.category}</span>
                {job.isRemote && <span className="badge badge-cyan">Remote OK</span>}
                {job.urgent && <span className="badge badge-red">Urgent</span>}
              </div>
              <div className="jd-meta">
                <span><MapPin size={14} />{job.location}</span>
                {salary && <span><DollarSign size={14} />{salary} / {job.salary?.period}</span>}
                <span><Users size={14} />{job.applicants} applicants</span>
                <span><Eye size={14} />{job.views} views</span>
                <span><Clock size={14} />{new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Description */}
            <div className="card">
              <h2>Job Description</h2>
              <div className="jd-text">{job.description}</div>
            </div>

            {/* Responsibilities */}
            {job.responsibilities?.length > 0 && (
              <div className="card">
                <h2>Responsibilities</h2>
                <ul className="jd-list">
                  {job.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}

            {/* Requirements */}
            {job.requirements?.length > 0 && (
              <div className="card">
                <h2>Requirements</h2>
                <ul className="jd-list">
                  {job.requirements.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}

            {/* Skills */}
            {job.skills?.length > 0 && (
              <div className="card">
                <h2>Required Skills</h2>
                <div className="skills-wrap">
                  {job.skills.map(s => <span key={s} className="skill-pill">{s}</span>)}
                </div>
              </div>
            )}

            {/* Benefits */}
            {job.benefits?.length > 0 && (
              <div className="card">
                <h2>Benefits</h2>
                <div className="benefits-grid">
                  {job.benefits.map((b, i) => <div key={i} className="benefit-item">✓ {b}</div>)}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="job-detail-sidebar">
            <div className="card apply-card">
              {hasApplied ? (
                <div className="alert alert-success">✓ You've applied for this job!</div>
              ) : user?.role === 'jobseeker' || !user ? (
                <button className="btn btn-primary btn-full btn-lg" onClick={() => user ? setShowApplyModal(true) : navigate('/login')}>
                  <Send size={16} /> Apply Now
                </button>
              ) : null}
              <button className={`btn ${isSaved ? 'btn-secondary' : 'btn-ghost'} btn-full`} onClick={handleSave}>
                {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                {isSaved ? 'Saved' : 'Save Job'}
              </button>
              {job.deadline && (
                <div className="deadline-note">
                  <Calendar size={14} /> Apply before {new Date(job.deadline).toLocaleDateString()}
                </div>
              )}
            </div>

            {/* About Company */}
            <div className="card">
              <h3><Building size={16} /> About Company</h3>
              <div className="company-detail">
                <div className="jd-logo small">{job.company?.charAt(0)}</div>
                <div>
                  <div className="font-bold">{job.company}</div>
                  {job.employer?.company?.industry && <div className="text-sm text-muted">{job.employer.company.industry}</div>}
                </div>
              </div>
              {job.employer?.company?.description && (
                <p className="text-sm text-secondary mt-4">{job.employer.company.description}</p>
              )}
            </div>

            <div className="card overview-card">
              <h3>Job Overview</h3>
              <div className="overview-items">
                <div className="ov-item"><Briefcase size={14} /><span>Type</span><strong>{job.type}</strong></div>
                <div className="ov-item"><Users size={14} /><span>Experience</span><strong>{job.experience}</strong></div>
                <div className="ov-item"><MapPin size={14} /><span>Location</span><strong>{job.location}</strong></div>
                {salary && <div className="ov-item"><DollarSign size={14} /><span>Salary</span><strong>{salary}</strong></div>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="modal-overlay" onClick={() => setShowApplyModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Apply for {job.title}</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowApplyModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <div className="flex-between">
                  <label className="form-label">Cover Letter *</label>
                  <button className="btn btn-ghost btn-sm" onClick={generateCoverLetter} disabled={generatingCL}>
                    <Sparkles size={14} /> {generatingCL ? 'Generating...' : 'AI Generate'}
                  </button>
                </div>
                <textarea
                  className="form-control"
                  rows={10}
                  placeholder="Write a compelling cover letter..."
                  value={coverLetter}
                  onChange={e => setCoverLetter(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowApplyModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleApply} disabled={applying}>
                <Send size={16} /> {applying ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

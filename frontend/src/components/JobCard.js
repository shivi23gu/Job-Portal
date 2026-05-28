import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, DollarSign, Bookmark, BookmarkCheck, Zap, Star } from 'lucide-react';
import './JobCard.css';

const typeColors = {
  'Full-time': 'badge-green', 'Part-time': 'badge-blue', 'Contract': 'badge-orange',
  'Freelance': 'badge-purple', 'Internship': 'badge-cyan', 'Remote': 'badge-blue'
};

export default function JobCard({ job, onSave, isSaved, compact }) {
  const salaryText = job.salary?.min
    ? `$${(job.salary.min / 1000).toFixed(0)}k${job.salary.max ? `–$${(job.salary.max / 1000).toFixed(0)}k` : '+'}`
    : null;

  return (
    <div className={`job-card card card-hover ${compact ? 'compact' : ''}`}>
      <div className="job-card-header">
        <div className="company-logo">
          {job.companyLogo ? <img src={job.companyLogo} alt={job.company} /> : job.company?.charAt(0).toUpperCase()}
        </div>
        <div className="job-meta">
          <h3 className="job-title">
            <Link to={`/jobs/${job._id}`}>{job.title}</Link>
          </h3>
          <div className="company-name">{job.company}</div>
        </div>
        <div className="job-actions">
          {job.featured && <span className="badge badge-orange"><Star size={10} /> Featured</span>}
          {job.urgent && <span className="badge badge-red"><Zap size={10} /> Urgent</span>}
          {onSave && (
            <button className={`save-btn ${isSaved ? 'saved' : ''}`} onClick={() => onSave(job._id)}>
              {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
            </button>
          )}
        </div>
      </div>

      <div className="job-tags">
        <span className={`badge ${typeColors[job.type] || 'badge-blue'}`}>{job.type}</span>
        <span className="badge badge-purple">{job.experience}</span>
        {job.isRemote && <span className="badge badge-cyan">Remote OK</span>}
        <span className="badge badge-blue">{job.category}</span>
      </div>

      {!compact && job.skills?.length > 0 && (
        <div className="job-skills">
          {job.skills.slice(0, 4).map(s => (
            <span key={s} className="skill-tag">{s}</span>
          ))}
          {job.skills.length > 4 && <span className="skill-more">+{job.skills.length - 4}</span>}
        </div>
      )}

      <div className="job-footer">
        <div className="job-details">
          <span className="job-detail"><MapPin size={13} />{job.location}</span>
          {salaryText && <span className="job-detail"><DollarSign size={13} />{salaryText}</span>}
          <span className="job-detail"><Clock size={13} />{new Date(job.createdAt).toLocaleDateString()}</span>
        </div>
        <Link to={`/jobs/${job._id}`} className="btn btn-primary btn-sm">View Job</Link>
      </div>
    </div>
  );
}

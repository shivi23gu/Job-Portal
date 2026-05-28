import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FileText, MapPin, DollarSign, Clock, ChevronDown, ChevronUp, Sparkles, Users, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Applications.css';

const STATUS_COLORS = {
  pending: 'badge-orange', reviewing: 'badge-blue', shortlisted: 'badge-cyan',
  interviewed: 'badge-purple', offered: 'badge-green', rejected: 'badge-red', withdrawn: 'badge-red'
};

const EMPLOYER_STATUSES = ['reviewing', 'shortlisted', 'interviewed', 'offered', 'rejected'];

export default function Applications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [scoring, setScoring] = useState(null);
  const [jobApps, setJobApps] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const url = user.role === 'jobseeker' ? '/api/applications/my-applications' : '/api/applications/employer/all';
        const { data } = await axios.get(url);
        setApplications(data);
      } catch { toast.error('Failed to load applications'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [user.role]);

  const handleWithdraw = async (id) => {
    try {
      await axios.put(`/api/applications/${id}/withdraw`);
      setApplications(prev => prev.map(a => a._id === id ? { ...a, status: 'withdrawn' } : a));
      toast.success('Application withdrawn');
    } catch { toast.error('Failed to withdraw'); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await axios.put(`/api/applications/${id}/status`, { status });
      setApplications(prev => prev.map(a => a._id === id ? { ...a, status } : a));
      toast.success(`Status updated to ${status}`);
    } catch { toast.error('Failed to update status'); }
  };

  const scoreApplication = async (appId) => {
    setScoring(appId);
    try {
      const { data } = await axios.post(`/api/ai/score-application/${appId}`);
      setApplications(prev => prev.map(a =>
        a._id === appId ? { ...a, aiScore: data.analysis.score, aiAnalysis: JSON.stringify(data.analysis) } : a
      ));
      toast.success('AI scoring complete!');
    } catch { toast.error('AI scoring failed'); }
    finally { setScoring(null); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="applications-page">
      <div className="container">
        <div className="page-header" style={{ textAlign: 'left', paddingTop: '40px', paddingBottom: '24px' }}>
          <h1>{user.role === 'jobseeker' ? 'My Applications' : 'All Applications'}</h1>
          <p className="text-secondary">{applications.length} total applications</p>
        </div>

        {applications.length === 0 ? (
          <div className="empty-state card">
            <FileText size={48} />
            <h3>No applications yet</h3>
            <p>{user.role === 'jobseeker' ? 'Start applying to jobs to track them here' : 'No applications received yet'}</p>
          </div>
        ) : (
          <div className="apps-list">
            {applications.map(app => {
              const analysis = app.aiAnalysis ? (() => { try { return JSON.parse(app.aiAnalysis); } catch { return null; } })() : null;
              return (
                <div key={app._id} className="app-card card">
                  <div className="app-card-header" onClick={() => setExpanded(expanded === app._id ? null : app._id)}>
                    <div className="app-job-info">
                      <div className="app-company-logo">{(app.job?.company || '?').charAt(0)}</div>
                      <div>
                        <h3>{app.job?.title || 'Job'}</h3>
                        <div className="flex-center gap-3 flex-wrap">
                          <span className="text-sm text-secondary">{app.job?.company}</span>
                          {app.job?.location && <span className="text-xs text-muted"><MapPin size={11} /> {app.job.location}</span>}
                          {app.applicant && <span className="text-sm text-secondary"><Users size={12} /> {app.applicant.name}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="app-card-right">
                      {app.aiScore !== undefined && (
                        <div className={`ai-score ${app.aiScore >= 70 ? 'high' : app.aiScore >= 50 ? 'mid' : 'low'}`}>
                          {app.aiScore}%
                        </div>
                      )}
                      <span className={`badge ${STATUS_COLORS[app.status]}`}>{app.status}</span>
                      <span className="text-xs text-muted">{new Date(app.createdAt).toLocaleDateString()}</span>
                      {expanded === app._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>

                  {expanded === app._id && (
                    <div className="app-detail">
                      <div className="divider" />

                      {/* Cover Letter */}
                      <div className="app-section">
                        <h4>Cover Letter</h4>
                        <p className="cover-letter-text">{app.coverLetter}</p>
                      </div>

                      {/* AI Analysis */}
                      {analysis && (
                        <div className="app-section ai-analysis">
                          <h4><Sparkles size={14} /> AI Analysis</h4>
                          <div className="analysis-grid">
                            <div>
                              <div className="text-xs text-muted mb-4">Strengths</div>
                              {analysis.strengths?.map((s, i) => <div key={i} className="analysis-item good">✓ {s}</div>)}
                            </div>
                            <div>
                              <div className="text-xs text-muted mb-4">Areas to Consider</div>
                              {analysis.weaknesses?.map((w, i) => <div key={i} className="analysis-item warn">△ {w}</div>)}
                            </div>
                          </div>
                          {analysis.summary && <p className="text-sm text-secondary mt-4">{analysis.summary}</p>}
                          <div className="flex-center gap-2 mt-4">
                            <span className="text-xs text-muted">Recommendation:</span>
                            <span className={`badge ${analysis.recommendation === 'Hire' ? 'badge-green' : analysis.recommendation === 'Consider' ? 'badge-orange' : 'badge-red'}`}>
                              {analysis.recommendation}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Timeline */}
                      {app.timeline?.length > 0 && (
                        <div className="app-section">
                          <h4>Timeline</h4>
                          <div className="timeline">
                            {app.timeline.map((t, i) => (
                              <div key={i} className="timeline-item">
                                <div className="timeline-dot" />
                                <div>
                                  <span className={`badge ${STATUS_COLORS[t.status] || 'badge-blue'}`}>{t.status}</span>
                                  {t.note && <span className="text-sm text-secondary ml-2">{t.note}</span>}
                                  <div className="text-xs text-muted mt-1">{new Date(t.date).toLocaleString()}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="app-actions">
                        {user.role === 'employer' && (
                          <>
                            <button className="btn btn-secondary btn-sm" onClick={() => scoreApplication(app._id)} disabled={scoring === app._id}>
                              <Sparkles size={14} /> {scoring === app._id ? 'Scoring...' : 'AI Score'}
                            </button>
                            <select className="form-control" style={{ width: 'auto' }} value={app.status}
                              onChange={e => handleStatusChange(app._id, e.target.value)}>
                              {EMPLOYER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </>
                        )}
                        {user.role === 'jobseeker' && app.status === 'pending' && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleWithdraw(app._id)}>
                            <X size={14} /> Withdraw
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

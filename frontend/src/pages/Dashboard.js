import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Briefcase, FileText, Bookmark, TrendingUp, Plus, Users, Eye, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const statusColors = {
  pending: 'badge-orange', reviewing: 'badge-blue', shortlisted: 'badge-cyan',
  interviewed: 'badge-purple', offered: 'badge-green', rejected: 'badge-red', withdrawn: 'badge-red'
};

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({ applications: [], jobs: [], stats: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user.role === 'jobseeker') {
          const [apps, saved] = await Promise.all([
            axios.get('/api/applications/my-applications'),
            axios.get('/api/users/saved-jobs/list')
          ]);
          setData({
            applications: apps.data,
            savedJobs: saved.data,
            stats: {
              total: apps.data.length,
              pending: apps.data.filter(a => a.status === 'pending').length,
              shortlisted: apps.data.filter(a => ['shortlisted', 'offered', 'interviewed'].includes(a.status)).length,
              rejected: apps.data.filter(a => a.status === 'rejected').length,
            }
          });
        } else {
          const [jobs, apps] = await Promise.all([
            axios.get('/api/jobs/employer/my-jobs'),
            axios.get('/api/applications/employer/all')
          ]);
          setData({
            jobs: jobs.data,
            applications: apps.data,
            stats: {
              totalJobs: jobs.data.length,
              activeJobs: jobs.data.filter(j => j.status === 'active').length,
              totalApps: apps.data.length,
              pending: apps.data.filter(a => a.status === 'pending').length,
            }
          });
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [user.role]);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dash-header">
          <div>
            <h1>Welcome back, {user.name?.split(' ')[0]}! 👋</h1>
            <p className="text-secondary">Here's your activity overview</p>
          </div>
          {user.role === 'employer' && (
            <Link to="/post-job" className="btn btn-primary"><Plus size={16} /> Post New Job</Link>
          )}
          {user.role === 'jobseeker' && (
            <Link to="/jobs" className="btn btn-primary"><Briefcase size={16} /> Find Jobs</Link>
          )}
        </div>

        {/* Stats */}
        <div className="stats-grid">
          {user.role === 'jobseeker' ? (<>
            <div className="stat-card card"><div className="stat-icon blue"><FileText size={22} /></div><div><div className="stat-value">{data.stats.total}</div><div className="stat-name">Total Applications</div></div></div>
            <div className="stat-card card"><div className="stat-icon orange"><Clock size={22} /></div><div><div className="stat-value">{data.stats.pending}</div><div className="stat-name">Pending Review</div></div></div>
            <div className="stat-card card"><div className="stat-icon green"><CheckCircle size={22} /></div><div><div className="stat-value">{data.stats.shortlisted}</div><div className="stat-name">Shortlisted</div></div></div>
            <div className="stat-card card"><div className="stat-icon red"><XCircle size={22} /></div><div><div className="stat-value">{data.stats.rejected}</div><div className="stat-name">Not Selected</div></div></div>
          </>) : (<>
            <div className="stat-card card"><div className="stat-icon blue"><Briefcase size={22} /></div><div><div className="stat-value">{data.stats.totalJobs}</div><div className="stat-name">Total Jobs Posted</div></div></div>
            <div className="stat-card card"><div className="stat-icon green"><CheckCircle size={22} /></div><div><div className="stat-value">{data.stats.activeJobs}</div><div className="stat-name">Active Jobs</div></div></div>
            <div className="stat-card card"><div className="stat-icon purple"><Users size={22} /></div><div><div className="stat-value">{data.stats.totalApps}</div><div className="stat-name">Total Applications</div></div></div>
            <div className="stat-card card"><div className="stat-icon orange"><AlertCircle size={22} /></div><div><div className="stat-value">{data.stats.pending}</div><div className="stat-name">Pending Review</div></div></div>
          </>)}
        </div>

        {/* Recent Activity */}
        {user.role === 'jobseeker' && (
          <div className="card">
            <div className="flex-between mb-6">
              <h2>Recent Applications</h2>
              <Link to="/applications" className="btn btn-ghost btn-sm">View all</Link>
            </div>
            {data.applications.length === 0 ? (
              <div className="empty-state">
                <FileText size={40} />
                <h3>No applications yet</h3>
                <p>Start applying to jobs to track them here</p>
                <Link to="/jobs" className="btn btn-primary mt-4">Find Jobs</Link>
              </div>
            ) : (
              <div className="applications-list">
                {data.applications.slice(0, 5).map(app => (
                  <div key={app._id} className="app-item">
                    <div className="app-info">
                      <div className="font-bold">{app.job?.title}</div>
                      <div className="text-sm text-secondary">{app.job?.company} · {app.job?.location}</div>
                    </div>
                    <div className="flex-center gap-3">
                      <span className={`badge ${statusColors[app.status]}`}>{app.status}</span>
                      <span className="text-xs text-muted">{new Date(app.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {user.role === 'employer' && (
          <div className="grid-2">
            <div className="card">
              <div className="flex-between mb-6">
                <h2>Your Job Posts</h2>
                <Link to="/post-job" className="btn btn-primary btn-sm"><Plus size={14} /> New</Link>
              </div>
              {data.jobs.length === 0 ? (
                <div className="empty-state"><Briefcase size={40} /><h3>No jobs posted yet</h3></div>
              ) : (
                <div className="jobs-list-dash">
                  {data.jobs.slice(0, 5).map(job => (
                    <div key={job._id} className="dash-job-item">
                      <div>
                        <div className="font-bold text-sm">{job.title}</div>
                        <div className="flex-center gap-2 mt-4">
                          <span className={`badge ${job.status === 'active' ? 'badge-green' : 'badge-red'}`}>{job.status}</span>
                          <span className="text-xs text-muted"><Users size={10} /> {job.applicants} apps</span>
                          <span className="text-xs text-muted"><Eye size={10} /> {job.views}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="card">
              <div className="flex-between mb-6">
                <h2>Recent Applications</h2>
              </div>
              {data.applications.length === 0 ? (
                <div className="empty-state"><Users size={40} /><h3>No applications yet</h3></div>
              ) : (
                <div className="applications-list">
                  {data.applications.slice(0, 5).map(app => (
                    <div key={app._id} className="app-item">
                      <div>
                        <div className="font-bold text-sm">{app.applicant?.name}</div>
                        <div className="text-xs text-secondary">{app.job?.title}</div>
                      </div>
                      <span className={`badge ${statusColors[app.status]}`}>{app.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

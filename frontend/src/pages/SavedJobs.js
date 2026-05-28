import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Bookmark } from 'lucide-react';
import JobCard from '../components/JobCard';

export default function SavedJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/users/saved-jobs/list')
      .then(r => setJobs(r.data))
      .catch(() => toast.error('Failed to load saved jobs'))
      .finally(() => setLoading(false));
  }, []);

  const handleUnsave = async (jobId) => {
    try {
      await axios.post(`/api/jobs/${jobId}/save`);
      setJobs(prev => prev.filter(j => j._id !== jobId));
      toast.success('Job removed from saved');
    } catch { toast.error('Failed to unsave'); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div style={{ padding: '40px 0 60px' }}>
      <div className="container">
        <div className="page-header" style={{ textAlign: 'left', paddingTop: 0 }}>
          <h1>Saved Jobs</h1>
          <p className="text-secondary">{jobs.length} saved job{jobs.length !== 1 ? 's' : ''}</p>
        </div>
        {jobs.length === 0 ? (
          <div className="empty-state card">
            <Bookmark size={48} />
            <h3>No saved jobs yet</h3>
            <p>Browse jobs and save the ones you're interested in</p>
            <a href="/jobs" className="btn btn-primary mt-4">Browse Jobs</a>
          </div>
        ) : (
          <div className="grid-2">
            {jobs.map(job => (
              <JobCard key={job._id} job={job} onSave={handleUnsave} isSaved={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

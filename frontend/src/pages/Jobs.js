import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Search, Filter, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';
import JobCard from '../components/JobCard';
import { useAuth } from '../context/AuthContext';
import './Jobs.css';

const TYPES = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship', 'Remote'];
const EXPERIENCES = ['Entry Level', 'Mid Level', 'Senior Level', 'Lead', 'Manager', 'Executive'];
const CATEGORIES = ['Technology', 'Marketing', 'Design', 'Finance', 'Healthcare', 'Education', 'Engineering', 'Sales', 'HR', 'Legal', 'Operations', 'Other'];

export default function Jobs() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [savedJobs, setSavedJobs] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    location: searchParams.get('location') || '',
    type: searchParams.get('type') || '',
    category: searchParams.get('category') || '',
    experience: searchParams.get('experience') || '',
    remote: searchParams.get('remote') || '',
    sort: 'createdAt',
    page: 1
  });

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const { data } = await axios.get('/api/jobs', { params });
      setJobs(data.jobs); setTotal(data.total); setPages(data.pages);
    } catch {
      toast.error('Failed to load jobs');
    } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  useEffect(() => {
    if (user) {
      axios.get('/api/users/saved-jobs/list').then(r => setSavedJobs(r.data.map(j => j._id))).catch(() => {});
    }
  }, [user]);

  const handleSave = async (jobId) => {
    if (!user) return toast.error('Please login to save jobs');
    try {
      const { data } = await axios.post(`/api/jobs/${jobId}/save`);
      setSavedJobs(prev => data.saved ? [...prev, jobId] : prev.filter(id => id !== jobId));
      toast.success(data.message);
    } catch { toast.error('Failed to save job'); }
  };

  const updateFilter = (key, val) => setFilters(p => ({ ...p, [key]: val, page: 1 }));
  const clearFilters = () => setFilters({ search: '', location: '', type: '', category: '', experience: '', remote: '', sort: 'createdAt', page: 1 });
  const activeFilters = [filters.type, filters.category, filters.experience, filters.remote].filter(Boolean).length;

  return (
    <div className="jobs-page">
      <div className="jobs-hero">
        <div className="container">
          <h1>Find Your Next Role</h1>
          <div className="job-search-bar">
            <Search size={18} />
            <input
              type="text" placeholder="Search by title, skills, company..."
              value={filters.search}
              onChange={e => updateFilter('search', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchJobs()}
            />
            <input
              type="text" placeholder="Location..."
              value={filters.location}
              onChange={e => updateFilter('location', e.target.value)}
              className="location-input"
            />
            <button className="btn btn-primary" onClick={fetchJobs}>Search</button>
          </div>
        </div>
      </div>

      <div className="container jobs-container">
        <div className="jobs-sidebar">
          <div className="filters-header">
            <h3><SlidersHorizontal size={16} /> Filters</h3>
            {activeFilters > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
                <X size={14} /> Clear ({activeFilters})
              </button>
            )}
          </div>

          <div className="filter-group">
            <label>Job Type</label>
            {TYPES.map(t => (
              <label key={t} className="checkbox-label">
                <input type="radio" name="type" checked={filters.type === t}
                  onChange={() => updateFilter('type', filters.type === t ? '' : t)} />
                {t}
              </label>
            ))}
          </div>
          <div className="filter-group">
            <label>Category</label>
            <select className="form-control" value={filters.category} onChange={e => updateFilter('category', e.target.value)}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>Experience</label>
            {EXPERIENCES.map(e => (
              <label key={e} className="checkbox-label">
                <input type="radio" name="experience" checked={filters.experience === e}
                  onChange={() => updateFilter('experience', filters.experience === e ? '' : e)} />
                {e}
              </label>
            ))}
          </div>
          <div className="filter-group">
            <label className="checkbox-label">
              <input type="checkbox" checked={filters.remote === 'true'}
                onChange={e => updateFilter('remote', e.target.checked ? 'true' : '')} />
              Remote Only
            </label>
          </div>
        </div>

        <div className="jobs-main">
          <div className="jobs-toolbar">
            <div className="results-count">
              {loading ? 'Loading...' : `${total} jobs found`}
            </div>
            <select className="form-control" style={{ width: 'auto' }} value={filters.sort}
              onChange={e => updateFilter('sort', e.target.value)}>
              <option value="createdAt">Latest</option>
              <option value="salary">Salary</option>
              <option value="views">Most Viewed</option>
            </select>
          </div>

          {loading ? (
            <div className="jobs-loading">
              {[1,2,3,4,5,6].map(i => <div key={i} className="job-skeleton" />)}
            </div>
          ) : jobs.length === 0 ? (
            <div className="empty-state">
              <Search size={48} />
              <h3>No jobs found</h3>
              <p>Try adjusting your search filters</p>
              <button className="btn btn-primary mt-4" onClick={clearFilters}>Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="jobs-list">
                {jobs.map(job => (
                  <JobCard key={job._id} job={job} onSave={handleSave} isSaved={savedJobs.includes(job._id)} />
                ))}
              </div>
              {pages > 1 && (
                <div className="pagination">
                  <button className="btn btn-secondary btn-sm" disabled={filters.page <= 1}
                    onClick={() => updateFilter('page', filters.page - 1)}>
                    <ChevronLeft size={16} /> Prev
                  </button>
                  <span className="page-info">Page {filters.page} of {pages}</span>
                  <button className="btn btn-secondary btn-sm" disabled={filters.page >= pages}
                    onClick={() => updateFilter('page', filters.page + 1)}>
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

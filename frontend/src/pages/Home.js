import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, MapPin, TrendingUp, Users, Briefcase, Sparkles, ArrowRight, Star, Zap, Shield } from 'lucide-react';
import JobCard from '../components/JobCard';
import './Home.css';

const CATEGORIES = [
  { name: 'Technology', icon: '💻', color: '#3b82f6' },
  { name: 'Design', icon: '🎨', color: '#8b5cf6' },
  { name: 'Marketing', icon: '📈', color: '#f59e0b' },
  { name: 'Finance', icon: '💰', color: '#22c55e' },
  { name: 'Healthcare', icon: '🏥', color: '#06b6d4' },
  { name: 'Engineering', icon: '⚙️', color: '#ef4444' },
  { name: 'Education', icon: '📚', color: '#f97316' },
  { name: 'Sales', icon: '🤝', color: '#ec4899' },
];

export default function Home() {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [stats, setStats] = useState({ totalJobs: 0, totalCompanies: 0, categories: [] });
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/jobs/featured/list').then(r => setFeaturedJobs(r.data)).catch(() => {});
    axios.get('/api/jobs/stats/overview').then(r => setStats(r.data)).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (location) params.set('location', location);
    navigate(`/jobs?${params}`);
  };

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb orb-1" />
          <div className="hero-orb orb-2" />
          <div className="hero-grid" />
        </div>
        <div className="container hero-content">
          <div className="hero-badge">
            <Sparkles size={14} /> AI-Powered Job Matching
          </div>
          <h1 className="hero-title">
            Find Your Dream Job<br />
            <span className="gradient-text">Powered by AI</span>
          </h1>
          <p className="hero-subtitle">
            Connect with top employers using intelligent matching, AI-generated cover letters, and career insights tailored just for you.
          </p>

          <form className="search-box" onSubmit={handleSearch}>
            <div className="search-input-wrap">
              <Search size={18} className="search-icon" />
              <input
                type="text" placeholder="Job title, skills, or keywords..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="search-divider" />
            <div className="search-input-wrap">
              <MapPin size={18} className="search-icon" />
              <input
                type="text" placeholder="City, state, or remote..."
                value={location} onChange={e => setLocation(e.target.value)}
                className="search-input"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg search-btn">
              <Search size={18} /> Search Jobs
            </button>
          </form>

          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-num">{ stats.totalJobs || 500 }+</span>
              <span className="stat-label">Active Jobs</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-num">{ stats.totalCompanies || 150 }+</span>
              <span className="stat-label">Companies</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-num">AI</span>
              <span className="stat-label">Powered</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section features-section">
        <div className="container">
          <div className="grid-3">
            <Link to="/ai-tools" className="feature-card card card-hover feature-link" onClick={() => {}}>
              <div className="feature-icon" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>
                <Sparkles size={24} />
              </div>
              <h3>AI Cover Letters</h3>
              <p>Generate personalized cover letters tailored to each job in seconds with our AI assistant.</p>
              <span className="feature-cta">Try it free <ArrowRight size={14} /></span>
            </Link>
            <Link to="/ai-tools" className="feature-card card card-hover feature-link" onClick={() => {}}>
              <div className="feature-icon" style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6' }}>
                <TrendingUp size={24} />
              </div>
              <h3>Smart Job Matching</h3>
              <p>Our AI analyzes your profile and matches you with the most relevant opportunities.</p>
              <span className="feature-cta">Explore <ArrowRight size={14} /></span>
            </Link>
            <Link to="/ai-tools" className="feature-card card card-hover feature-link" onClick={() => {}}>
              <div className="feature-icon" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
                <Shield size={24} />
              </div>
              <h3>Application Scoring</h3>
              <p>Employers get AI-powered candidate scoring to find the best fit faster.</p>
              <span className="feature-cta">Learn more <ArrowRight size={14} /></span>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section categories-section">
        <div className="container">
          <div className="section-header">
            <h2>Explore by Category</h2>
            <Link to="/jobs" className="btn btn-ghost">View all <ArrowRight size={16} /></Link>
          </div>
          <div className="categories-grid">
            {CATEGORIES.map(cat => (
              <Link key={cat.name} to={`/jobs?category=${cat.name}`} className="category-card card">
                <div className="cat-icon" style={{ background: `${cat.color}20`, color: cat.color }}>{cat.icon}</div>
                <span>{cat.name}</span>
                <ArrowRight size={14} className="cat-arrow" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      {featuredJobs.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2><Star size={20} className="text-accent" /> Featured Jobs</h2>
              <Link to="/jobs?featured=true" className="btn btn-ghost">See all <ArrowRight size={16} /></Link>
            </div>
            <div className="grid-2">
              {featuredJobs.slice(0, 4).map(job => <JobCard key={job._id} job={job} />)}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-card card">
            <div className="cta-content">
              <h2>Ready to find your next opportunity?</h2>
              <p>Join thousands of professionals using AI to accelerate their careers.</p>
              <div className="flex gap-3 flex-wrap">
                <Link to="/register" className="btn btn-primary btn-lg">Get Started Free <ArrowRight size={16} /></Link>
                <Link to="/jobs" className="btn btn-secondary btn-lg">Browse Jobs</Link>
              </div>
            </div>
            <div className="cta-visual">
              <div className="cta-orb" />
              <Briefcase size={80} style={{ opacity: 0.1, color: 'var(--accent)' }} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
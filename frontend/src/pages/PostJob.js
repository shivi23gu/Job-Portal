import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Sparkles, Plus, X, Send } from 'lucide-react';
import './PostJob.css';

const TYPES = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship', 'Remote'];
const EXPERIENCES = ['Entry Level', 'Mid Level', 'Senior Level', 'Lead', 'Manager', 'Executive'];
const CATEGORIES = ['Technology', 'Marketing', 'Design', 'Finance', 'Healthcare', 'Education', 'Engineering', 'Sales', 'HR', 'Legal', 'Operations', 'Other'];

export default function PostJob() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [benefitInput, setBenefitInput] = useState('');

  const [form, setForm] = useState({
    title: '', company: '', description: '', type: 'Full-time', location: '',
    experience: 'Mid Level', category: 'Technology', isRemote: false, urgent: false, featured: false,
    skills: [], requirements: [], responsibilities: [], benefits: [], tags: [],
    salary: { min: '', max: '', currency: 'USD', period: 'yearly', isNegotiable: false },
    deadline: ''
  });

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));
  const setSalary = (key, val) => setForm(p => ({ ...p, salary: { ...p.salary, [key]: val } }));

  const addSkill = () => {
    if (skillInput.trim() && !form.skills.includes(skillInput.trim())) {
      set('skills', [...form.skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const addBenefit = () => {
    if (benefitInput.trim()) {
      set('benefits', [...form.benefits, benefitInput.trim()]);
      setBenefitInput('');
    }
  };

  const generateWithAI = async () => {
    if (!form.title) return toast.error('Enter a job title first');
    setGenerating(true);
    try {
      const { data } = await axios.post('/api/ai/generate-job-description', {
        title: form.title, company: form.company || 'Our Company',
        type: form.type, experience: form.experience,
        skills: form.skills, location: form.location
      });
      setForm(p => ({
        ...p,
        description: data.description || p.description,
        requirements: data.requirements || p.requirements,
        responsibilities: data.responsibilities || p.responsibilities,
        benefits: data.benefits || p.benefits,
        tags: data.tags || p.tags
      }));
      toast.success('AI generated job details!');
    } catch { toast.error('AI generation failed. Check API key in .env'); }
    finally { setGenerating(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        salary: {
          ...form.salary,
          min: form.salary.min ? Number(form.salary.min) : undefined,
          max: form.salary.max ? Number(form.salary.max) : undefined,
        }
      };
      await axios.post('/api/jobs', payload);
      toast.success('Job posted successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post job');
    } finally { setLoading(false); }
  };

  const ListEditor = ({ label, items, onAdd, onRemove, placeholder }) => {
    const [val, setVal] = useState('');
    return (
      <div className="form-group">
        <label className="form-label">{label}</label>
        <div className="list-input-row">
          <input className="form-control" placeholder={placeholder} value={val}
            onChange={e => setVal(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (val.trim()) { onAdd(val.trim()); setVal(''); } } }} />
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => { if (val.trim()) { onAdd(val.trim()); setVal(''); } }}>
            <Plus size={14} />
          </button>
        </div>
        <div className="list-items">
          {items.map((item, i) => (
            <div key={i} className="list-item">
              <span>{item}</span>
              <button type="button" onClick={() => onRemove(i)}><X size={12} /></button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="post-job-page">
      <div className="container">
        <div className="post-job-header">
          <h1>Post a New Job</h1>
          <button type="button" className="btn btn-secondary" onClick={generateWithAI} disabled={generating}>
            <Sparkles size={16} /> {generating ? 'Generating with AI...' : 'Generate with AI'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="post-job-form">
          <div className="form-section card">
            <h2>Basic Information</h2>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Job Title *</label>
                <input className="form-control" placeholder="e.g. Senior React Developer" value={form.title} onChange={e => set('title', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Company Name *</label>
                <input className="form-control" placeholder="Your company name" value={form.company} onChange={e => set('company', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Job Type *</label>
                <select className="form-control" value={form.type} onChange={e => set('type', e.target.value)}>
                  {TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className="form-control" value={form.category} onChange={e => set('category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Experience Level *</label>
                <select className="form-control" value={form.experience} onChange={e => set('experience', e.target.value)}>
                  {EXPERIENCES.map(ex => <option key={ex}>{ex}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Location *</label>
                <input className="form-control" placeholder="e.g. New York, NY or Remote" value={form.location} onChange={e => set('location', e.target.value)} required />
              </div>
            </div>
            <div className="checkbox-row">
              <label className="checkbox-label"><input type="checkbox" checked={form.isRemote} onChange={e => set('isRemote', e.target.checked)} /> Remote-friendly</label>
              <label className="checkbox-label"><input type="checkbox" checked={form.urgent} onChange={e => set('urgent', e.target.checked)} /> Mark as Urgent</label>
              <label className="checkbox-label"><input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} /> Featured Listing</label>
            </div>
          </div>

          <div className="form-section card">
            <h2>Job Description</h2>
            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea className="form-control" rows={8} placeholder="Describe the role, team, and what makes this position exciting..." value={form.description} onChange={e => set('description', e.target.value)} required />
            </div>
          </div>

          <div className="form-section card">
            <h2>Details</h2>
            <ListEditor label="Requirements" items={form.requirements}
              onAdd={v => set('requirements', [...form.requirements, v])}
              onRemove={i => set('requirements', form.requirements.filter((_, idx) => idx !== i))}
              placeholder="Add a requirement and press Enter" />
            <ListEditor label="Responsibilities" items={form.responsibilities}
              onAdd={v => set('responsibilities', [...form.responsibilities, v])}
              onRemove={i => set('responsibilities', form.responsibilities.filter((_, idx) => idx !== i))}
              placeholder="Add a responsibility and press Enter" />
          </div>

          <div className="form-section card">
            <h2>Skills & Benefits</h2>
            <div className="form-group">
              <label className="form-label">Required Skills</label>
              <div className="list-input-row">
                <input className="form-control" placeholder="Add skill and press Enter or click +" value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} />
                <button type="button" className="btn btn-secondary btn-sm" onClick={addSkill}><Plus size={14} /></button>
              </div>
              <div className="skills-display">
                {form.skills.map((s, i) => (
                  <span key={i} className="skill-chip">
                    {s} <button type="button" onClick={() => set('skills', form.skills.filter((_, idx) => idx !== i))}><X size={11} /></button>
                  </span>
                ))}
              </div>
            </div>
            <ListEditor label="Benefits & Perks" items={form.benefits}
              onAdd={v => set('benefits', [...form.benefits, v])}
              onRemove={i => set('benefits', form.benefits.filter((_, idx) => idx !== i))}
              placeholder="e.g. Health insurance, Remote work, 401k" />
          </div>

          <div className="form-section card">
            <h2>Salary & Deadline</h2>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Min Salary (USD)</label>
                <input className="form-control" type="number" placeholder="e.g. 80000" value={form.salary.min} onChange={e => setSalary('min', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Max Salary (USD)</label>
                <input className="form-control" type="number" placeholder="e.g. 120000" value={form.salary.max} onChange={e => setSalary('max', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Pay Period</label>
                <select className="form-control" value={form.salary.period} onChange={e => setSalary('period', e.target.value)}>
                  <option value="yearly">Per Year</option>
                  <option value="monthly">Per Month</option>
                  <option value="hourly">Per Hour</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Application Deadline</label>
                <input className="form-control" type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} />
              </div>
            </div>
            <label className="checkbox-label"><input type="checkbox" checked={form.salary.isNegotiable} onChange={e => setSalary('isNegotiable', e.target.checked)} /> Salary is negotiable</label>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard')}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              <Send size={16} /> {loading ? 'Posting...' : 'Post Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

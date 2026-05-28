import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { User, Building, Save, Plus, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [skillInput, setSkillInput] = useState('');

  const [form, setForm] = useState({
    name: user?.name || '',
    profile: {
      title: user?.profile?.title || '',
      bio: user?.profile?.bio || '',
      location: user?.profile?.location || '',
      phone: user?.profile?.phone || '',
      website: user?.profile?.website || '',
      skills: user?.profile?.skills || [],
      linkedin: user?.profile?.linkedin || '',
      github: user?.profile?.github || '',
      portfolio: user?.profile?.portfolio || '',
      resume: user?.profile?.resume || '',
    },
    company: {
      name: user?.company?.name || '',
      description: user?.company?.description || '',
      website: user?.company?.website || '',
      industry: user?.company?.industry || '',
      size: user?.company?.size || '',
      location: user?.company?.location || '',
    }
  });

  const setProfile = (key, val) => setForm(p => ({ ...p, profile: { ...p.profile, [key]: val } }));
  const setCompany = (key, val) => setForm(p => ({ ...p, company: { ...p.company, [key]: val } }));

  const addSkill = () => {
    if (skillInput.trim() && !form.profile.skills.includes(skillInput.trim())) {
      setProfile('skills', [...form.profile.skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data } = await axios.put('/api/auth/profile', form);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally { setLoading(false); }
  };

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <div className="profile-avatar">
            <div className="avatar-large">{user?.name?.charAt(0).toUpperCase()}</div>
            <div>
              <h1>{user?.name}</h1>
              <div className="flex-center gap-2">
                <span className={`badge ${user?.role === 'employer' ? 'badge-purple' : 'badge-blue'}`}>{user?.role}</span>
                <span className="text-muted text-sm">{user?.email}</span>
              </div>
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            <Save size={16} /> {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className="tabs mb-6">
          <button className={`tab ${activeTab === 'personal' ? 'active' : ''}`} onClick={() => setActiveTab('personal')}>
            <User size={14} /> Personal Info
          </button>
          {user?.role === 'employer' && (
            <button className={`tab ${activeTab === 'company' ? 'active' : ''}`} onClick={() => setActiveTab('company')}>
              <Building size={14} /> Company Info
            </button>
          )}
        </div>

        {activeTab === 'personal' && (
          <div className="profile-form">
            <div className="card">
              <h2>Basic Information</h2>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-control" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Professional Title</label>
                  <input className="form-control" placeholder="e.g. Senior React Developer" value={form.profile.title} onChange={e => setProfile('title', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input className="form-control" placeholder="e.g. San Francisco, CA" value={form.profile.location} onChange={e => setProfile('location', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-control" placeholder="+1 (555) 000-0000" value={form.profile.phone} onChange={e => setProfile('phone', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea className="form-control" rows={4} placeholder="Tell employers about yourself..." value={form.profile.bio} onChange={e => setProfile('bio', e.target.value)} />
              </div>
            </div>

            <div className="card">
              <h2>Skills</h2>
              <div className="skill-add-row">
                <input className="form-control" placeholder="Add a skill (e.g. React, Python, Design)" value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} />
                <button className="btn btn-secondary" onClick={addSkill}><Plus size={16} /></button>
              </div>
              <div className="skills-display">
                {form.profile.skills.map((s, i) => (
                  <span key={i} className="skill-chip">
                    {s}
                    <button onClick={() => setProfile('skills', form.profile.skills.filter((_, idx) => idx !== i))}><X size={11} /></button>
                  </span>
                ))}
                {form.profile.skills.length === 0 && <span className="text-muted text-sm">No skills added yet</span>}
              </div>
            </div>

            <div className="card">
              <h2>Online Presence</h2>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">LinkedIn URL</label>
                  <input className="form-control" placeholder="https://linkedin.com/in/..." value={form.profile.linkedin} onChange={e => setProfile('linkedin', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">GitHub URL</label>
                  <input className="form-control" placeholder="https://github.com/..." value={form.profile.github} onChange={e => setProfile('github', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Portfolio / Website</label>
                  <input className="form-control" placeholder="https://yoursite.com" value={form.profile.portfolio} onChange={e => setProfile('portfolio', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Resume URL</label>
                  <input className="form-control" placeholder="Link to your resume (Google Drive, etc.)" value={form.profile.resume} onChange={e => setProfile('resume', e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'company' && user?.role === 'employer' && (
          <div className="profile-form">
            <div className="card">
              <h2>Company Information</h2>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <input className="form-control" value={form.company.name} onChange={e => setCompany('name', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Industry</label>
                  <input className="form-control" placeholder="e.g. Technology, Finance" value={form.company.industry} onChange={e => setCompany('industry', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Company Size</label>
                  <select className="form-control" value={form.company.size} onChange={e => setCompany('size', e.target.value)}>
                    <option value="">Select size</option>
                    {['1-10', '11-50', '51-200', '201-500', '500-1000', '1000+'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input className="form-control" placeholder="e.g. New York, NY" value={form.company.location} onChange={e => setCompany('location', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Website</label>
                  <input className="form-control" placeholder="https://yourcompany.com" value={form.company.website} onChange={e => setCompany('website', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Company Description</label>
                <textarea className="form-control" rows={5} placeholder="Tell candidates about your company, culture, and mission..." value={form.company.description} onChange={e => setCompany('description', e.target.value)} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

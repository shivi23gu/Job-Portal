import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Briefcase, Building } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'jobseeker', companyName: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { name: form.name, email: form.email, password: form.password, role: form.role };
      if (form.role === 'employer' && form.companyName) payload.company = { name: form.companyName };
      await register(payload);
      toast.success('Account created! Welcome aboard!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-logo">
          <div className="logo-icon"><Briefcase size={20} /></div>
          <span>TalentBridge</span>
        </div>
        <h1>Create Account</h1>
        <p className="auth-subtitle">Start your journey today</p>

        {/* Role Selector */}
        <div className="role-selector">
          <button type="button"
            className={`role-btn ${form.role === 'jobseeker' ? 'active' : ''}`}
            onClick={() => setForm(p => ({ ...p, role: 'jobseeker' }))}>
            <User size={18} /> Job Seeker
          </button>
          <button type="button"
            className={`role-btn ${form.role === 'employer' ? 'active' : ''}`}
            onClick={() => setForm(p => ({ ...p, role: 'employer' }))}>
            <Building size={18} /> Employer
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-control" type="text" placeholder="John Doe" value={form.name} onChange={set('name')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-control" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
          </div>
          {form.role === 'employer' && (
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <input className="form-control" type="text" placeholder="Acme Corp" value={form.companyName} onChange={set('companyName')} />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-control" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} required minLength={6} />
          </div>
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
        <p className="auth-terms">By signing up you agree to our <a href="#">Terms</a> and <a href="#">Privacy Policy</a></p>
      </div>
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Twitter, Linkedin, Github } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="nav-logo" style={{ marginBottom: '12px' }}>
              <div className="logo-icon"><Briefcase size={16} /></div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>TalentBridge</span>
            </div>
            <p>AI-powered job portal connecting top talent with great opportunities worldwide.</p>
            <div className="social-links">
              <a href="#" className="social-link"><Twitter size={16} /></a>
              <a href="#" className="social-link"><Linkedin size={16} /></a>
              <a href="#" className="social-link"><Github size={16} /></a>
            </div>
          </div>
          <div className="footer-col">
            <h4>For Job Seekers</h4>
            <Link to="/jobs">Browse Jobs</Link>
            <Link to="/register">Create Account</Link>
            <Link to="/ai-tools">AI Career Tools</Link>
          </div>
          <div className="footer-col">
            <h4>For Employers</h4>
            <Link to="/register">Post a Job</Link>
            <Link to="/register">Employer Login</Link>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <a href="#">About Us</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 TalentBridge. Built with MERN Stack + AI.</p>
        </div>
      </div>
    </footer>
  );
}

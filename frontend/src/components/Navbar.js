import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Menu, X, User, LogOut, LayoutDashboard, Sparkles, Bookmark, FileText } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="nav-inner">
        <Link to="/" className="nav-logo">
          <div className="logo-icon"><Briefcase size={18} /></div>
          <span>TalentBridge</span>
        </Link>

        <div className="nav-links hide-mobile">
          <Link to="/jobs" className={`nav-link ${isActive('/jobs') ? 'active' : ''}`}>Find Jobs</Link>
          {user?.role === 'employer' && (
            <Link to="/post-job" className={`nav-link ${isActive('/post-job') ? 'active' : ''}`}>Post Job</Link>
          )}
          {user && (
            <Link to="/ai-tools" className={`nav-link ai-link ${isActive('/ai-tools') ? 'active' : ''}`}>
              <Sparkles size={14} /> AI Tools
            </Link>
          )}
        </div>

        <div className="nav-actions">
          {!user ? (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm hide-mobile">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          ) : (
            <div className="profile-menu">
              <button className="profile-btn" onClick={() => setProfileOpen(!profileOpen)}>
                <div className="avatar-sm">{user.name?.charAt(0).toUpperCase()}</div>
                <span className="hide-mobile">{user.name?.split(' ')[0]}</span>
              </button>
              {profileOpen && (
                <div className="dropdown" onMouseLeave={() => setProfileOpen(false)}>
                  <div className="dropdown-header">
                    <div className="avatar-md">{user.name?.charAt(0).toUpperCase()}</div>
                    <div>
                      <div className="font-bold">{user.name}</div>
                      <div className="text-sm text-muted">{user.role}</div>
                    </div>
                  </div>
                  <hr className="divider" style={{ margin: '8px 0' }} />
                  <Link to="/dashboard" className="dropdown-item" onClick={() => setProfileOpen(false)}>
                    <LayoutDashboard size={15} /> Dashboard
                  </Link>
                  <Link to="/profile" className="dropdown-item" onClick={() => setProfileOpen(false)}>
                    <User size={15} /> My Profile
                  </Link>
                  {user.role === 'jobseeker' && (<>
                    <Link to="/applications" className="dropdown-item" onClick={() => setProfileOpen(false)}>
                      <FileText size={15} /> Applications
                    </Link>
                    <Link to="/saved-jobs" className="dropdown-item" onClick={() => setProfileOpen(false)}>
                      <Bookmark size={15} /> Saved Jobs
                    </Link>
                  </>)}
                  <Link to="/ai-tools" className="dropdown-item ai-item" onClick={() => setProfileOpen(false)}>
                    <Sparkles size={15} /> AI Tools
                  </Link>
                  <hr className="divider" style={{ margin: '8px 0' }} />
                  <button className="dropdown-item danger" onClick={handleLogout}>
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
          <button className="mobile-menu-btn show-mobile" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          <Link to="/jobs" className="mobile-link" onClick={() => setMenuOpen(false)}>Find Jobs</Link>
          {user && <Link to="/dashboard" className="mobile-link" onClick={() => setMenuOpen(false)}>Dashboard</Link>}
          {user?.role === 'employer' && <Link to="/post-job" className="mobile-link" onClick={() => setMenuOpen(false)}>Post Job</Link>}
          {user && <Link to="/ai-tools" className="mobile-link" onClick={() => setMenuOpen(false)}>✨ AI Tools</Link>}
          {!user ? (
            <div className="mobile-auth">
              <Link to="/login" className="btn btn-secondary btn-full" onClick={() => setMenuOpen(false)}>Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-full" onClick={() => setMenuOpen(false)}>Get Started</Link>
            </div>
          ) : (
            <button className="mobile-link danger" onClick={() => { handleLogout(); setMenuOpen(false); }}>Sign Out</button>
          )}
        </div>
      )}
    </nav>
  );
}

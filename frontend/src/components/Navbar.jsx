import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Briefcase,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  Sparkles,
  Bookmark,
  FileText,
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };
  const isActive = (path) => location.pathname === path;

  const navLink = (path, label, icon) => (
    <Link
      to={path}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        isActive(path)
          ? "text-white bg-white/10"
          : "text-slate-400 hover:text-white hover:bg-white/5"
      }`}
    >
      {icon && icon}
      {label}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 bg-[#080f1a]/90 backdrop-blur border-b border-[#1e3a5f]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <Briefcase size={16} className="text-white" />
          </div>
          <span className="font-display font-bold text-lg text-white">
            TalentBridge
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLink("/jobs", "Find Jobs")}
          {user?.role === "employer" && navLink("/post-job", "Post Job")}
          {user &&
            navLink(
              "/ai-tools",
              "AI Tools",
              <Sparkles size={14} className="text-accent" />,
            )}
        </div>

        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <Link
                to="/login"
                className="hidden md:block text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Get Started
              </Link>
            </>
          ) : (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-sm font-bold">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:block text-sm text-slate-300">
                  {user.name?.split(" ")[0]}
                </span>
              </button>

              {profileOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-56 bg-[#111827] border border-[#1e3a5f] rounded-xl shadow-2xl py-1"
                  onMouseLeave={() => setProfileOpen(false)}
                >
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1e3a5f]">
                    <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-white font-bold">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {user.name}
                      </div>
                      <div className="text-xs text-slate-500 capitalize">
                        {user.role}
                      </div>
                    </div>
                  </div>

                  {[
                    {
                      to: "/dashboard",
                      icon: <LayoutDashboard size={14} />,
                      label: "Dashboard",
                    },
                    {
                      to: "/profile",
                      icon: <User size={14} />,
                      label: "My Profile",
                    },
                    ...(user.role === "jobseeker"
                      ? [
                          {
                            to: "/applications",
                            icon: <FileText size={14} />,
                            label: "Applications",
                          },
                          {
                            to: "/saved-jobs",
                            icon: <Bookmark size={14} />,
                            label: "Saved Jobs",
                          },
                        ]
                      : []),
                    {
                      to: "/ai-tools",
                      icon: <Sparkles size={14} />,
                      label: "AI Tools",
                      accent: true,
                    },
                  ].map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setProfileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-white/5 ${
                        item.accent
                          ? "text-accent"
                          : "text-slate-300 hover:text-white"
                      }`}
                    >
                      {item.icon} {item.label}
                    </Link>
                  ))}

                  <div className="border-t border-[#1e3a5f] mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-400/10 transition-colors"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            className="md:hidden text-slate-400 hover:text-white p-1.5"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-[#1e3a5f] bg-[#080f1a] px-6 py-4 flex flex-col gap-2">
          <Link
            to="/jobs"
            className="text-slate-300 py-2 text-sm"
            onClick={() => setMenuOpen(false)}
          >
            Find Jobs
          </Link>
          {user && (
            <Link
              to="/dashboard"
              className="text-slate-300 py-2 text-sm"
              onClick={() => setMenuOpen(false)}
            >
              Dashboard
            </Link>
          )}
          {user?.role === "employer" && (
            <Link
              to="/post-job"
              className="text-slate-300 py-2 text-sm"
              onClick={() => setMenuOpen(false)}
            >
              Post Job
            </Link>
          )}
          {user && (
            <Link
              to="/ai-tools"
              className="text-accent py-2 text-sm"
              onClick={() => setMenuOpen(false)}
            >
              ✨ AI Tools
            </Link>
          )}
          <div className="flex flex-col gap-2 pt-2 border-t border-[#1e3a5f]">
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="text-center py-2 text-sm border border-[#1e3a5f] rounded-lg text-slate-300"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-center py-2 text-sm bg-accent text-white rounded-lg"
                  onClick={() => setMenuOpen(false)}
                >
                  Get Started
                </Link>
              </>
            ) : (
              <button
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                className="text-left text-sm text-red-400 py-2"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

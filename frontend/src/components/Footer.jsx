import React from "react";
import { Link } from "react-router-dom";
import { Briefcase, Twitter, Linkedin, Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0f1f35] border-t border-[#1e3a5f] mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
                <Briefcase size={14} className="text-white" />
              </div>
              <span className="font-display font-bold text-white">
                TalentBridge
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              AI-powered job portal connecting top talent with great
              opportunities.
            </p>
            <div className="flex gap-3 mt-4">
              {[Twitter, Linkedin, Github].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-lg bg-[#1a2744] flex items-center justify-center text-slate-400 hover:text-white hover:bg-accent transition-colors"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">
              For Job Seekers
            </h4>
            <div className="flex flex-col gap-2.5">
              <Link
                to="/jobs"
                className="text-slate-400 hover:text-white text-sm transition-colors"
              >
                Browse Jobs
              </Link>
              <Link
                to="/register"
                className="text-slate-400 hover:text-white text-sm transition-colors"
              >
                Create Account
              </Link>
              <Link
                to="/ai-tools"
                className="text-slate-400 hover:text-white text-sm transition-colors"
              >
                AI Career Tools
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">
              For Employers
            </h4>
            <div className="flex flex-col gap-2.5">
              <Link
                to="/register"
                className="text-slate-400 hover:text-white text-sm transition-colors"
              >
                Post a Job
              </Link>
              <Link
                to="/register"
                className="text-slate-400 hover:text-white text-sm transition-colors"
              >
                Employer Login
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Company</h4>
            <div className="flex flex-col gap-2.5">
              <a
                href="#"
                className="text-slate-400 hover:text-white text-sm transition-colors"
              >
                About Us
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-white text-sm transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-white text-sm transition-colors"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-[#1e3a5f] mt-10 pt-6 text-center text-slate-500 text-sm">
          © 2026 TalentBridge. Built with MERN Stack + AI.
        </div>
      </div>
    </footer>
  );
}

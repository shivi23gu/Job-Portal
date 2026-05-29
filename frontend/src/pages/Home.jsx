import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Search,
  MapPin,
  TrendingUp,
  Briefcase,
  Sparkles,
  ArrowRight,
  Star,
  Shield,
  Code,
  PenTool,
  DollarSign,
  Heart,
  Settings,
  BookOpen,
  Users,
} from "lucide-react";
import JobCard from "../components/JobCard";

const CATEGORIES = [
  { name: "Technology", icon: Code, color: "#3b82f6" },
  { name: "Design", icon: PenTool, color: "#8b5cf6" },
  { name: "Marketing", icon: TrendingUp, color: "#f59e0b" },
  { name: "Finance", icon: DollarSign, color: "#22c55e" },
  { name: "Healthcare", icon: Heart, color: "#06b6d4" },
  { name: "Engineering", icon: Settings, color: "#ef4444" },
  { name: "Education", icon: BookOpen, color: "#f97316" },
  { name: "Sales", icon: Users, color: "#ec4899" },
];

export default function Home() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [stats, setStats] = useState({ totalJobs: 0, totalCompanies: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("/api/jobs/featured/list")
      .then((r) => setFeaturedJobs(r.data))
      .catch(() => {});
    axios
      .get("/api/jobs/stats/overview")
      .then((r) => setStats(r.data))
      .catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (location) params.set("location", location);
    navigate(`/jobs?${params}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden min-h-[85vh] flex items-center py-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-[600px] h-[600px] rounded-full bg-accent opacity-[0.07] blur-[80px] -top-40 -right-20" />
          <div className="absolute w-[400px] h-[400px] rounded-full bg-purple-500 opacity-[0.07] blur-[80px] -bottom-20 -left-20" />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)",
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center w-full">
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 text-accent px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Sparkles size={14} /> AI-Powered Job Matching
          </div>

          <h1 className="font-display text-5xl md:text-6xl font-bold leading-tight mb-5">
            Find Your Dream Job
            <br />
            <span className="gradient-text">Powered by AI</span>
          </h1>

          <p className="text-slate-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Connect with top employers using intelligent matching, AI-generated
            cover letters, and career insights tailored just for you.
          </p>

          <form
            onSubmit={handleSearch}
            className="flex items-center bg-[#111827] border border-[#1e3a5f] rounded-xl p-1.5 max-w-2xl mx-auto mb-10 shadow-2xl"
          >
            <div className="flex items-center flex-1 px-3">
              <Search size={17} className="text-slate-500 flex-shrink-0" />
              <input
                type="text"
                placeholder="Job title, skills, or keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-none outline-none text-white placeholder-slate-500 text-sm px-3 py-2 w-full"
              />
            </div>
            <div className="w-px h-7 bg-[#1e3a5f]" />
            <div className="flex items-center flex-1 px-3">
              <MapPin size={17} className="text-slate-500 flex-shrink-0" />
              <input
                type="text"
                placeholder="City, state, or remote..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-transparent border-none outline-none text-white placeholder-slate-500 text-sm px-3 py-2 w-full"
              />
            </div>
            <button
              type="submit"
              className="bg-accent hover:bg-accent-hover text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2"
            >
              <Search size={16} /> Search Jobs
            </button>
          </form>

          <div className="flex items-center justify-center gap-10">
            <div className="text-center">
              <div className="font-display text-3xl font-bold text-accent">
                {stats.totalJobs || 500}+
              </div>
              <div className="text-slate-500 text-xs uppercase tracking-wider mt-1">
                Active Jobs
              </div>
            </div>
            <div className="w-px h-10 bg-[#1e3a5f]" />
            <div className="text-center">
              <div className="font-display text-3xl font-bold text-accent">
                {stats.totalCompanies || 150}+
              </div>
              <div className="text-slate-500 text-xs uppercase tracking-wider mt-1">
                Companies
              </div>
            </div>
            <div className="w-px h-10 bg-[#1e3a5f]" />
            <div className="text-center">
              <div className="font-display text-3xl font-bold text-accent">
                AI
              </div>
              <div className="text-slate-500 text-xs uppercase tracking-wider mt-1">
                Powered
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-[#0f1f35]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                to: "/ai-tools",
                icon: <Sparkles size={22} />,
                color: "#3b82f6",
                bg: "rgba(59,130,246,0.1)",
                title: "AI Cover Letters",
                desc: "Generate personalized cover letters tailored to each job in seconds.",
                cta: "Try it free",
              },
              {
                to: "/ai-tools",
                icon: <TrendingUp size={22} />,
                color: "#8b5cf6",
                bg: "rgba(139,92,246,0.1)",
                title: "Smart Job Matching",
                desc: "Our AI analyzes your profile and matches you with the most relevant opportunities.",
                cta: "Explore",
              },
              {
                to: "/ai-tools",
                icon: <Shield size={22} />,
                color: "#22c55e",
                bg: "rgba(34,197,94,0.1)",
                title: "Application Scoring",
                desc: "Employers get AI-powered candidate scoring to find the best fit faster.",
                cta: "Learn more",
              },
            ].map((card) => (
              <Link
                key={card.title}
                to={card.to}
                className="bg-[#111827] border border-[#1e3a5f] rounded-xl p-6 hover:border-accent hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/10 transition-all duration-200 flex flex-col"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: card.bg, color: card.color }}
                >
                  {card.icon}
                </div>
                <h3 className="font-display font-semibold text-white text-lg mb-2">
                  {card.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed flex-1">
                  {card.desc}
                </p>
                <span className="flex items-center gap-1.5 text-accent text-sm font-semibold mt-4">
                  {card.cta} <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-2xl font-bold text-white">
              Explore by Category
            </h2>
            <Link
              to="/jobs"
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
            >
              View all <ArrowRight size={15} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                to={`/jobs?category=${cat.name}`}
                className="flex items-center gap-3 bg-[#111827] border border-[#1e3a5f] rounded-xl px-4 py-3.5 hover:border-accent hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: cat.color + "20", color: cat.color }}
                >
                  {React.createElement(cat.icon, { size: 18 })}
                </div>
                <span className="text-slate-300 font-medium text-sm flex-1">
                  {cat.name}
                </span>
                <ArrowRight
                  size={13}
                  className="text-slate-600 group-hover:text-accent group-hover:translate-x-0.5 transition-all"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      {featuredJobs.length > 0 && (
        <section className="py-20 bg-[#0f1f35]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
                <Star size={20} className="text-orange-400" /> Featured Jobs
              </h2>
              <Link
                to="/jobs?featured=true"
                className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
              >
                See all <ArrowRight size={15} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featuredJobs.slice(0, 4).map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative bg-[#111827] border border-[#243b55] rounded-2xl p-12 flex items-center justify-between overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-accent opacity-5 blur-3xl rounded-full" />
            <div className="relative z-10">
              <h2 className="font-display text-3xl font-bold text-white mb-3">
                Ready to find your next opportunity?
              </h2>
              <p className="text-slate-400 mb-6">
                Join thousands of professionals using AI to accelerate their
                careers.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Link
                  to="/register"
                  className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-medium px-6 py-3 rounded-xl transition-colors"
                >
                  Get Started Free <ArrowRight size={16} />
                </Link>
                <Link
                  to="/jobs"
                  className="flex items-center gap-2 border border-[#1e3a5f] hover:border-[#243b55] hover:bg-white/5 text-slate-300 font-medium px-6 py-3 rounded-xl transition-colors"
                >
                  Browse Jobs
                </Link>
              </div>
            </div>
            <Briefcase
              size={100}
              className="text-accent opacity-5 hidden md:block"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

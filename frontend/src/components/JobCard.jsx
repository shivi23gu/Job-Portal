import React from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Clock,
  DollarSign,
  Bookmark,
  BookmarkCheck,
  Zap,
  Star,
} from "lucide-react";

const typeColors = {
  "Full-time": "bg-green-500/15 text-green-400 border-green-500/20",
  "Part-time": "bg-blue-500/15 text-blue-400 border-blue-500/20",
  Contract: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  Freelance: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  Internship: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
  Remote: "bg-blue-500/15 text-blue-400 border-blue-500/20",
};

export default function JobCard({ job, onSave, isSaved, compact }) {
  const salaryText = job.salary?.min
    ? `$${(job.salary.min / 1000).toFixed(0)}k${job.salary.max ? `–$${(job.salary.max / 1000).toFixed(0)}k` : "+"}`
    : null;

  return (
    <div
      className={`bg-[#111827] border border-[#1e3a5f] rounded-xl p-5 hover:border-[#243b55] hover:translate-y-[-2px] transition-all duration-200 ${compact ? "" : ""}`}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-11 h-11 rounded-xl bg-[#1a2744] border border-[#1e3a5f] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
          {job.companyLogo ? (
            <img
              src={job.companyLogo}
              alt={job.company}
              className="w-full h-full rounded-xl object-cover"
            />
          ) : (
            job.company?.charAt(0).toUpperCase()
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-sm leading-tight">
            <Link
              to={`/jobs/${job._id}`}
              className="hover:text-accent transition-colors"
            >
              {job.title}
            </Link>
          </h3>
          <div className="text-slate-400 text-xs mt-0.5">{job.company}</div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {job.featured && (
            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/20">
              <Star size={9} /> Featured
            </span>
          )}
          {job.urgent && (
            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20">
              <Zap size={9} /> Urgent
            </span>
          )}
          {onSave && (
            <button
              onClick={() => onSave(job._id)}
              className={`p-1.5 rounded-lg transition-colors ${isSaved ? "text-accent bg-accent/10" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"}`}
            >
              {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <span
          className={`text-xs px-2 py-0.5 rounded-full border ${typeColors[job.type] || "bg-blue-500/15 text-blue-400 border-blue-500/20"}`}
        >
          {job.type}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/20">
          {job.experience}
        </span>
        {job.isRemote && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/20">
            Remote OK
          </span>
        )}
        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20">
          {job.category}
        </span>
      </div>

      {!compact && job.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {job.skills.slice(0, 4).map((s) => (
            <span
              key={s}
              className="text-xs px-2 py-0.5 rounded-md bg-[#1a2744] text-slate-400 border border-[#1e3a5f]"
            >
              {s}
            </span>
          ))}
          {job.skills.length > 4 && (
            <span className="text-xs px-2 py-0.5 text-slate-500">
              +{job.skills.length - 4}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#1e3a5f]">
        <div className="flex items-center gap-3 text-slate-500 text-xs">
          <span className="flex items-center gap-1">
            <MapPin size={11} />
            {job.location}
          </span>
          {salaryText && (
            <span className="flex items-center gap-1">
              <DollarSign size={11} />
              {salaryText}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {new Date(job.createdAt).toLocaleDateString()}
          </span>
        </div>
        <Link
          to={`/jobs/${job._id}`}
          className="bg-accent hover:bg-accent-hover text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
        >
          View Job
        </Link>
      </div>
    </div>
  );
}

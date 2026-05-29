import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Bookmark, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import JobCard from "../components/JobCard";

export default function SavedJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/users/saved-jobs/list")
      .then((r) => setJobs(r.data))
      .catch(() => toast.error("Failed to load saved jobs"))
      .finally(() => setLoading(false));
  }, []);

  const handleUnsave = async (jobId) => {
    try {
      await axios.post(`/api/jobs/${jobId}/save`);
      setJobs((p) => p.filter((j) => j._id !== jobId));
      toast.success("Job removed from saved");
    } catch {
      toast.error("Failed to remove");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-2 border-[#1e3a5f] border-t-accent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="py-10">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
              <Bookmark size={22} className="text-accent" /> Saved Jobs
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {jobs.length} job{jobs.length !== 1 ? "s" : ""} saved
            </p>
          </div>
          <Link
            to="/jobs"
            className="text-sm text-slate-400 hover:text-white border border-[#1e3a5f] hover:border-[#243b55] px-4 py-2 rounded-xl transition-colors"
          >
            Browse More Jobs
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#111827] border border-[#1e3a5f] flex items-center justify-center mb-5">
              <Briefcase size={28} className="text-slate-600" />
            </div>
            <h3 className="font-display text-lg font-semibold text-white mb-2">
              No saved jobs yet
            </h3>
            <p className="text-slate-400 text-sm mb-6 max-w-xs">
              Browse jobs and click the bookmark icon to save them for later.
            </p>
            <Link
              to="/jobs"
              className="bg-accent hover:bg-accent-hover text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
            >
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {jobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                onSave={handleUnsave}
                isSaved={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

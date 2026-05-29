import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import JobCard from "../components/JobCard";
import { useAuth } from "../context/AuthContext";

const TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Freelance",
  "Internship",
  "Remote",
];
const EXPERIENCES = [
  "Entry Level",
  "Mid Level",
  "Senior Level",
  "Lead",
  "Manager",
  "Executive",
];
const CATEGORIES = [
  "Technology",
  "Marketing",
  "Design",
  "Finance",
  "Healthcare",
  "Education",
  "Engineering",
  "Sales",
  "HR",
  "Legal",
  "Operations",
  "Other",
];

export default function Jobs() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [savedJobs, setSavedJobs] = useState([]);

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    location: searchParams.get("location") || "",
    type: searchParams.get("type") || "",
    category: searchParams.get("category") || "",
    experience: searchParams.get("experience") || "",
    remote: searchParams.get("remote") || "",
    sort: "createdAt",
    page: 1,
  });

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v),
      );
      const { data } = await axios.get("/api/jobs", { params });
      setJobs(data.jobs);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    if (user) {
      axios
        .get("/api/users/saved-jobs/list")
        .then((r) => setSavedJobs(r.data.map((j) => j._id)))
        .catch(() => {});
    }
  }, [user]);

  const handleSave = async (jobId) => {
    if (!user) return toast.error("Please login to save jobs");
    try {
      const { data } = await axios.post(`/api/jobs/${jobId}/save`);
      setSavedJobs((prev) =>
        data.saved ? [...prev, jobId] : prev.filter((id) => id !== jobId),
      );
      toast.success(data.message);
    } catch {
      toast.error("Failed to save job");
    }
  };

  const updateFilter = (key, val) =>
    setFilters((p) => ({ ...p, [key]: val, page: 1 }));
  const clearFilters = () =>
    setFilters({
      search: "",
      location: "",
      type: "",
      category: "",
      experience: "",
      remote: "",
      sort: "createdAt",
      page: 1,
    });
  const activeFilters = [
    filters.type,
    filters.category,
    filters.experience,
    filters.remote,
  ].filter(Boolean).length;

  const inputClass =
    "w-full bg-[#111827] border border-[#1e3a5f] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-accent transition-colors";

  return (
    <div>
      <div className="bg-[#0f1f35] border-b border-[#1e3a5f] py-10">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="font-display text-3xl font-bold text-white mb-5">
            Find Your Next Role
          </h1>
          <div className="flex gap-2 bg-[#111827] border border-[#1e3a5f] rounded-xl p-1.5 max-w-2xl">
            <div className="flex items-center flex-1 px-3">
              <Search size={16} className="text-slate-500 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search by title, skills, company..."
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchJobs()}
                className="bg-transparent border-none outline-none text-white placeholder-slate-500 text-sm px-3 py-2 w-full"
              />
            </div>
            <input
              type="text"
              placeholder="Location..."
              value={filters.location}
              onChange={(e) => updateFilter("location", e.target.value)}
              className="bg-transparent border-none outline-none text-white placeholder-slate-500 text-sm px-3 py-2 border-l border-[#1e3a5f]"
            />
            <button
              onClick={fetchJobs}
              className="bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-6">
          <div className="w-60 flex-shrink-0 hidden md:block">
            <div className="bg-[#111827] border border-[#1e3a5f] rounded-xl p-5 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                  <SlidersHorizontal size={15} /> Filters
                </h3>
                {activeFilters > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    <X size={12} /> Clear ({activeFilters})
                  </button>
                )}
              </div>

              <div className="mb-5">
                <label className="text-slate-500 text-xs uppercase tracking-wider block mb-2.5">
                  Job Type
                </label>
                {TYPES.map((t) => (
                  <label
                    key={t}
                    className="flex items-center gap-2.5 py-1.5 cursor-pointer group"
                  >
                    <input
                      type="radio"
                      name="type"
                      checked={filters.type === t}
                      onChange={() =>
                        updateFilter("type", filters.type === t ? "" : t)
                      }
                      className="accent-accent"
                    />
                    <span className="text-slate-400 text-sm group-hover:text-white transition-colors">
                      {t}
                    </span>
                  </label>
                ))}
              </div>

              <div className="mb-5">
                <label className="text-slate-500 text-xs uppercase tracking-wider block mb-2.5">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => updateFilter("category", e.target.value)}
                  className={inputClass}
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-5">
                <label className="text-slate-500 text-xs uppercase tracking-wider block mb-2.5">
                  Experience
                </label>
                {EXPERIENCES.map((e) => (
                  <label
                    key={e}
                    className="flex items-center gap-2.5 py-1.5 cursor-pointer group"
                  >
                    <input
                      type="radio"
                      name="experience"
                      checked={filters.experience === e}
                      onChange={() =>
                        updateFilter(
                          "experience",
                          filters.experience === e ? "" : e,
                        )
                      }
                      className="accent-accent"
                    />
                    <span className="text-slate-400 text-sm group-hover:text-white transition-colors">
                      {e}
                    </span>
                  </label>
                ))}
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.remote === "true"}
                  onChange={(e) =>
                    updateFilter("remote", e.target.checked ? "true" : "")
                  }
                  className="accent-accent"
                />
                <span className="text-slate-400 text-sm">Remote Only</span>
              </label>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <span className="text-slate-400 text-sm">
                {loading ? "Loading..." : `${total} jobs found`}
              </span>
              <select
                value={filters.sort}
                onChange={(e) => updateFilter("sort", e.target.value)}
                className="bg-[#111827] border border-[#1e3a5f] rounded-lg px-3 py-1.5 text-sm text-white outline-none"
              >
                <option value="createdAt">Latest</option>
                <option value="salary">Salary</option>
                <option value="views">Most Viewed</option>
              </select>
            </div>

            {loading ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-40 bg-[#111827] border border-[#1e3a5f] rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Search size={44} className="text-slate-600 mb-4" />
                <h3 className="font-display text-lg text-white mb-2">
                  No jobs found
                </h3>
                <p className="text-slate-400 text-sm mb-5">
                  Try adjusting your search filters
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-accent hover:bg-accent-hover text-white text-sm px-4 py-2 rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-3">
                  {jobs.map((job) => (
                    <JobCard
                      key={job._id}
                      job={job}
                      onSave={handleSave}
                      isSaved={savedJobs.includes(job._id)}
                    />
                  ))}
                </div>
                {pages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-8">
                    <button
                      disabled={filters.page <= 1}
                      onClick={() => updateFilter("page", filters.page - 1)}
                      className="flex items-center gap-1.5 px-3 py-2 text-sm border border-[#1e3a5f] rounded-lg text-slate-400 hover:text-white hover:border-[#243b55] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft size={15} /> Prev
                    </button>
                    <span className="text-slate-400 text-sm">
                      Page {filters.page} of {pages}
                    </span>
                    <button
                      disabled={filters.page >= pages}
                      onClick={() => updateFilter("page", filters.page + 1)}
                      className="flex items-center gap-1.5 px-3 py-2 text-sm border border-[#1e3a5f] rounded-lg text-slate-400 hover:text-white hover:border-[#243b55] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Next <ChevronRight size={15} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

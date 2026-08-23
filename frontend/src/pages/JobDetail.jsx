import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api, { getErrorMessage } from "../services/api";
import toast from "react-hot-toast";
import {
  MapPin,
  Clock,
  DollarSign,
  Users,
  Eye,
  Send,
  Bookmark,
  BookmarkCheck,
  ArrowLeft,
  Sparkles,
  Building,
  Calendar,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [generatingCL, setGeneratingCL] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    api
      .get(`/api/jobs/${id}`)
      .then((r) => setJob(r.data))
      .catch(() => navigate("/jobs"))
      .finally(() => setLoading(false));
    if (user) {
      api
        .get("/api/applications/my-applications")
        .then((r) => {
          const list = Array.isArray(r.data)
            ? r.data
            : r.data?.applications || [];
          setHasApplied(list.some((a) => a.job?._id === id || a.job === id));
        })
        .catch(() => {});
    }
  }, [id, user, navigate]);

  const handleSave = async () => {
    if (!user) return toast.error("Please login to save");
    try {
      const { data } = await api.post(`/api/jobs/${id}/save`);
      setIsSaved(data.saved);
      toast.success(data.message);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to save job"));
    }
  };

  const generateCoverLetter = async () => {
    if (!user) return toast.error("Please login");
    setGeneratingCL(true);
    try {
      const { data } = await api.post("/api/ai/generate-cover-letter", {
        jobTitle: job.title,
        company: job.company,
        jobDescription: job.description,
        userProfile: {
          name: user.name,
          title: user.profile?.title,
          bio: user.profile?.bio,
        },
        skills: user.profile?.skills,
      });
      setCoverLetter(data.coverLetter);
      toast.success("Cover letter generated!");
    } catch (err) {
      toast.error(getErrorMessage(err, "AI generation failed. Check your API key."));
    } finally {
      setGeneratingCL(false);
    }
  };

  const handleApply = async () => {
    if (!coverLetter.trim()) return toast.error("Please write a cover letter");
    setApplying(true);
    try {
      await api.post("/api/applications", {
        jobId: id,
        coverLetter,
        resume: user?.profile?.resume,
      });
      toast.success("Application submitted!");
      setShowApplyModal(false);
      setHasApplied(true);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to submit application"));
    } finally {
      setApplying(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-2 border-[#1e3a5f] border-t-accent rounded-full animate-spin" />
      </div>
    );
  if (!job) return null;

  const salary = job.salary?.min
    ? `$${(job.salary.min / 1000).toFixed(0)}k${job.salary.max ? `–$${(job.salary.max / 1000).toFixed(0)}k` : "+"}`
    : null;

  const badgeClass = "text-xs px-2.5 py-1 rounded-full border";

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-6">
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Jobs
        </Link>

        <div className="flex gap-6 flex-col lg:flex-row">
          {/* Main */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Header card */}
            <div className="bg-[#111827] border border-[#1e3a5f] rounded-xl p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-[#1a2744] border border-[#1e3a5f] flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                  {job.companyLogo ? (
                    <img
                      src={job.companyLogo}
                      alt=""
                      className="w-full h-full rounded-xl object-cover"
                    />
                  ) : (
                    job.company?.charAt(0)
                  )}
                </div>
                <div>
                  <h1 className="font-display text-2xl font-bold text-white">
                    {job.title}
                  </h1>
                  <div className="text-slate-400 text-sm mt-1 flex items-center gap-2">
                    <Building size={13} /> {job.company}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <span
                  className={`${badgeClass} bg-blue-500/15 text-blue-400 border-blue-500/20`}
                >
                  {job.type}
                </span>
                <span
                  className={`${badgeClass} bg-purple-500/15 text-purple-400 border-purple-500/20`}
                >
                  {job.experience}
                </span>
                <span
                  className={`${badgeClass} bg-green-500/15 text-green-400 border-green-500/20`}
                >
                  {job.category}
                </span>
                {job.isRemote && (
                  <span
                    className={`${badgeClass} bg-cyan-500/15 text-cyan-400 border-cyan-500/20`}
                  >
                    Remote OK
                  </span>
                )}
                {job.urgent && (
                  <span
                    className={`${badgeClass} bg-red-500/15 text-red-400 border-red-500/20`}
                  >
                    Urgent
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-slate-400 text-sm">
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} />
                  {job.location}
                </span>
                {salary && (
                  <span className="flex items-center gap-1.5">
                    <DollarSign size={14} />
                    {salary} / {job.salary?.period}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Users size={14} />
                  {job.applicants} applicants
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye size={14} />
                  {job.views} views
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} />
                  {new Date(job.createdAt).toLocaleDateString()}
                </span>
                {job.deadline && (
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    Deadline: {new Date(job.deadline).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-[#111827] border border-[#1e3a5f] rounded-xl p-6">
              <h2 className="font-display font-semibold text-white mb-4">
                Job Description
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                {job.description}
              </p>
            </div>

            {job.responsibilities?.length > 0 && (
              <div className="bg-[#111827] border border-[#1e3a5f] rounded-xl p-6">
                <h2 className="font-display font-semibold text-white mb-4">
                  Responsibilities
                </h2>
                <ul className="flex flex-col gap-2">
                  {job.responsibilities.map((r, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-sm text-slate-300"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {job.requirements?.length > 0 && (
              <div className="bg-[#111827] border border-[#1e3a5f] rounded-xl p-6">
                <h2 className="font-display font-semibold text-white mb-4">
                  Requirements
                </h2>
                <ul className="flex flex-col gap-2">
                  {job.requirements.map((r, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-sm text-slate-300"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 flex-shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {job.skills?.length > 0 && (
              <div className="bg-[#111827] border border-[#1e3a5f] rounded-xl p-6">
                <h2 className="font-display font-semibold text-white mb-4">
                  Skills Required
                </h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((s) => (
                    <span
                      key={s}
                      className="text-xs px-3 py-1.5 rounded-lg bg-[#1a2744] border border-[#1e3a5f] text-slate-300"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {job.benefits?.length > 0 && (
              <div className="bg-[#111827] border border-[#1e3a5f] rounded-xl p-6">
                <h2 className="font-display font-semibold text-white mb-4">
                  Benefits
                </h2>
                <div className="flex flex-wrap gap-2">
                  {job.benefits.map((b, i) => (
                    <span
                      key={i}
                      className="text-xs px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:w-72 flex flex-col gap-4">
            <div className="bg-[#111827] border border-[#1e3a5f] rounded-xl p-5 sticky top-20">
              {user?.role === "jobseeker" && (
                <>
                  {hasApplied ? (
                    <div className="w-full text-center py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium mb-3">
                      ✓ Already Applied
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowApplyModal(true)}
                      className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white font-medium py-3 rounded-xl transition-colors mb-3"
                    >
                      <Send size={16} /> Apply Now
                    </button>
                  )}
                  <button
                    onClick={handleSave}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                      isSaved
                        ? "border-accent/30 bg-accent/10 text-accent"
                        : "border-[#1e3a5f] text-slate-400 hover:text-white hover:border-[#243b55]"
                    }`}
                  >
                    {isSaved ? (
                      <BookmarkCheck size={16} />
                    ) : (
                      <Bookmark size={16} />
                    )}
                    {isSaved ? "Saved" : "Save Job"}
                  </button>
                </>
              )}

              {!user && (
                <Link
                  to="/login"
                  className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white font-medium py-3 rounded-xl transition-colors text-sm"
                >
                  Login to Apply
                </Link>
              )}

              <div className="mt-5 pt-5 border-t border-[#1e3a5f] flex flex-col gap-3 text-sm text-slate-400">
                {salary && (
                  <div className="flex justify-between">
                    <span>Salary</span>
                    <span className="text-white font-medium">{salary}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Type</span>
                  <span className="text-white">{job.type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Experience</span>
                  <span className="text-white">{job.experience}</span>
                </div>
                <div className="flex justify-between">
                  <span>Location</span>
                  <span className="text-white">{job.location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111827] border border-[#1e3a5f] rounded-2xl w-full max-w-lg p-6">
            <h2 className="font-display text-lg font-bold text-white mb-1">
              Apply for {job.title}
            </h2>
            <p className="text-slate-400 text-sm mb-5">at {job.company}</p>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-slate-400 text-xs font-medium">
                  Cover Letter
                </label>
                <button
                  type="button"
                  onClick={generateCoverLetter}
                  disabled={generatingCL}
                  className="flex items-center gap-1.5 text-xs text-accent hover:text-blue-300 transition-colors disabled:opacity-50"
                >
                  <Sparkles size={13} />
                  {generatingCL ? "Generating..." : "Generate with AI"}
                </button>
              </div>
              <textarea
                rows={8}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Write your cover letter here, or use AI to generate one..."
                className="w-full bg-[#0f1f35] border border-[#1e3a5f] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-accent resize-none transition-colors"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowApplyModal(false)}
                className="flex-1 py-2.5 border border-[#1e3a5f] rounded-xl text-slate-400 hover:text-white text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={applying}
                className="flex-1 flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50"
              >
                <Send size={15} />{" "}
                {applying ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import api, { getErrorMessage } from "../services/api";
import toast from "react-hot-toast";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const statusColors = {
  pending: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  reviewing: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  shortlisted: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
  interviewed: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  offered: "bg-green-500/15 text-green-400 border-green-500/20",
  rejected: "bg-red-500/15 text-red-400 border-red-500/20",
  withdrawn: "bg-slate-500/15 text-slate-400 border-slate-500/20",
};

const statusIcons = {
  pending: <Clock size={12} />,
  reviewing: <Eye size={12} />,
  shortlisted: <CheckCircle size={12} />,
  offered: <CheckCircle size={12} />,
  rejected: <XCircle size={12} />,
};

const EMPLOYER_STATUS = [
  "pending",
  "reviewing",
  "shortlisted",
  "interviewed",
  "offered",
  "rejected",
];

export default function Applications() {
  const { user } = useAuth();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalApplications: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const fetchApplications = (pageNum = 1) => {
    setLoading(true);
    const url =
      user.role === "employer"
        ? `/api/applications/employer/all?page=${pageNum}&limit=20`
        : `/api/applications/my-applications?page=${pageNum}&limit=20`;
    api
      .get(url)
      .then((r) => {
        const appsList = Array.isArray(r.data)
          ? r.data
          : r.data?.applications || [];
        setApps(appsList);
        if (r.data?.totalPages) {
          setPagination({
            totalPages: r.data.totalPages,
            totalApplications: r.data.totalApplications || appsList.length,
            hasNextPage: r.data.hasNextPage,
            hasPreviousPage: r.data.hasPreviousPage,
          });
        }
      })
      .catch((err) => toast.error(getErrorMessage(err, "Failed to load applications")))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchApplications(page);
  }, [user.role, page]);

  const withdraw = async (id) => {
    try {
      await api.put(`/api/applications/${id}/withdraw`);
      setApps((p) =>
        p.map((a) => (a._id === id ? { ...a, status: "withdrawn" } : a)),
      );
      toast.success("Application withdrawn");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to withdraw"));
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/api/applications/${id}/status`, { status });
      setApps((p) => p.map((a) => (a._id === id ? { ...a, status } : a)));
      toast.success("Status updated");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update status"));
    }
  };

  const filtered =
    filter === "all" ? apps : apps.filter((a) => a.status === filter);

  const statCounts = {
    all: apps.length,
    pending: apps.filter((a) => a.status === "pending").length,
    shortlisted: apps.filter((a) =>
      ["shortlisted", "offered", "interviewed"].includes(a.status),
    ).length,
    rejected: apps.filter((a) => a.status === "rejected").length,
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
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-white">
            {user.role === "employer" ? "All Applications" : "My Applications"}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {apps.length} total applications
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            {
              key: "all",
              label: "Total",
              color: "text-white",
              icon: <FileText size={16} />,
            },
            {
              key: "pending",
              label: "Pending",
              color: "text-orange-400",
              icon: <Clock size={16} />,
            },
            {
              key: "shortlisted",
              label: "Shortlisted",
              color: "text-green-400",
              icon: <CheckCircle size={16} />,
            },
            {
              key: "rejected",
              label: "Rejected",
              color: "text-red-400",
              icon: <XCircle size={16} />,
            },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => setFilter(s.key)}
              className={`bg-[#111827] border rounded-xl p-4 text-left transition-all ${filter === s.key ? "border-accent" : "border-[#1e3a5f] hover:border-[#243b55]"}`}
            >
              <div className={`flex items-center gap-2 mb-1 ${s.color}`}>
                {s.icon} <span className="text-xs">{s.label}</span>
              </div>
              <div className="font-display text-xl font-bold text-white">
                {statCounts[s.key]}
              </div>
            </button>
          ))}
        </div>

        <div className="flex gap-1 bg-[#0f1f35] border border-[#1e3a5f] p-1 rounded-xl mb-5 overflow-x-auto">
          {[
            "all",
            "pending",
            "reviewing",
            "shortlisted",
            "offered",
            "rejected",
            "withdrawn",
          ].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${filter === s ? "bg-[#111827] text-white shadow" : "text-slate-400 hover:text-white"}`}
            >
              {s}{" "}
              {s === "all"
                ? `(${apps.length})`
                : apps.filter((a) => a.status === s).length > 0
                  ? `(${apps.filter((a) => a.status === s).length})`
                  : ""}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FileText size={44} className="text-slate-600 mb-4" />
            <h3 className="font-display text-lg text-white mb-2">
              No applications found
            </h3>
            <p className="text-slate-400 text-sm">
              {filter === "all"
                ? user.role === "jobseeker"
                  ? "You haven't applied to any jobs yet."
                  : "No applications received yet."
                : `No applications with status "${filter}"`}
            </p>
            {user.role === "jobseeker" && filter === "all" && (
              <Link
                to="/jobs"
                className="mt-4 bg-accent hover:bg-accent-hover text-white text-sm px-4 py-2 rounded-lg transition-colors"
              >
                Browse Jobs
              </Link>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((app) => (
              <div
                key={app._id}
                className="bg-[#111827] border border-[#1e3a5f] rounded-xl overflow-hidden"
              >
                <div
                  className="flex items-center justify-between p-5 cursor-pointer hover:bg-white/[0.02] transition-colors"
                  onClick={() =>
                    setExpanded(expanded === app._id ? null : app._id)
                  }
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#1a2744] border border-[#1e3a5f] flex items-center justify-center text-white font-bold flex-shrink-0">
                      {user.role === "employer"
                        ? app.applicant?.name?.charAt(0).toUpperCase()
                        : app.job?.company?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-white text-sm truncate">
                        {user.role === "employer"
                          ? app.applicant?.name
                          : app.job?.title}
                      </div>
                      <div className="text-slate-500 text-xs mt-0.5 truncate">
                        {user.role === "employer"
                          ? `${app.applicant?.email} · ${app.job?.title}`
                          : `${app.job?.company} · ${app.job?.location}`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full border flex items-center gap-1 ${statusColors[app.status]}`}
                    >
                      {statusIcons[app.status]} {app.status}
                    </span>
                    <span className="text-slate-600 text-xs hidden md:block">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                    {expanded === app._id ? (
                      <ChevronUp size={16} className="text-slate-500" />
                    ) : (
                      <ChevronDown size={16} className="text-slate-500" />
                    )}
                  </div>
                </div>

                {expanded === app._id && (
                  <div className="border-t border-[#1e3a5f] p-5">
                    {app.coverLetter && (
                      <div className="mb-4">
                        <h4 className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
                          Cover Letter
                        </h4>
                        <p className="text-slate-300 text-sm leading-relaxed bg-[#0f1f35] border border-[#1e3a5f] rounded-xl p-4 whitespace-pre-line">
                          {app.coverLetter}
                        </p>
                      </div>
                    )}

                    {user.role === "employer" && app.applicant?.profile && (
                      <div className="mb-4">
                        <h4 className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
                          Applicant Info
                        </h4>
                        <div className="bg-[#0f1f35] border border-[#1e3a5f] rounded-xl p-4 text-sm text-slate-300 flex flex-col gap-1">
                          {app.applicant.profile.title && (
                            <div>{app.applicant.profile.title}</div>
                          )}
                          {app.applicant.profile.location && (
                            <div className="text-slate-500">
                              {app.applicant.profile.location}
                            </div>
                          )}
                          {app.applicant.profile.skills?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {app.applicant.profile.skills.map((s) => (
                                <span
                                  key={s}
                                  className="text-xs px-2 py-0.5 rounded-md bg-[#1a2744] border border-[#1e3a5f] text-slate-400"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 flex-wrap">
                      {user.role === "employer" && (
                        <select
                          value={app.status}
                          onChange={(e) =>
                            updateStatus(app._id, e.target.value)
                          }
                          className="bg-[#0f1f35] border border-[#1e3a5f] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-accent transition-colors"
                        >
                          {EMPLOYER_STATUS.map((s) => (
                            <option key={s} value={s} className="capitalize">
                              {s}
                            </option>
                          ))}
                        </select>
                      )}
                      {user.role === "jobseeker" &&
                        app.status === "pending" && (
                          <button
                            onClick={() => withdraw(app._id)}
                            className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 border border-red-400/20 hover:border-red-400/40 px-3 py-2 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} /> Withdraw
                          </button>
                        )}
                      <Link
                        to={`/jobs/${app.job?._id}`}
                        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white border border-[#1e3a5f] hover:border-[#243b55] px-3 py-2 rounded-lg transition-colors"
                      >
                        <Eye size={14} /> View Job
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 bg-[#111827] border border-[#1e3a5f] rounded-xl p-4">
                <div className="text-slate-400 text-xs">
                  Page <span className="text-white font-medium">{page}</span> of{" "}
                  <span className="text-white font-medium">{pagination.totalPages}</span> ({pagination.totalApplications} applications)
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={!pagination.hasPreviousPage}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 text-xs rounded-lg border border-[#1e3a5f] text-slate-300 hover:bg-[#1a2744] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    disabled={!pagination.hasNextPage}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1.5 text-xs rounded-lg border border-[#1e3a5f] text-slate-300 hover:bg-[#1a2744] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

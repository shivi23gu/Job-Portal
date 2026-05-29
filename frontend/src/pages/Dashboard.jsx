import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Briefcase,
  FileText,
  Bookmark,
  Plus,
  Users,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const statusColors = {
  pending: "bg-orange-500/15 text-orange-400",
  reviewing: "bg-blue-500/15 text-blue-400",
  shortlisted: "bg-cyan-500/15 text-cyan-400",
  interviewed: "bg-purple-500/15 text-purple-400",
  offered: "bg-green-500/15 text-green-400",
  rejected: "bg-red-500/15 text-red-400",
  withdrawn: "bg-red-500/15 text-red-400",
};

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({ applications: [], jobs: [], stats: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user.role === "jobseeker") {
          const [apps, saved] = await Promise.all([
            axios.get("/api/applications/my-applications"),
            axios.get("/api/users/saved-jobs/list"),
          ]);
          setData({
            applications: apps.data,
            savedJobs: saved.data,
            stats: {
              total: apps.data.length,
              pending: apps.data.filter((a) => a.status === "pending").length,
              shortlisted: apps.data.filter((a) =>
                ["shortlisted", "offered", "interviewed"].includes(a.status),
              ).length,
              rejected: apps.data.filter((a) => a.status === "rejected").length,
            },
          });
        } else {
          const [jobs, apps] = await Promise.all([
            axios.get("/api/jobs/employer/my-jobs"),
            axios.get("/api/applications/employer/all"),
          ]);
          setData({
            jobs: jobs.data,
            applications: apps.data,
            stats: {
              totalJobs: jobs.data.length,
              activeJobs: jobs.data.filter((j) => j.status === "active").length,
              totalApps: apps.data.length,
              pending: apps.data.filter((a) => a.status === "pending").length,
            },
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.role]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-2 border-[#1e3a5f] border-t-accent rounded-full animate-spin" />
      </div>
    );

  const statCards =
    user.role === "jobseeker"
      ? [
          {
            icon: <FileText size={20} />,
            color: "bg-blue-500/10 text-blue-400",
            value: data.stats.total,
            label: "Total Applications",
          },
          {
            icon: <Clock size={20} />,
            color: "bg-orange-500/10 text-orange-400",
            value: data.stats.pending,
            label: "Pending Review",
          },
          {
            icon: <CheckCircle size={20} />,
            color: "bg-green-500/10 text-green-400",
            value: data.stats.shortlisted,
            label: "Shortlisted",
          },
          {
            icon: <XCircle size={20} />,
            color: "bg-red-500/10 text-red-400",
            value: data.stats.rejected,
            label: "Not Selected",
          },
        ]
      : [
          {
            icon: <Briefcase size={20} />,
            color: "bg-blue-500/10 text-blue-400",
            value: data.stats.totalJobs,
            label: "Total Jobs Posted",
          },
          {
            icon: <CheckCircle size={20} />,
            color: "bg-green-500/10 text-green-400",
            value: data.stats.activeJobs,
            label: "Active Jobs",
          },
          {
            icon: <Users size={20} />,
            color: "bg-purple-500/10 text-purple-400",
            value: data.stats.totalApps,
            label: "Total Applications",
          },
          {
            icon: <AlertCircle size={20} />,
            color: "bg-orange-500/10 text-orange-400",
            value: data.stats.pending,
            label: "Pending Review",
          },
        ];

  return (
    <div className="py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-white">
              Welcome back, {user.name?.split(" ")[0]}! 👋
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Here's your activity overview
            </p>
          </div>
          {user.role === "employer" && (
            <Link
              to="/post-job"
              className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
            >
              <Plus size={16} /> Post New Job
            </Link>
          )}
          {user.role === "jobseeker" && (
            <Link
              to="/jobs"
              className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
            >
              <Briefcase size={16} /> Find Jobs
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((s, i) => (
            <div
              key={i}
              className="bg-[#111827] border border-[#1e3a5f] rounded-xl p-5 flex items-center gap-4"
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}
              >
                {s.icon}
              </div>
              <div>
                <div className="font-display text-2xl font-bold text-white">
                  {s.value}
                </div>
                <div className="text-slate-500 text-xs">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {user.role === "jobseeker" && (
          <div className="bg-[#111827] border border-[#1e3a5f] rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-semibold text-white">
                Recent Applications
              </h2>
              <Link
                to="/applications"
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                View all
              </Link>
            </div>
            {data.applications.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <FileText size={38} className="text-slate-600 mb-3" />
                <h3 className="font-semibold text-white mb-1">
                  No applications yet
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  Start applying to jobs to track them here
                </p>
                <Link
                  to="/jobs"
                  className="bg-accent hover:bg-accent-hover text-white text-sm px-4 py-2 rounded-lg transition-colors"
                >
                  Find Jobs
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {data.applications.slice(0, 5).map((app) => (
                  <div
                    key={app._id}
                    className="flex items-center justify-between py-3 border-b border-[#1e3a5f] last:border-0"
                  >
                    <div>
                      <div className="font-medium text-white text-sm">
                        {app.job?.title}
                      </div>
                      <div className="text-slate-500 text-xs mt-0.5">
                        {app.job?.company} · {app.job?.location}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full ${statusColors[app.status]}`}
                      >
                        {app.status}
                      </span>
                      <span className="text-slate-600 text-xs">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {user.role === "employer" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#111827] border border-[#1e3a5f] rounded-xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-semibold text-white">
                  Your Job Posts
                </h2>
                <Link
                  to="/post-job"
                  className="flex items-center gap-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Plus size={13} /> New
                </Link>
              </div>
              {data.jobs?.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <Briefcase size={36} className="text-slate-600 mb-3" />
                  <h3 className="font-semibold text-white text-sm">
                    No jobs posted yet
                  </h3>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {data.jobs.slice(0, 5).map((job) => (
                    <div
                      key={job._id}
                      className="flex items-center justify-between py-3 border-b border-[#1e3a5f] last:border-0"
                    >
                      <div>
                        <div className="font-medium text-white text-sm">
                          {job.title}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${job.status === "active" ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}
                          >
                            {job.status}
                          </span>
                          <span className="text-slate-500 text-xs flex items-center gap-1">
                            <Users size={10} /> {job.applicants}
                          </span>
                          <span className="text-slate-500 text-xs flex items-center gap-1">
                            <Eye size={10} /> {job.views}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-[#111827] border border-[#1e3a5f] rounded-xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-semibold text-white">
                  Recent Applications
                </h2>
              </div>
              {data.applications?.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <Users size={36} className="text-slate-600 mb-3" />
                  <h3 className="font-semibold text-white text-sm">
                    No applications yet
                  </h3>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {data.applications.slice(0, 5).map((app) => (
                    <div
                      key={app._id}
                      className="flex items-center justify-between py-3 border-b border-[#1e3a5f] last:border-0"
                    >
                      <div>
                        <div className="font-medium text-white text-sm">
                          {app.applicant?.name}
                        </div>
                        <div className="text-slate-500 text-xs mt-0.5">
                          {app.job?.title}
                        </div>
                      </div>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full ${statusColors[app.status]}`}
                      >
                        {app.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

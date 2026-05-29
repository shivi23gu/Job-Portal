import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Plus, X, Briefcase } from "lucide-react";

const inputClass =
  "w-full bg-[#0f1f35] border border-[#1e3a5f] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-accent transition-colors";
const labelClass = "block text-slate-400 text-xs font-medium mb-1.5";

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

export default function PostJob() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [newResp, setNewResp] = useState("");
  const [newReq, setNewReq] = useState("");
  const [newBenefit, setNewBenefit] = useState("");
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    type: "Full-time",
    category: "Technology",
    experience: "Mid Level",
    description: "",
    skills: [],
    responsibilities: [],
    requirements: [],
    benefits: [],
    salaryMin: "",
    salaryMax: "",
    salaryPeriod: "year",
    isRemote: false,
    urgent: false,
    featured: false,
    deadline: "",
  });

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));
  const toggle = (key) => setForm((p) => ({ ...p, [key]: !p[key] }));

  const addItem = (key, val, setVal) => {
    const v = val.trim();
    if (!v || form[key].includes(v)) return;
    setForm((p) => ({ ...p, [key]: [...p[key], v] }));
    setVal("");
  };
  const removeItem = (key, val) =>
    setForm((p) => ({ ...p, [key]: p[key].filter((x) => x !== val) }));

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.location) {
      toast.error("Please fill in required fields");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        salary: form.salaryMin
          ? {
              min: Number(form.salaryMin),
              max: form.salaryMax ? Number(form.salaryMax) : undefined,
              period: form.salaryPeriod,
            }
          : undefined,
      };
      await axios.post("/api/jobs", payload);
      toast.success("Job posted successfully!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post job");
    } finally {
      setLoading(false);
    }
  };

  const tagInput = (key, val, setVal, placeholder) => (
    <div>
      <div className="flex gap-2 mb-3">
        <input
          className={inputClass}
          placeholder={placeholder}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" && (e.preventDefault(), addItem(key, val, setVal))
          }
        />
        <button
          type="button"
          onClick={() => addItem(key, val, setVal)}
          className="bg-accent hover:bg-accent-hover text-white px-4 rounded-xl transition-colors flex-shrink-0"
        >
          <Plus size={16} />
        </button>
      </div>
      {form[key].length > 0 && (
        <div className="flex flex-wrap gap-2">
          {form[key].map((item) => (
            <span
              key={item}
              className="flex items-center gap-1.5 bg-[#1a2744] border border-[#1e3a5f] text-slate-300 text-sm px-3 py-1.5 rounded-lg"
            >
              {item}
              <button
                type="button"
                onClick={() => removeItem(key, item)}
                className="text-slate-500 hover:text-red-400 transition-colors"
              >
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );

  const steps = ["Basic Info", "Details", "Requirements", "Preview"];

  return (
    <div className="py-10">
      <div className="max-w-2xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-white mb-1">
            Post a New Job
          </h1>
          <p className="text-slate-400 text-sm">
            Fill in the details to attract the right candidates
          </p>
        </div>

        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              <button
                onClick={() => setStep(i + 1)}
                className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg transition-colors ${
                  step === i + 1
                    ? "bg-accent text-white"
                    : step > i + 1
                      ? "text-green-400"
                      : "text-slate-500"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold border ${
                    step === i + 1
                      ? "border-white bg-white text-accent"
                      : step > i + 1
                        ? "border-green-400 text-green-400"
                        : "border-slate-600 text-slate-500"
                  }`}
                >
                  {step > i + 1 ? "✓" : i + 1}
                </span>
                <span className="hidden sm:block">{s}</span>
              </button>
              {i < steps.length - 1 && (
                <div
                  className={`flex-1 h-px ${step > i + 1 ? "bg-green-400/40" : "bg-[#1e3a5f]"}`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-[#111827] border border-[#1e3a5f] rounded-xl p-6">
  
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <h2 className="font-display font-semibold text-white mb-2">
                Basic Information
              </h2>
              <div>
                <label className={labelClass}>Job Title *</label>
                <input
                  className={inputClass}
                  placeholder="e.g. Senior Frontend Developer"
                  value={form.title}
                  onChange={set("title")}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Company *</label>
                  <input
                    className={inputClass}
                    placeholder="Company name"
                    value={form.company}
                    onChange={set("company")}
                  />
                </div>
                <div>
                  <label className={labelClass}>Location *</label>
                  <input
                    className={inputClass}
                    placeholder="City, Country or Remote"
                    value={form.location}
                    onChange={set("location")}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Job Type</label>
                  <select
                    className={inputClass}
                    value={form.type}
                    onChange={set("type")}
                  >
                    {TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Category</label>
                  <select
                    className={inputClass}
                    value={form.category}
                    onChange={set("category")}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>Experience Level</label>
                <select
                  className={inputClass}
                  value={form.experience}
                  onChange={set("experience")}
                >
                  {EXPERIENCES.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-wrap gap-4 pt-2">
                {[
                  { key: "isRemote", label: "Remote OK" },
                  { key: "urgent", label: "Urgent Hiring" },
                  { key: "featured", label: "Featured Job" },
                ].map((opt) => (
                  <label
                    key={opt.key}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={form[opt.key]}
                      onChange={() => toggle(opt.key)}
                      className="accent-accent"
                    />
                    <span className="text-slate-300 text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4">
              <h2 className="font-display font-semibold text-white mb-2">
                Job Details
              </h2>
              <div>
                <label className={labelClass}>Job Description *</label>
                <textarea
                  rows={7}
                  className={inputClass}
                  placeholder="Describe the role, what you're looking for, company culture..."
                  value={form.description}
                  onChange={set("description")}
                />
              </div>
              <div>
                <label className={labelClass}>Salary Range</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="number"
                    className={inputClass}
                    placeholder="Min ($)"
                    value={form.salaryMin}
                    onChange={set("salaryMin")}
                  />
                  <span className="text-slate-500">–</span>
                  <input
                    type="number"
                    className={inputClass}
                    placeholder="Max ($)"
                    value={form.salaryMax}
                    onChange={set("salaryMax")}
                  />
                  <select
                    className={inputClass}
                    style={{ maxWidth: "110px" }}
                    value={form.salaryPeriod}
                    onChange={set("salaryPeriod")}
                  >
                    <option value="year">/ year</option>
                    <option value="month">/ month</option>
                    <option value="hour">/ hour</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>Application Deadline</label>
                <input
                  type="date"
                  className={inputClass}
                  value={form.deadline}
                  onChange={set("deadline")}
                />
              </div>
              <div>
                <label className={labelClass}>Required Skills</label>
                {tagInput(
                  "skills",
                  newSkill,
                  setNewSkill,
                  "e.g. React, Node.js, Python",
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-5">
              <h2 className="font-display font-semibold text-white mb-2">
                Requirements & Benefits
              </h2>
              <div>
                <label className={labelClass}>Responsibilities</label>
                {tagInput(
                  "responsibilities",
                  newResp,
                  setNewResp,
                  "e.g. Lead frontend architecture",
                )}
              </div>
              <div>
                <label className={labelClass}>Requirements</label>
                {tagInput(
                  "requirements",
                  newReq,
                  setNewReq,
                  "e.g. 3+ years of React experience",
                )}
              </div>
              <div>
                <label className={labelClass}>Benefits</label>
                {tagInput(
                  "benefits",
                  newBenefit,
                  setNewBenefit,
                  "e.g. Health insurance, Remote work, Stock options",
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="font-display font-semibold text-white mb-4">
                Preview & Submit
              </h2>
              <div className="bg-[#0f1f35] border border-[#1e3a5f] rounded-xl p-5 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#1a2744] border border-[#1e3a5f] flex items-center justify-center">
                    <Briefcase size={20} className="text-accent" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white">
                      {form.title || "—"}
                    </h3>
                    <div className="text-slate-400 text-sm">
                      {form.company} · {form.location}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20">
                    {form.type}
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/20">
                    {form.experience}
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/15 text-green-400 border border-green-500/20">
                    {form.category}
                  </span>
                  {form.isRemote && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/20">
                      Remote OK
                    </span>
                  )}
                  {form.urgent && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/20">
                      Urgent
                    </span>
                  )}
                </div>
                {form.salaryMin && (
                  <div className="text-slate-300 text-sm">
                    ${form.salaryMin.toLocaleString()}{" "}
                    {form.salaryMax
                      ? `– $${Number(form.salaryMax).toLocaleString()}`
                      : "+"}{" "}
                    / {form.salaryPeriod}
                  </div>
                )}
                <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">
                  {form.description}
                </p>
                {form.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {form.skills.map((s) => (
                      <span
                        key={s}
                        className="text-xs px-2.5 py-1 rounded-md bg-[#1a2744] border border-[#1e3a5f] text-slate-400"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 1}
              className="px-4 py-2.5 text-sm border border-[#1e3a5f] rounded-xl text-slate-400 hover:text-white hover:border-[#243b55] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>
            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="px-5 py-2.5 text-sm bg-accent hover:bg-accent-hover text-white font-medium rounded-xl transition-colors"
              >
                Next →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 text-sm bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-medium rounded-xl transition-colors"
              >
                {loading ? "Posting..." : "🚀 Post Job"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

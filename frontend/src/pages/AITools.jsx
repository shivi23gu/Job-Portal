import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Sparkles,
  MessageSquare,
  FileText,
  Target,
  Star,
  BookOpen,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const TOOLS = [
  {
    id: "cover-letter",
    icon: <FileText size={20} />,
    label: "Cover Letter Generator",
    color: "#3b82f6",
    desc: "Generate personalized cover letters for any job",
  },
  {
    id: "career-advice",
    icon: <MessageSquare size={20} />,
    label: "Career Coach",
    color: "#8b5cf6",
    desc: "Get personalized career guidance and advice",
  },
  {
    id: "resume-analyzer",
    icon: <Star size={20} />,
    label: "Resume Analyzer",
    color: "#f59e0b",
    desc: "Analyze your resume and get improvement suggestions",
  },
  {
    id: "job-match",
    icon: <Target size={20} />,
    label: "Job Matcher",
    color: "#22c55e",
    desc: "Find the best job matches for your profile",
  },
  {
    id: "interview-prep",
    icon: <BookOpen size={20} />,
    label: "Interview Prep",
    color: "#06b6d4",
    desc: "Get tailored interview questions and tips",
  },
];

const inputClass =
  "w-full bg-[#0f1f35] border border-[#1e3a5f] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-accent transition-colors";
const labelClass = "block text-slate-400 text-xs font-medium mb-1.5";

export default function AITools() {
  const { user } = useAuth();
  const [activeTool, setActiveTool] = useState("cover-letter");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const [clForm, setClForm] = useState({
    jobTitle: "",
    company: "",
    jobDescription: "",
  });
  const [question, setQuestion] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [matchForm, setMatchForm] = useState({
    preferredType: "Full-time",
    location: "",
  });
  const [interviewForm, setInterviewForm] = useState({
    jobTitle: "",
    company: "",
    jobDescription: "",
  });

  const run = async () => {
    if (
      activeTool === "cover-letter" &&
      (!clForm.jobTitle || !clForm.company)
    ) {
      toast.error("Please enter Job Title and Company name.");
      return;
    }
    if (activeTool === "career-advice" && !question.trim()) {
      toast.error("Please enter your question.");
      return;
    }
    if (
      activeTool === "resume-analyzer" &&
      (!resumeText.trim() || !targetRole.trim())
    ) {
      toast.error("Please enter Target Role and Resume content.");
      return;
    }
    if (activeTool === "interview-prep" && !interviewForm.jobTitle) {
      toast.error("Please enter Job Title.");
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      let data;
      if (activeTool === "cover-letter") {
        const res = await axios.post("/api/ai/generate-cover-letter", {
          ...clForm,
          userProfile: {
            name: user.name,
            title: user.profile?.title,
            bio: user.profile?.bio,
          },
          skills: user.profile?.skills,
        });
        data = { type: "cover-letter", content: res.data.coverLetter };
      } else if (activeTool === "career-advice") {
        const res = await axios.post("/api/ai/career-advice", {
          question,
          userProfile: user.profile,
        });
        data = { type: "text", content: res.data.advice };
      } else if (activeTool === "resume-analyzer") {
        const res = await axios.post("/api/ai/analyze-resume", {
          resumeText,
          targetRole,
        });
        data = { type: "resume-analysis", content: res.data };
      } else if (activeTool === "job-match") {
        const res = await axios.post("/api/ai/job-match", {
          userSkills: user.profile?.skills || [],
          experience: user.profile?.experience?.[0]?.position || "Professional",
          ...matchForm,
        });
        data = { type: "job-match", content: res.data.matches };
      } else if (activeTool === "interview-prep") {
        const res = await axios.post("/api/ai/interview-prep", interviewForm);
        data = { type: "interview-prep", content: res.data };
      }
      setResult(data);
      toast.success("AI analysis complete!");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "AI service error. Check your API key.",
      );
    } finally {
      setLoading(false);
    }
  };

  const tool = TOOLS.find((t) => t.id === activeTool);

  return (
    <div className="py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 text-accent px-4 py-1.5 rounded-full text-sm mb-4">
            <Sparkles size={14} /> Powered by Claude AI
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">
            AI Career Tools
          </h1>
          <p className="text-slate-400 text-sm">
            Advanced AI tools to supercharge your job search and career growth
          </p>
        </div>

        <div className="flex gap-6 flex-col lg:flex-row">
          {/* Tool selector */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="flex flex-col gap-2">
              {TOOLS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setActiveTool(t.id);
                    setResult(null);
                  }}
                  className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                    activeTool === t.id
                      ? "border-accent bg-accent/5"
                      : "border-[#1e3a5f] bg-[#111827] hover:border-[#243b55]"
                  }`}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: t.color + "20", color: t.color }}
                  >
                    {t.icon}
                  </div>
                  <div>
                    <div
                      className={`text-sm font-medium ${activeTool === t.id ? "text-white" : "text-slate-300"}`}
                    >
                      {t.label}
                    </div>
                    <div className="text-slate-500 text-xs mt-0.5 leading-tight">
                      {t.desc}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-4">
            <div className="bg-[#111827] border border-[#1e3a5f] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: tool.color + "20", color: tool.color }}
                >
                  {tool.icon}
                </div>
                <div>
                  <h2 className="font-display font-semibold text-white">
                    {tool.label}
                  </h2>
                  <p className="text-slate-400 text-sm">{tool.desc}</p>
                </div>
              </div>

              {activeTool === "cover-letter" && (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Job Title *</label>
                      <input
                        className={inputClass}
                        placeholder="e.g. Frontend Developer"
                        value={clForm.jobTitle}
                        onChange={(e) =>
                          setClForm((p) => ({ ...p, jobTitle: e.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Company *</label>
                      <input
                        className={inputClass}
                        placeholder="e.g. Google"
                        value={clForm.company}
                        onChange={(e) =>
                          setClForm((p) => ({ ...p, company: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>
                      Job Description (optional)
                    </label>
                    <textarea
                      rows={4}
                      className={inputClass}
                      placeholder="Paste the job description..."
                      value={clForm.jobDescription}
                      onChange={(e) =>
                        setClForm((p) => ({
                          ...p,
                          jobDescription: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              )}

              {activeTool === "career-advice" && (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className={labelClass}>Your Question *</label>
                    <textarea
                      rows={4}
                      className={inputClass}
                      placeholder="e.g. How do I transition from a backend developer to a product manager?"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="text-slate-500 text-xs">Quick questions:</p>
                    {[
                      "How do I negotiate a higher salary?",
                      "What skills are most in-demand in 2026?",
                      "How do I stand out in interviews?",
                    ].map((q) => (
                      <button
                        key={q}
                        onClick={() => setQuestion(q)}
                        className={`text-left text-sm px-4 py-2.5 rounded-lg border transition-colors ${question === q ? "border-accent bg-accent/5 text-white" : "border-[#1e3a5f] text-slate-400 hover:text-white hover:border-[#243b55]"}`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTool === "resume-analyzer" && (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className={labelClass}>Target Role *</label>
                    <input
                      className={inputClass}
                      placeholder="e.g. Senior React Developer"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Resume Content *</label>
                    <textarea
                      rows={8}
                      className={inputClass}
                      placeholder="Paste your resume text here..."
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {activeTool === "job-match" && (
                <div className="flex flex-col gap-4">
                  <p className="text-slate-400 text-sm bg-[#0f1f35] border border-[#1e3a5f] rounded-xl p-4">
                    We'll match jobs based on your profile skills:{" "}
                    <span className="text-white">
                      {user.profile?.skills?.join(", ") ||
                        "No skills added yet — update your profile first"}
                    </span>
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Preferred Type</label>
                      <select
                        className={inputClass}
                        value={matchForm.preferredType}
                        onChange={(e) =>
                          setMatchForm((p) => ({
                            ...p,
                            preferredType: e.target.value,
                          }))
                        }
                      >
                        {[
                          "Full-time",
                          "Part-time",
                          "Contract",
                          "Freelance",
                          "Internship",
                          "Remote",
                        ].map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Preferred Location</label>
                      <input
                        className={inputClass}
                        placeholder="e.g. New York or Remote"
                        value={matchForm.location}
                        onChange={(e) =>
                          setMatchForm((p) => ({
                            ...p,
                            location: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTool === "interview-prep" && (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Job Title *</label>
                      <input
                        className={inputClass}
                        placeholder="e.g. Product Manager"
                        value={interviewForm.jobTitle}
                        onChange={(e) =>
                          setInterviewForm((p) => ({
                            ...p,
                            jobTitle: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Company (optional)</label>
                      <input
                        className={inputClass}
                        placeholder="e.g. Amazon"
                        value={interviewForm.company}
                        onChange={(e) =>
                          setInterviewForm((p) => ({
                            ...p,
                            company: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>
                      Job Description (optional)
                    </label>
                    <textarea
                      rows={4}
                      className={inputClass}
                      placeholder="Paste the job description..."
                      value={interviewForm.jobDescription}
                      onChange={(e) =>
                        setInterviewForm((p) => ({
                          ...p,
                          jobDescription: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={run}
                disabled={loading}
                className="mt-6 w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors"
              >
                <Sparkles size={16} />{" "}
                {loading ? "Generating with AI..." : `Generate ${tool.label}`}
              </button>
            </div>

            {result && (
              <div className="bg-[#111827] border border-[#1e3a5f] rounded-xl p-6">
                <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
                  <Sparkles size={16} className="text-accent" /> Result
                </h3>

                {result.type === "cover-letter" && (
                  <>
                    <pre className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-sans bg-[#0f1f35] border border-[#1e3a5f] rounded-xl p-5">
                      {result.content}
                    </pre>
                    <button
                      onClick={() =>
                        navigator.clipboard
                          .writeText(result.content)
                          .then(() => toast.success("Copied!"))
                      }
                      className="mt-3 text-sm text-accent hover:underline"
                    >
                      Copy to clipboard
                    </button>
                  </>
                )}

                {result.type === "text" && (
                  <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap bg-[#0f1f35] border border-[#1e3a5f] rounded-xl p-5">
                    {result.content}
                  </div>
                )}

                {result.type === "resume-analysis" && (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4 bg-[#0f1f35] border border-[#1e3a5f] rounded-xl p-4">
                      <div className="text-4xl font-display font-bold text-accent">
                        {result.content.score}
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          Overall Score
                        </div>
                        <div className="text-slate-400 text-sm">out of 100</div>
                      </div>
                    </div>
                    {result.content.strengths?.length > 0 && (
                      <div>
                        <h4 className="text-green-400 font-medium text-sm mb-2">
                          Strengths
                        </h4>
                        {result.content.strengths.map((s, i) => (
                          <p
                            key={i}
                            className="text-slate-300 text-sm py-1 border-b border-[#1e3a5f] last:border-0"
                          >
                            {s}
                          </p>
                        ))}
                      </div>
                    )}
                    {result.content.improvements?.length > 0 && (
                      <div>
                        <h4 className="text-orange-400 font-medium text-sm mb-2">
                          Improvements
                        </h4>
                        {result.content.improvements.map((s, i) => (
                          <p
                            key={i}
                            className="text-slate-300 text-sm py-1 border-b border-[#1e3a5f] last:border-0"
                          >
                            {s}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {result.type === "job-match" &&
                  Array.isArray(result.content) && (
                    <div className="flex flex-col gap-3">
                      {result.content.map((match, i) => (
                        <div
                          key={i}
                          className="bg-[#0f1f35] border border-[#1e3a5f] rounded-xl p-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium text-white text-sm">
                              {match.title}
                            </div>
                            <span className="text-xs px-2.5 py-1 rounded-full bg-accent/15 text-accent">
                              {match.matchScore}% match
                            </span>
                          </div>
                          <div className="text-slate-400 text-xs">
                            {match.company} · {match.location}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                {result.type === "interview-prep" && (
                  <div className="flex flex-col gap-3">
                    {result.content.questions?.map((q, i) => (
                      <div
                        key={i}
                        className="bg-[#0f1f35] border border-[#1e3a5f] rounded-xl p-4"
                      >
                        <p className="text-white text-sm font-medium mb-2">
                          {i + 1}. {q.question}
                        </p>
                        {q.tip && (
                          <p className="text-slate-400 text-xs">💡 {q.tip}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

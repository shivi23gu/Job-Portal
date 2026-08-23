import React, { useState } from "react";
import api, { getErrorMessage } from "../services/api";
import toast from "react-hot-toast";
import {
  User,
  Briefcase,
  Plus,
  X,
  Save,
  MapPin,
  Phone,
  Globe,
  Linkedin,
  Github,
  Zap,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const inputClass =
  "w-full bg-[#0f1f35] border border-[#1e3a5f] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-accent transition-colors";
const labelClass = "block text-slate-400 text-xs font-medium mb-1.5";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [newSkill, setNewSkill] = useState("");

  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.profile?.phone || "",
    location: user?.profile?.location || "",
    bio: user?.profile?.bio || "",
    title: user?.profile?.title || "",
    website: user?.profile?.website || "",
    linkedin: user?.profile?.social?.linkedin || "",
    github: user?.profile?.social?.github || "",
    skills: user?.profile?.skills || [],
    experience: user?.profile?.experience || [],
    education: user?.profile?.education || [],
  });

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const addSkill = () => {
    const s = newSkill.trim();
    if (!s || form.skills.includes(s)) return;
    setForm((p) => ({ ...p, skills: [...p.skills, s] }));
    setNewSkill("");
  };

  const removeSkill = (s) =>
    setForm((p) => ({ ...p, skills: p.skills.filter((x) => x !== s) }));

  const addExperience = () =>
    setForm((p) => ({
      ...p,
      experience: [
        ...p.experience,
        {
          company: "",
          position: "",
          startDate: "",
          endDate: "",
          description: "",
          current: false,
        },
      ],
    }));

  const updateExp = (i, key, val) =>
    setForm((p) => {
      const exp = [...p.experience];
      exp[i] = { ...exp[i], [key]: val };
      return { ...p, experience: exp };
    });

  const removeExp = (i) =>
    setForm((p) => ({
      ...p,
      experience: p.experience.filter((_, idx) => idx !== i),
    }));

  const addEducation = () =>
    setForm((p) => ({
      ...p,
      education: [
        ...p.education,
        {
          school: "",
          degree: "",
          field: "",
          startDate: "",
          endDate: "",
          current: false,
        },
      ],
    }));

  const updateEdu = (i, key, val) =>
    setForm((p) => {
      const edu = [...p.education];
      edu[i] = { ...edu[i], [key]: val };
      return { ...p, education: edu };
    });

  const removeEdu = (i) =>
    setForm((p) => ({
      ...p,
      education: p.education.filter((_, idx) => idx !== i),
    }));

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        profile: {
          phone: form.phone,
          location: form.location,
          bio: form.bio,
          title: form.title,
          website: form.website,
          social: { linkedin: form.linkedin, github: form.github },
          skills: form.skills,
          experience: form.experience,
          education: form.education,
        },
      };
      const { data } = await api.put("/api/auth/profile", payload);
      updateUser(data.user || data);
      toast.success(data.message || "Profile saved!");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to save profile"));
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "basic", label: "Basic Info", icon: <User size={14} /> },
    { id: "skills", label: "Skills", icon: <Zap size={14} /> },
    { id: "experience", label: "Experience", icon: <Briefcase size={14} /> },
    { id: "education", label: "Education", icon: <GraduationCap size={14} /> },
  ];

  return (
    <div className="py-10">
      <div className="max-w-3xl mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-white">
              My Profile
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Keep your profile updated to get better job matches
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
          >
            <Save size={15} /> {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>

        <div className="bg-[#111827] border border-[#1e3a5f] rounded-xl p-5 mb-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center text-white font-bold text-2xl">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-white">{user?.name}</div>
            <div className="text-slate-400 text-sm">{user?.email}</div>
            <div className="text-xs px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/20 inline-block mt-1 capitalize">
              {user?.role}
            </div>
          </div>
        </div>

        <div className="flex gap-1 bg-[#0f1f35] border border-[#1e3a5f] p-1 rounded-xl mb-5">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 flex-1 justify-center py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === t.id
                  ? "bg-[#111827] text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className="bg-[#111827] border border-[#1e3a5f] rounded-xl p-6">
     
          {activeTab === "basic" && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input
                    className={inputClass}
                    placeholder="Your name"
                    value={form.name}
                    onChange={set("name")}
                  />
                </div>
                <div>
                  <label className={labelClass}>Professional Title</label>
                  <input
                    className={inputClass}
                    placeholder="e.g. Senior Frontend Developer"
                    value={form.title}
                    onChange={set("title")}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    <Phone size={11} className="inline mr-1" />
                    Phone
                  </label>
                  <input
                    className={inputClass}
                    placeholder="+1 234 567 8900"
                    value={form.phone}
                    onChange={set("phone")}
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    <MapPin size={11} className="inline mr-1" />
                    Location
                  </label>
                  <input
                    className={inputClass}
                    placeholder="City, Country"
                    value={form.location}
                    onChange={set("location")}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Bio</label>
                <textarea
                  rows={4}
                  className={inputClass}
                  placeholder="Write a short bio about yourself..."
                  value={form.bio}
                  onChange={set("bio")}
                />
              </div>
              <div>
                <label className={labelClass}>
                  <Globe size={11} className="inline mr-1" />
                  Website
                </label>
                <input
                  className={inputClass}
                  placeholder="https://yourwebsite.com"
                  value={form.website}
                  onChange={set("website")}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    <Linkedin size={11} className="inline mr-1" />
                    LinkedIn
                  </label>
                  <input
                    className={inputClass}
                    placeholder="linkedin.com/in/username"
                    value={form.linkedin}
                    onChange={set("linkedin")}
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    <Github size={11} className="inline mr-1" />
                    GitHub
                  </label>
                  <input
                    className={inputClass}
                    placeholder="github.com/username"
                    value={form.github}
                    onChange={set("github")}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "skills" && (
            <div>
              <div className="flex gap-2 mb-5">
                <input
                  className={inputClass}
                  placeholder="Add a skill (e.g. React, Python, Figma)"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSkill()}
                />
                <button
                  onClick={addSkill}
                  className="flex items-center gap-1.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors flex-shrink-0"
                >
                  <Plus size={15} /> Add
                </button>
              </div>
              {form.skills.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No skills added yet. Add skills to improve your job matches.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {form.skills.map((s) => (
                    <span
                      key={s}
                      className="flex items-center gap-1.5 bg-[#1a2744] border border-[#1e3a5f] text-slate-300 text-sm px-3 py-1.5 rounded-lg"
                    >
                      {s}
                      <button
                        onClick={() => removeSkill(s)}
                        className="text-slate-500 hover:text-red-400 transition-colors"
                      >
                        <X size={13} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "experience" && (
            <div className="flex flex-col gap-5">
              {form.experience.map((exp, i) => (
                <div
                  key={i}
                  className="bg-[#0f1f35] border border-[#1e3a5f] rounded-xl p-4 relative"
                >
                  <button
                    onClick={() => removeExp(i)}
                    className="absolute top-3 right-3 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <X size={15} />
                  </button>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className={labelClass}>Company</label>
                      <input
                        className={inputClass}
                        placeholder="Company name"
                        value={exp.company}
                        onChange={(e) =>
                          updateExp(i, "company", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Position</label>
                      <input
                        className={inputClass}
                        placeholder="Your role"
                        value={exp.position}
                        onChange={(e) =>
                          updateExp(i, "position", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className={labelClass}>Start Date</label>
                      <input
                        type="month"
                        className={inputClass}
                        value={exp.startDate}
                        onChange={(e) =>
                          updateExp(i, "startDate", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className={labelClass}>End Date</label>
                      <input
                        type="month"
                        className={inputClass}
                        value={exp.endDate}
                        onChange={(e) =>
                          updateExp(i, "endDate", e.target.value)
                        }
                        disabled={exp.current}
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-slate-400 text-sm mb-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exp.current}
                      onChange={(e) =>
                        updateExp(i, "current", e.target.checked)
                      }
                      className="accent-accent"
                    />
                    Currently working here
                  </label>
                  <div>
                    <label className={labelClass}>Description</label>
                    <textarea
                      rows={3}
                      className={inputClass}
                      placeholder="What did you do here?"
                      value={exp.description}
                      onChange={(e) =>
                        updateExp(i, "description", e.target.value)
                      }
                    />
                  </div>
                </div>
              ))}
              <button
                onClick={addExperience}
                className="flex items-center justify-center gap-2 border border-dashed border-[#1e3a5f] hover:border-accent text-slate-400 hover:text-white py-3 rounded-xl text-sm transition-colors"
              >
                <Plus size={15} /> Add Experience
              </button>
            </div>
          )}

          {activeTab === "education" && (
            <div className="flex flex-col gap-5">
              {form.education.map((edu, i) => (
                <div
                  key={i}
                  className="bg-[#0f1f35] border border-[#1e3a5f] rounded-xl p-4 relative"
                >
                  <button
                    onClick={() => removeEdu(i)}
                    className="absolute top-3 right-3 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <X size={15} />
                  </button>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className={labelClass}>School / University</label>
                      <input
                        className={inputClass}
                        placeholder="Institution name"
                        value={edu.school}
                        onChange={(e) => updateEdu(i, "school", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Degree</label>
                      <input
                        className={inputClass}
                        placeholder="e.g. Bachelor's"
                        value={edu.degree}
                        onChange={(e) => updateEdu(i, "degree", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className={labelClass}>Field of Study</label>
                    <input
                      className={inputClass}
                      placeholder="e.g. Computer Science"
                      value={edu.field}
                      onChange={(e) => updateEdu(i, "field", e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Start Date</label>
                      <input
                        type="month"
                        className={inputClass}
                        value={edu.startDate}
                        onChange={(e) =>
                          updateEdu(i, "startDate", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className={labelClass}>End Date</label>
                      <input
                        type="month"
                        className={inputClass}
                        value={edu.endDate}
                        onChange={(e) =>
                          updateEdu(i, "endDate", e.target.value)
                        }
                        disabled={edu.current}
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-slate-400 text-sm mt-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={edu.current}
                      onChange={(e) =>
                        updateEdu(i, "current", e.target.checked)
                      }
                      className="accent-accent"
                    />
                    Currently studying here
                  </label>
                </div>
              ))}
              <button
                onClick={addEducation}
                className="flex items-center justify-center gap-2 border border-dashed border-[#1e3a5f] hover:border-accent text-slate-400 hover:text-white py-3 rounded-xl text-sm transition-colors"
              >
                <Plus size={15} /> Add Education
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

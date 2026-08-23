import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { User, Briefcase, Building } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../services/api";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "jobseeker",
    companyName: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      };
      if (form.role === "employer" && form.companyName)
        payload.company = { name: form.companyName };
      await register(payload);
      toast.success("Account created! Welcome aboard!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(getErrorMessage(err, "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const inputClass =
    "w-full bg-[#0f1f35] border border-[#1e3a5f] rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-accent transition-colors";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-bg-primary">
      <div className="w-full max-w-sm">
        <div className="bg-[#111827] border border-[#1e3a5f] rounded-2xl p-8">
          <Link to="/" className="flex items-center gap-2 justify-center mb-6">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Briefcase size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-white text-lg">
              TalentBridge
            </span>
          </Link>

          <h1 className="font-display text-2xl font-bold text-white text-center mb-1">
            Create Account
          </h1>
          <p className="text-slate-400 text-sm text-center mb-6">
            Start your journey today
          </p>

          <div className="flex gap-2 mb-5 bg-[#0f1f35] p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, role: "jobseeker" }))}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
                form.role === "jobseeker"
                  ? "bg-[#111827] text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <User size={15} /> Job Seeker
            </button>
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, role: "employer" }))}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
                form.role === "employer"
                  ? "bg-[#111827] text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Building size={15} /> Employer
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div>
              <label className="text-slate-400 text-xs font-medium block mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                value={form.name}
                onChange={set("name")}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs font-medium block mb-1.5">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={set("email")}
                required
                className={inputClass}
              />
            </div>
            {form.role === "employer" && (
              <div>
                <label className="text-slate-400 text-xs font-medium block mb-1.5">
                  Company Name
                </label>
                <input
                  type="text"
                  placeholder="Acme Corp"
                  value={form.companyName}
                  onChange={set("companyName")}
                  className={inputClass}
                />
              </div>
            )}
            <div>
              <label className="text-slate-400 text-xs font-medium block mb-1.5">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={set("password")}
                required
                minLength={6}
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors mt-1"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-5">
            Already have an account?{" "}
            <Link to="/login" className="text-accent hover:underline">
              Sign in
            </Link>
          </p>
          <p className="text-center text-slate-600 text-xs mt-2">
            By signing up you agree to our{" "}
            <a href="#" className="hover:text-slate-400">
              Terms
            </a>{" "}
            and{" "}
            <a href="#" className="hover:text-slate-400">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

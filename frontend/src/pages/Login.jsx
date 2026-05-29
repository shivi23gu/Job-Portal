import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Mail, Lock, Briefcase, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = (role) => {
    const creds =
      role === "employer"
        ? { email: "employer@demo.com", password: "demo123" }
        : { email: "seeker@demo.com", password: "demo123" };
    setForm(creds);
  };

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
            Welcome back
          </h1>
          <p className="text-slate-400 text-sm text-center mb-6">
            Sign in to your account
          </p>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => demoLogin("seeker")}
              className="flex-1 text-xs py-2 border border-[#1e3a5f] rounded-lg text-slate-400 hover:text-white hover:border-[#243b55] transition-colors"
            >
              Demo: Job Seeker
            </button>
            <button
              onClick={() => demoLogin("employer")}
              className="flex-1 text-xs py-2 border border-[#1e3a5f] rounded-lg text-slate-400 hover:text-white hover:border-[#243b55] transition-colors"
            >
              Demo: Employer
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-slate-400 text-xs font-medium block mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, email: e.target.value }))
                  }
                  required
                  className="w-full bg-[#0f1f35] border border-[#1e3a5f] rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-xs font-medium block mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, password: e.target.value }))
                  }
                  required
                  className="w-full bg-[#0f1f35] border border-[#1e3a5f] rounded-lg pl-9 pr-10 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-accent transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors mt-1"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-5">
            Don't have an account?{" "}
            <Link to="/register" className="text-accent hover:underline">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

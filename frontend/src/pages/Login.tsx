import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, ArrowLeft, Loader2, Chrome, Github } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
// Import the production URL from your config
import { API_BASE_URL } from "../config/api";

// Stat interface
interface Stat { label: string; value: string; }

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      // Updated to use the production URL variable
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", // IMPORTANT for cookies
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      // redirect after login
      navigate("/dashboard");

    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const staggerContainer = {
    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans bg-white">
      
      {/* Left Column */}
      <div className="flex-1 bg-[#0A5E53] p-12 lg:p-20 flex flex-col relative text-white min-h-[400px]">
        
        <div className="flex items-center gap-3 mb-auto">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
            <div className="w-6 h-6 bg-white rounded-sm rotate-45 flex items-center justify-center">
               <div className="w-4 h-4 bg-[#0A5E53] rounded-full" />
            </div>
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight block leading-none">AI Academy</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/60 font-medium">CULTIVATED LEARNING</span>
          </div>
        </div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="max-w-md"
        >
          <motion.p variants={fadeInUp} className="text-[#34D399] font-bold text-xs uppercase tracking-widest mb-4">
             ✦ Empowering 10k+ Learners
          </motion.p>
          
          <motion.h1 variants={fadeInUp} className="text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-12">
            The future belongs to <br />
            <span className="text-[#34D399]">the curious.</span>
          </motion.h1>

          <motion.div variants={staggerContainer} className="grid grid-cols-2 gap-x-12 gap-y-10 border-t border-white/10 pt-10">
            {[
              { val: "50+", lab: "COURSES" },
              { val: "120+", lab: "MENTORS" },
              { val: "94%", lab: "SUCCESS RATE" },
              { val: "18+", lab: "COUNTRIES" }
            ].map((stat, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <p className="text-4xl font-bold">{stat.val}</p>
                <p className="text-[10px] uppercase tracking-widest text-white/50 font-bold mt-1">{stat.lab}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <div className="mt-auto pt-10 text-[10px] tracking-widest text-white/30 uppercase">
          © 2024 AI Academy — All Rights Reserved
        </div>
      </div>

      {/* Right Column */}
      <div className="flex-1 bg-white p-8 lg:p-20 flex flex-col justify-center items-center">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-[400px]"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[#0A2E2A] tracking-tight">Welcome back.</h2>
            <p className="text-gray-500 mt-3 text-sm">
              Log in to continue your journey and resume your AI daily streak.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-2 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#0A5E53] transition-colors" />
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-[#F0F7F6] border-transparent rounded-2xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#0A5E53] transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                  Password
                </label>
                <a href="#" className="text-[11px] font-bold text-[#0A5E53] hover:underline">
                  Forgot Password?
                </a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#0A5E53] transition-colors" />
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-[#F0F7F6] border-transparent rounded-2xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#0A5E53] transition-all outline-none"
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full bg-[#0A5E53] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#0A5E53]/20 hover:bg-[#084d44] transition-colors"
            >
              {loading ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold text-gray-400">
              <span className="bg-white px-4">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-all font-bold text-sm text-gray-700">
              <Chrome className="w-4 h-4 text-red-500" /> Google
            </button>
            <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-all font-bold text-sm text-gray-700">
              <Github className="w-4 h-4" /> GitHub
            </button>
          </div>

          <p className="mt-10 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link to="/signup" className="text-[#0A5E53] font-bold hover:underline">
              Sign up
            </Link>
          </p>

          <div className="mt-8 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-[#0A5E53] transition-colors uppercase tracking-widest"
            >
              <ArrowLeft className="w-3 h-3" /> Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
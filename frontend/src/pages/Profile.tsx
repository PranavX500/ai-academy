import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User, Mail, Calendar, Award, BookOpen, Clock,
  Edit3, Camera, Bell, Shield, LogOut, ChevronRight, Activity, Settings2
} from "lucide-react";
import { Link } from "react-router-dom";
// Ensure this points to the config file where we defined the Railway URL
import { API_BASE_URL } from "../config/api"; 

export const Profile = () => {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Updated to use the production URL variable
        const res = await fetch(`${API_BASE_URL}/api/profile`, {
          credentials: "include",
        });
        if (res.ok) {
          const json = await res.json();
          setProfileData(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-[#0A5E53]">Loading Academy Profile...</div>;
  if (!profileData) return <div>Error loading profile.</div>;

  const { user, stats } = profileData;

  return (
    <div className="min-h-screen bg-[#FDFDFF] flex font-sans text-[#0A2E2A]">
      
      {/* Fixed Sidebar */}
      <aside className="w-72 bg-[#0A5E53] hidden lg:flex flex-col p-8 text-white shrink-0 shadow-2xl">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
            <User className="text-white w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight">AI Academy</span>
        </div>

        <nav className="space-y-3 flex-1">
          {[
            { icon: BookOpen, label: "My Courses", path: "/Course", active: false },
            { icon: User, label: "Profile", path: "/profile", active: true },
            { icon: Award, label: "Billing", path: "/billing", active: false },
          ].map((item, i) => (
            <Link
              key={i}
              to={item.path}
              className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold transition-all ${
                item.active ? "bg-white text-[#0A5E53] shadow-lg shadow-black/10" : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <button className="flex items-center gap-3 px-5 py-4 text-white/40 hover:text-red-400 font-bold transition-all mt-auto border-t border-white/10 pt-6">
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-[#F8FAFB] overflow-y-auto">
        
        {/* Modern Header */}
        <header className="h-20 bg-white/60 backdrop-blur-xl sticky top-0 z-40 px-10 flex items-center justify-between border-b border-gray-100/50">
          <h2 className="font-black text-xl tracking-tight">Profile Dashboard</h2>
          <div className="flex items-center gap-4">
             <div className="text-right">
                <p className="text-sm font-black leading-none mb-1">{user.fullName}</p>
                <p className="text-[10px] font-black text-[#34D399] uppercase tracking-widest">Premium Student</p>
             </div>
             <div className="w-10 h-10 bg-gradient-to-tr from-[#0A5E53] to-[#34D399] rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-[#0A5E53]/20">
                {user.fullName.charAt(0)}
             </div>
          </div>
        </header>

        <div className="p-10 max-w-6xl mx-auto space-y-10">
          
          {/* Hero Section: Avatar & Info */}
          <section className="flex flex-col md:flex-row gap-10 items-center bg-white p-10 rounded-[40px] shadow-sm border border-gray-100">
            <div className="relative group">
              <div className="w-32 h-32 bg-[#0A5E53] rounded-[40px] flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-[#0A5E53]/30">
                {user.fullName.charAt(0)}
              </div>
              <button className="absolute -bottom-2 -right-2 bg-white w-10 h-10 rounded-2xl shadow-xl flex items-center justify-center text-[#0A5E53] border border-gray-100 hover:scale-110 transition-transform">
                <Camera className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 text-center md:text-left space-y-2">
              <h1 className="text-4xl font-black tracking-tighter text-gray-900">{user.fullName}</h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-gray-400 font-bold text-sm">
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                  <Mail className="w-4 h-4 text-[#0A5E53]" /> {user.email}
                </div>
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                  <Calendar className="w-4 h-4 text-[#0A5E53]" /> Joined {new Date(user.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100 transition-colors border border-gray-100">
                <Settings2 className="w-5 h-5" />
              </button>
              <button className="px-8 py-4 bg-[#0A5E53] text-white rounded-2xl font-black shadow-lg shadow-[#0A5E53]/20 hover:y-[-2px] transition-all flex items-center gap-2">
                <Edit3 className="w-5 h-5" /> Edit Profile
              </button>
            </div>
          </section>

          {/* Integrated Quick Settings & Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Quick Preferences */}
            <div className="lg:col-span-4 space-y-4">
               <h3 className="font-black text-gray-900 uppercase tracking-widest text-[10px] ml-2">Quick Preferences</h3>
               {[
                 { label: "Notifications", icon: Bell, desc: "Manage alerts" },
                 { label: "Privacy & Security", icon: Shield, desc: "Protect account" },
                 { label: "Achievements", icon: Award, desc: "View badges" }
               ].map((pref, i) => (
                 <button key={i} className="w-full flex items-center justify-between p-5 bg-white rounded-3xl border border-gray-100 hover:border-[#0A5E53]/30 hover:shadow-xl hover:shadow-black/[0.02] transition-all group">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-[#0A5E53]/5">
                        <pref.icon className="w-5 h-5 text-gray-500 group-hover:text-[#0A5E53]" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-sm text-gray-800">{pref.label}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">{pref.desc}</p>
                      </div>
                   </div>
                   <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#0A5E53] group-hover:translate-x-1 transition-all" />
                 </button>
               ))}
            </div>

            {/* Right: Stats Grid */}
            <div className="lg:col-span-8 space-y-6">
               <h3 className="font-black text-gray-900 uppercase tracking-widest text-[10px] ml-2">Learning Progress</h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <StatBox icon={BookOpen} color="blue" label="Courses" value={stats.courses} unit="Enrolled" />
                 <StatBox icon={Activity} color="emerald" label="Progress" value={`${stats.overallProgress}%`} unit="Completed" />
                 <StatBox icon={Clock} color="purple" label="Modules" value={stats.totalContents} unit="Available" />
                 <StatBox icon={Award} color="amber" label="Lessons" value={stats.completedContents} unit="Finished" />
               </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

/* Mini Stat Component */
const StatBox = ({ icon: Icon, color, label, value, unit }: any) => {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    purple: "bg-purple-50 text-purple-600",
    amber: "bg-amber-50 text-amber-600",
  };
  return (
    <div className="bg-white p-8 rounded-[35px] border border-gray-100 flex items-center gap-6 group hover:shadow-lg transition-all">
      <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center ${colors[color]} group-hover:scale-110 transition-transform`}>
        <Icon className="w-8 h-8" />
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{label}</p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-black text-gray-900 tracking-tighter">{value}</span>
          <span className="text-xs font-bold text-gray-400">{unit}</span>
        </div>
      </div>
    </div>
  );
};
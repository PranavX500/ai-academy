import { motion } from "framer-motion";
import { 
  BookOpen, CheckCircle, Clock, PlayCircle, Trophy, Zap, 
  Layout, Settings, LogOut, Search, Bell, ChevronRight, ArrowRight, User
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { AppNavbar } from "../components/PageContent";
// Import the production URL from your config
import { API_BASE_URL } from "../config/api";

export const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [userName, setUserName] = useState("User");

  const [global, setGlobal] = useState({
    total: 0,
    completed: 0,
    percentage: 0,
  });

  const [courses, setCourses] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");

  // 🔥 FETCH DASHBOARD
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // Updated to use the production URL variable
        const res = await fetch(`${API_BASE_URL}/api/dashboard`, {
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch dashboard");
        }

        setGlobal(data.data.global);
        setCourses(data.data.courses);
        
        // Fetch user profile for name using production URL
        const profileRes = await fetch(`${API_BASE_URL}/api/profile`, {
          credentials: "include",
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setUserName(profileData.data?.user?.fullName || "User");
        }

      } catch (err) {
        console.error("Dashboard error:", err);
      }
    };

    fetchDashboard();
  }, []);

  // Sync search term with URL parameters
  useEffect(() => {
    const urlSearchTerm = searchParams.get("search") || "";
    setSearchTerm(urlSearchTerm);
  }, [searchParams]);

  // Update URL when search term changes
  useEffect(() => {
    if (searchTerm) {
      setSearchParams({ search: searchTerm });
    } else {
      setSearchParams({});
    }
  }, [searchTerm, setSearchParams]);

  return (
    <div className="min-h-screen bg-[#F8FAFB] flex font-sans text-[#0A2E2A]">
      <AppNavbar />

      <main className="flex-1 flex flex-col min-h-screen md:ml-64 mt-16 md:mt-0">
        
        {/* Header */}
        <header className="h-20 bg-white/60 backdrop-blur-xl sticky top-16 md:top-0 z-30 px-6 md:px-10 flex items-center justify-between border-b border-gray-100/50">
          <div className="relative w-96 hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search courses, lessons..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#0A5E53]/10 outline-none"
            />
          </div>

          <div className="flex items-center gap-6 ml-auto">
            <button className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100">
              <Bell className="w-5 h-5 text-gray-500" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold">{userName}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Pro Member</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">

          {/* Welcome */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-10">
            <h1 className="text-4xl font-bold mb-2">Welcome back 👋</h1>
            <p className="text-gray-500">
              Overall progress: 
              <span className="font-bold text-[#0A5E53]"> {global.percentage}%</span>
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { label: "Total Courses", value: global.total },
              { label: "Completed", value: global.completed },
              { label: "Progress", value: `${global.percentage}%` }
            ].map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm">
                <p className="text-xs text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Continue Learning */}
          <div className="flex justify-between mb-6">
            <h2 className="text-2xl font-bold">Continue Learning</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {courses
              .filter(course => 
                course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                course.modules.some((module: any) => 
                  module.title.toLowerCase().includes(searchTerm.toLowerCase())
                )
              )
              .map((course, i) => (
              <motion.div 
                key={course.courseId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl p-6 shadow-sm"
              >
                <h3 className="font-bold text-lg">{course.title}</h3>

                <div className="text-sm text-gray-500 mt-2 mb-4">
                  {course.modules.length} Modules
                </div>

                {/* Progress */}
                <div className="mb-3 text-sm font-bold text-[#0A5E53]">
                  {course.progress.percentage}%
                </div>

                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${course.progress.percentage}%` }}
                    className="h-full bg-[#0A5E53]"
                  />
                </div>

                <Link 
                  to={`/Course`} 
                  className="mt-5 flex items-center gap-2 text-sm font-bold text-[#0A5E53] hover:opacity-80 transition-opacity"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
            
            {/* Empty State */}
            {courses.filter(course => 
              course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              course.modules.some((module: any) => 
                module.title.toLowerCase().includes(searchTerm.toLowerCase())
              )
            ).length === 0 && searchTerm && (
              <div className="col-span-full text-center py-12">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No courses found matching "{searchTerm}"</p>
                <p className="text-gray-400 text-sm mt-2">Try searching for course titles or module names</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};
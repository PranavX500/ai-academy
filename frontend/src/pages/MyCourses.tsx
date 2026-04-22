import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  BookOpen, Clock, PlayCircle, 
  Loader2, ArrowRight, Lock 
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AppNavbar } from "../components/PageContent";
// Importing the production URL from your config
import { API_BASE_URL } from "../config/api";

interface Module {
  _id: string;
  title: string;
  duration: string;
  learningUnits: number;
  isFree: boolean;
  price?: number;
  courseId: string;
  progressPercentage: number;
  canAccess?: boolean;
  isLocked?: boolean;
  requiresPurchase?: boolean;
}

export const MyCourses = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState("User");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const headers: HeadersInit = {
          "Content-Type": "application/json"
        };

        // 1. Fetch Modules using production URL
        const modulesRes = await fetch(`${API_BASE_URL}/api/modules`, {
          method: "GET",
          headers,
          credentials: "include"
        });
        
        if (!modulesRes.ok) {
           throw new Error(modulesRes.status === 401 ? "Unauthorized: Token missing or invalid." : "Failed to load modules.");
        }
        
        const modulesJson = await modulesRes.json();
        const rawModules = modulesJson.data || [];

        // 2. Fetch user profile for name using production URL
        const profileRes = await fetch(`${API_BASE_URL}/api/profile`, {
          credentials: "include",
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setUserName(profileData.data?.user?.fullName || "User");
        }

        // 3. Fetch progress for each module using production URL
        const modulesWithProgress = await Promise.all(
          rawModules.map(async (module: any) => {
            try {
              const progRes = await fetch(`${API_BASE_URL}/api/courses/${module.courseId}/progress`, {
                method: "GET",
                headers,
                credentials: "include"
              });
              
              if (!progRes.ok) return { ...module, progressPercentage: 0 };
              
              const progJson = await progRes.json();
              return { 
                ...module, 
                progressPercentage: progJson.progress?.percentage || 0 
              };
            } catch (err) {
              console.error("Progress error:", err);
              return { ...module, progressPercentage: 0 };
            }
          })
        );

        setModules(modulesWithProgress);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFB] flex font-sans text-[#0A2E2A]">
      <AppNavbar />

      <div className="flex-1 flex flex-col md:ml-64 mt-16 md:mt-0">
        {/* HEADER */}
        <header className="h-20 bg-white/60 backdrop-blur-xl sticky top-16 md:top-0 z-30 px-6 md:px-10 flex items-center justify-between border-b border-gray-100/50">
          <h2 className="text-xl font-bold hidden md:block">My Courses</h2>
          <Link to="/profile" className="flex items-center gap-6 cursor-pointer hover:opacity-80 transition-opacity ml-auto">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-[#0A2E2A]">{userName}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">PRO MEMBER</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-2xl overflow-hidden">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Pranav" alt="profile" />
            </div>
          </Link>
        </header>

        <main className="p-6 md:p-10 lg:p-14 max-w-7xl mx-auto w-full">
          <div className="mb-12">
            <h1 className="text-3xl font-extrabold text-[#0A2E2A] md:hidden">My Courses</h1>
            {error && <p className="text-red-500 font-bold mt-2">{error}</p>}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 text-gray-300">
              <Loader2 className="w-12 h-12 animate-spin mb-4" />
              <p className="text-xs font-black uppercase tracking-widest">Syncing Progress</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {modules.map((module, i) => (
                <motion.div
                  key={module._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`bg-white rounded-[32px] border border-gray-100 shadow-sm transition-all duration-500 overflow-hidden flex flex-col group ${
                    module.isLocked ? "opacity-85" : "hover:shadow-xl"
                  }`}
                >
                  <div className="p-8 flex-1">
                    <div className="flex justify-between items-start mb-8">
                      <div className="w-12 h-12 bg-[#F0F7F6] rounded-2xl flex items-center justify-center text-[#0A5E53] group-hover:bg-[#0A5E53] group-hover:text-white transition-colors">
                        {module.isLocked ? <Lock className="w-6 h-6" /> : <PlayCircle className="w-6 h-6" />}
                      </div>
                      <span className="text-[10px] font-black px-3 py-1 bg-gray-100 text-gray-400 rounded-lg uppercase">
                        {module.isLocked ? "LOCKED" : module.isFree ? "AI CORE" : "AI ARCHITECTURE"}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold mb-4 leading-tight text-[#0A2E2A]">
                      {module.title}
                    </h3>

                    <div className="flex gap-4 mb-8 text-[11px] font-bold text-gray-400 uppercase">
                      <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" /> {module.learningUnits} Units</span>
                      <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {module.duration}</span>
                    </div>

                    <div className="space-y-3 mt-auto">
                      {module.isLocked && (
                        <div className="text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                          🔒 Subscription required {module.price ? `(₹${module.price})` : ""}
                        </div>
                      )}
                      <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${module.progressPercentage}%` }}
                          className="h-full bg-[#0A5E53]"
                        />
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 text-right">{module.progressPercentage}% Complete</p>
                    </div>
                  </div>

                  <div className="px-8 pb-8">
                    {module.isLocked ? (
                      <button 
                        onClick={() => navigate('/billing')}
                        className="w-full py-4 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 border border-amber-200"
                      >
                        Unlock Module
                        <Lock className="w-4 h-4" />
                      </button>
                    ) : (
                      <Link to={`/module/${module._id}`}>
                        <button className="w-full py-4 bg-gray-50 hover:bg-[#0A5E53] text-[#0A2E2A] hover:text-white font-bold text-xs rounded-2xl transition-all duration-300 flex items-center justify-center gap-2">
                          {module.progressPercentage === 100 ? "Review Material" : "Continue Learning"}
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </Link>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
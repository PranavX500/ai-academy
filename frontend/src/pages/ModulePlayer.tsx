import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { 
  ChevronLeft, ArrowRight, ArrowLeft, Loader2,
  HelpCircle, CheckCircle2, XCircle, CheckCircle, Sparkles, Zap
} from "lucide-react";
// Import the production URL from your config
import { API_BASE_URL } from "../config/api";

// --- Types ---
interface ContentItem { type: "video" | "text"; value: string; _id: string; }
interface LearningUnit { _id: string; title: string; unitNumber: number; items: ContentItem[]; }
interface QuizQuestion { 
  _id: string; 
  question: string; 
  options: { text: string; _id: string }[]; 
}

// --- YouTube Helper ---
const getYouTubeEmbedUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) return `https://www.youtube.com/embed/${parsed.pathname.replace("/", "")}`;
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v") || parsed.pathname.split("/shorts/")[1];
      return id ? `https://www.youtube.com/embed/${id}` : (parsed.pathname.includes("/embed/") ? url : null);
    }
    return null;
  } catch { return null; }
};

type ReadableBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

const toReadableBlocks = (raw: string): ReadableBlock[] => {
  const text = String(raw || "").replace(/\r/g, "").trim();
  if (!text) return [];

  const sections = text.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
  const source = sections.length ? sections : [text];
  const blocks: ReadableBlock[] = [];

  source.forEach((section) => {
    const lines = section.split("\n").map((l) => l.trim()).filter(Boolean);
    const isList = lines.length > 1 && lines.every((l) => /^([-*•]|\d+\.)\s+/.test(l));

    if (isList) {
      blocks.push({
        type: "list",
        items: lines.map((l) => l.replace(/^([-*•]|\d+\.)\s+/, "").trim())
      });
      return;
    }

    if (!section.includes("\n") && section.length > 320) {
      const sentences = section.split(/(?<=[.!?])\s+/).filter(Boolean);
      if (sentences.length > 3) {
        for (let i = 0; i < sentences.length; i += 2) {
          blocks.push({ type: "paragraph", text: sentences.slice(i, i + 2).join(" ") });
        }
        return;
      }
    }

    blocks.push({ type: "paragraph", text: section });
  });

  return blocks;
};

export const ModulePlayer = () => {
  const { moduleId } = useParams();
  const [units, setUnits] = useState<LearningUnit[]>([]);
  const [activeUnitIndex, setActiveUnitIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [quizMode, setQuizMode] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [quizResult, setQuizResult] = useState<{ passed: boolean; score: number } | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);

  const [unlockedUnitIndexes, setUnlockedUnitIndexes] = useState<number[]>([0]);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/contents/${moduleId}`, { credentials: "include" });
        const json = await res.json();
        if (json.ok && Array.isArray(json.data)) {
          setUnits(json.data);
          setActiveUnitIndex(0);
          setUnlockedUnitIndexes([0]);
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchContent();
  }, [moduleId]);

  const startQuiz = async () => {
    const currentContentId = units[activeUnitIndex]?._id;
    if (!currentContentId) return;
    setQuizLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/quizzes/${currentContentId}`, { credentials: "include" });
      const json = await res.json();
      const fetchedQuestions = json.data?.[0]?.questions || [];
      setQuestions(fetchedQuestions);
      setUserAnswers(new Array(fetchedQuestions.length).fill(-1));
      setQuizMode(true);
    } catch (err) { console.error(err); } finally { setQuizLoading(false); }
  };

  const markContentCompleted = async (contentId: string) => {
    const endpoints = [
      `${API_BASE_URL}/api/progress/complete`,
      `${API_BASE_URL}/api/progress/mark-complete`,
      `${API_BASE_URL}/api/contents/${contentId}/complete`
    ];

    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contentId, completed: true })
        });
        if (res.ok) return true;
      } catch { continue; }
    }
    return false;
  };

  const triggerCertificateCheck = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/dashboard`, {
        method: "GET",
        credentials: "include"
      });
    } catch { /* non-blocking */ }
  };

  const submitQuiz = async () => {
    const currentContentId = units[activeUnitIndex]?._id;
    if (!currentContentId) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/quiz/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId: currentContentId, answers: userAnswers }),
        credentials: "include"
      });
      const json = await res.json();

      const passed = Boolean(json?.result?.passed ?? json?.pass ?? false);
      const score = Number(json?.result?.percentage ?? json?.score ?? 0);
      setQuizResult({ passed, score });

      if (passed) {
        await markContentCompleted(currentContentId);
        setUnlockedUnitIndexes((prev) => {
          const next = activeUnitIndex + 1;
          return prev.includes(next) ? prev : [...prev, next];
        });
        if (activeUnitIndex === units.length - 1) {
          await triggerCertificateCheck();
        }
      }
    } catch (err) { console.error(err); }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#0A2E2A] text-white">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}>
        <Zap className="w-12 h-12 text-[#00FFD1]" fill="currentColor" />
      </motion.div>
      <p className="mt-6 font-mono text-[10px] tracking-[0.3em] uppercase opacity-40">Syncing Environment...</p>
    </div>
  );

  const currentUnit = units[activeUnitIndex];
  const isCurrentUnlocked = unlockedUnitIndexes.includes(activeUnitIndex);
  const canGoNext = unlockedUnitIndexes.includes(activeUnitIndex + 1);

  return (
    <div className="h-screen bg-[#F4F7F6] flex overflow-hidden font-sans selection:bg-[#00FFD1] selection:text-[#0A2E2A]">
      
      <div className="fixed top-0 left-0 right-0 h-1.5 z-[100] bg-gray-200/20 backdrop-blur-sm">
        <motion.div 
          className="h-full bg-gradient-to-r from-[#0A5E53] to-[#00FFD1] shadow-[0_0_15px_rgba(0,255,209,0.4)]" 
          style={{ scaleX, transformOrigin: "left" }} 
        />
      </div>

      <aside className="w-85 p-6 hidden lg:flex flex-col relative z-20">
        <div className="bg-white/90 backdrop-blur-xl border border-white/40 shadow-2xl rounded-[40px] flex flex-col h-full overflow-hidden">
          <div className="p-8 pb-4">
            <Link to="/Course" className="group flex items-center gap-2 text-gray-400 hover:text-[#0A5E53] mb-8 transition-all">
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest">Library</span>
            </Link>
            <h2 className="text-2xl font-black tracking-tighter text-[#0A2E2A] flex items-center gap-2">
              Curriculum <Sparkles className="w-4 h-4 text-[#0A5E53]" />
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-2">
            {units.map((unit, index) => {
              const isUnlocked = unlockedUnitIndexes.includes(index);
              return (
                <button
                  key={unit._id}
                  disabled={!isUnlocked}
                  onClick={() => {
                    if (!isUnlocked) return;
                    setQuizMode(false);
                    setQuizResult(null);
                    setActiveUnitIndex(index);
                  }}
                  className={`w-full text-left p-4 rounded-[20px] flex items-center gap-4 transition-all relative overflow-hidden group ${
                    activeUnitIndex === index && !quizMode
                      ? "bg-[#0A2E2A] text-white shadow-xl"
                      : "hover:bg-gray-100 text-gray-400"
                  } ${!isUnlocked ? "opacity-40 cursor-not-allowed" : ""}`}
                >
                  <span className={`text-[10px] font-mono ${activeUnitIndex === index ? "text-[#00FFD1]" : "text-gray-300"}`}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="font-bold text-[13px] flex-1">{unit.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative z-10 scroll-smooth">
        <div className="max-w-4xl mx-auto py-20 px-8">
          <AnimatePresence mode="wait">
            {!quizMode ? (
              <motion.div 
                key="content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="mb-12">
                   <div className="flex items-center gap-3 text-[#0A5E53] font-mono text-[10px] tracking-widest uppercase mb-4">
                      <span className="px-2 py-0.5 bg-[#0A5E53]/10 rounded-md">Phase {activeUnitIndex + 1}</span>
                      <div className="w-12 h-[1px] bg-[#0A5E53]/20" />
                   </div>
                   <h1 className="text-5xl lg:text-7xl font-black text-[#0A2E2A] leading-[0.95] tracking-tighter mb-4">
                     {currentUnit?.title}
                   </h1>
                </div>

                <div className="space-y-10">
                  {currentUnit?.items?.map((item, idx) => (
                    <motion.div 
                      key={item._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      {item.type === "video" ? (
                        <div className="bg-[#0A2E2A] p-2 rounded-[40px] shadow-2xl aspect-video overflow-hidden border-8 border-white/50">
                          {getYouTubeEmbedUrl(item.value) ? (
                            <iframe 
                              src={getYouTubeEmbedUrl(item.value)!} 
                              className="w-full h-full rounded-[28px]" 
                              allowFullScreen 
                            />
                          ) : (
                            <video src={item.value} controls className="w-full h-full rounded-[28px]" />
                          )}
                        </div>
                      ) : (
                        <div className="bg-white p-12 rounded-[40px] border border-gray-100 shadow-sm leading-relaxed text-xl text-gray-700 font-medium">
                          <div className="space-y-5 text-[18px] leading-9">
                            {toReadableBlocks(item.value).map((block, i) =>
                              block.type === "paragraph" ? (
                                <p key={i} className="font-medium">{block.text}</p>
                              ) : (
                                <ul key={i} className="list-disc pl-6 space-y-2 marker:text-[#0A5E53]">
                                  {block.items.map((li, j) => (
                                    <li key={j} className="font-medium">{li}</li>
                                  ))}
                                </ul>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>

                <footer className="mt-20 bg-[#0A2E2A] p-5 rounded-[32px] flex justify-between items-center shadow-2xl">
                  <button
                    disabled={activeUnitIndex === 0}
                    onClick={() => setActiveUnitIndex((i) => i - 1)}
                    className="p-4 text-white hover:bg-white/10 rounded-2xl disabled:opacity-0 transition-all"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>

                  <div className="text-[10px] font-mono text-white/40 tracking-[0.3em]">SYSTEM STATUS: READY</div>

                  {activeUnitIndex < units.length - 1 && canGoNext ? (
                    <button
                      onClick={() => setActiveUnitIndex((i) => i + 1)}
                      className="bg-white text-[#0A2E2A] px-10 py-5 rounded-2xl font-black flex items-center gap-3 hover:bg-[#00FFD1] transition-all"
                    >
                      NEXT PHASE <ArrowRight className="w-5 h-5" />
                    </button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={startQuiz}
                      disabled={!isCurrentUnlocked}
                      className="bg-[#00FFD1] text-[#0A2E2A] px-10 py-5 rounded-2xl font-black flex items-center gap-3 shadow-lg disabled:opacity-50"
                    >
                      {quizLoading ? <Loader2 className="animate-spin" /> : "LAUNCH ASSESSMENT"} <Zap className="w-5 h-5 fill-current" />
                    </motion.button>
                  )}
                </footer>
              </motion.div>
            ) : (
              <motion.div 
                key="quiz"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-3xl mx-auto"
              >
                <div className="bg-white p-12 rounded-[48px] shadow-2xl border border-gray-50">
                  {quizResult ? (
                    <div className="text-center space-y-8">
                      {quizResult.passed ? (
                        <div className="space-y-6">
                          <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-12 h-12" />
                          </div>
                          <h2 className="text-5xl font-black text-[#0A2E2A]">Module Complete</h2>
                          <p className="text-6xl font-mono text-emerald-500">{quizResult.score}%</p>
                          {activeUnitIndex < units.length - 1 ? (
                            <button
                              onClick={() => {
                                setQuizMode(false);
                                setQuizResult(null);
                                setActiveUnitIndex((i) => i + 1);
                              }}
                              className="inline-block bg-[#0A2E2A] text-[#00FFD1] px-12 py-5 rounded-2xl font-black"
                            >
                              NEXT PHASE
                            </button>
                          ) : (
                            <Link to="/Course" className="inline-block bg-[#0A2E2A] text-[#00FFD1] px-12 py-5 rounded-2xl font-black">
                              CONTINUE JOURNEY
                            </Link>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="w-24 h-24 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto">
                            <XCircle className="w-12 h-12" />
                          </div>
                          <h2 className="text-5xl font-black text-[#0A2E2A]">Review Required</h2>
                          <p className="text-6xl font-mono text-red-500">{quizResult.score}%</p>
                          <button onClick={() => { setQuizMode(false); setQuizResult(null); }} className="bg-[#0A2E2A] text-white px-12 py-5 rounded-2xl font-black">
                            RETRY MODULE
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-10">
                      <div className="flex justify-between items-center">
                        <h2 className="text-3xl font-black text-[#0A2E2A]">Assessment</h2>
                        <span className="font-mono text-xs text-gray-400">STATUS: ACTIVE</span>
                      </div>
                      {questions.map((q, qIdx) => (
                        <div key={q._id} className="space-y-6">
                          <p className="text-xl font-bold text-[#0A2E2A]">{qIdx + 1}. {q.question}</p>
                          <div className="grid gap-3">
                            {q.options.map((opt, oIdx) => (
                              <button 
                                key={opt._id}
                                onClick={() => { const u = [...userAnswers]; u[qIdx] = oIdx; setUserAnswers(u); }}
                                className={`p-6 rounded-[24px] border-2 text-left font-bold transition-all flex justify-between items-center ${
                                  userAnswers[qIdx] === oIdx 
                                  ? "border-[#0A2E2A] bg-[#0A2E2A] text-white" 
                                  : "border-gray-50 text-gray-400 hover:border-gray-200"
                                }`}
                              >
                                {opt.text}
                                {userAnswers[qIdx] === oIdx && <CheckCircle className="w-5 h-5 text-[#00FFD1]" />}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                      <button 
                        onClick={submitQuiz}
                        disabled={userAnswers.includes(-1)}
                        className="w-full py-8 bg-[#0A2E2A] text-[#00FFD1] rounded-[32px] font-black text-xl shadow-2xl disabled:opacity-20 active:scale-95 transition-all"
                      >
                        SUBMIT DATA
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
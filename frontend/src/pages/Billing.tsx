import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, 
  Loader2, 
  ShieldCheck, 
  ArrowRight, 
  ChevronLeft,
  CreditCard,
  AlertCircle,
  Check,
  Sparkles,
  Brain,
  Zap
} from "lucide-react";
// Import the production URL from your config
import { API_BASE_URL } from "../config/api";

const BRAND_COLOR = "#0A5E53";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export const Billing = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const navigate = useNavigate();

  const startPayment = async () => {
    try {
      setLoading(true);
      setMessage(null);

      const sdkReady = await loadRazorpayScript();
      if (!sdkReady) {
        throw new Error("Failed to load Razorpay checkout SDK");
      }

      // 1. Create Order using API_BASE_URL
      const orderRes = await fetch(`${API_BASE_URL}/api/payments/create-order`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      });

      const orderJson = await orderRes.json();
      if (!orderRes.ok || !orderJson?.data) {
        throw new Error(orderJson?.message || "Unable to create payment order");
      }

      const order = orderJson.data;

      const razorpay = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "AI Academy",
        description: "Unlock Premium AI Modules",
        order_id: order.orderId,
        theme: { color: BRAND_COLOR },
        handler: async (response: any) => {
          try {
            // 2. Verify Payment using API_BASE_URL
            const verifyRes = await fetch(`${API_BASE_URL}/api/payments/verify`, {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify(response)
            });

            const verifyJson = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(verifyJson?.message || "Payment verification failed");
            }

            setMessage({ type: 'success', text: "Payment successful! Premium modules unlocked." });
            setTimeout(() => navigate("/Course"), 2000);
          } catch (err: any) {
            setMessage({ type: 'error', text: err?.message || "Payment verification failed" });
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setMessage({ type: 'error', text: "Payment cancelled" });
          }
        }
      });

      razorpay.open();
    } catch (err: any) {
      setLoading(false);
      setMessage({ type: 'error', text: err?.message || "Payment failed" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A5E53] via-[#0D6B5F] to-[#0F7A6B] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration elements */}
      <div className="absolute inset-0">
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"
        />
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      <motion.button 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(-1)}
        className="fixed top-8 left-8 z-10 flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors font-medium bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm"
      >
        <ChevronLeft className="w-5 h-5" /> Back to Courses
      </motion.button>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl bg-white/95 backdrop-blur-xl rounded-[32px] shadow-2xl border border-white/20 overflow-hidden flex flex-col md:flex-row relative"
      >
        {/* Left Side: Summary */}
        <div className="md:w-5/12 bg-gradient-to-br from-[#0A5E53] via-[#0D6B5F] to-[#0F7A6B] p-10 text-white flex flex-col justify-between">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <CreditCard className="w-8 h-8" />
              <span className="font-bold text-xl tracking-tight">AI Academy</span>
            </div>
            
            <h2 className="text-4xl font-bold mb-8 leading-tight">Unlock Premium AI Mastery</h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3"><Brain className="w-5 h-5" /> Advanced LLM Concepts</div>
              <div className="flex items-center gap-3"><Zap className="w-5 h-5" /> Agentic AI Integration</div>
              <div className="flex items-center gap-3"><Sparkles className="w-5 h-5" /> Professional Certificate</div>
            </div>
          </div>

          <div className="mt-12 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <p className="text-white/60 text-xs uppercase font-bold tracking-widest mb-2">Total Amount</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black">₹499</span>
              <span className="text-white/40 text-sm">one-time</span>
            </div>
          </div>
        </div>

        {/* Right Side: Action */}
        <div className="md:w-7/12 p-10 flex flex-col justify-center">
          <div className="mb-10 text-center md:text-left">
            <span className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <ShieldCheck className="w-4 h-4" /> Secure Checkout
            </span>
            <h3 className="text-3xl font-bold text-gray-900 mb-3">Complete Your Purchase</h3>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-[#0A5E53] rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-800">Bank-grade Security</p>
                <p className="text-xs text-gray-500">PCI DSS compliant transactions</p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={startPayment}
              disabled={loading}
              className="w-full py-6 rounded-3xl bg-[#0A5E53] text-white font-bold text-xl shadow-xl flex items-center justify-center gap-3 disabled:opacity-60"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Pay with Razorpay"}
              {!loading && <ArrowRight />}
            </motion.button>

            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-4 rounded-xl border ${
                    message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  <p className="text-sm font-medium text-center">{message.text}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-[#0A5E53] animate-spin" />
            <p className="font-bold">Securing transaction...</p>
          </div>
        </div>
      )}
    </div>
  );
};
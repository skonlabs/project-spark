import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Brain, Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const demoUser = { full_name: form.full_name, email: form.email };
      localStorage.setItem("access_token", "demo-token");
      localStorage.setItem("user", JSON.stringify(demoUser));
      toast.success("Account created! Welcome to GAEO.");
      navigate("/dashboard");
    } catch {
      toast.error("Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
      <div className="fixed inset-0 bg-radial-glow pointer-events-none" />
      <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm relative"
      >
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-primary/20">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight">GAEO</span>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/80 p-8 backdrop-blur-sm gradient-border">
          <h1 className="text-2xl font-bold text-center mb-1.5 tracking-tight">Create your account</h1>
          <p className="text-muted-foreground text-center text-sm mb-7">Start optimizing for AI discovery</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium mb-2 block">Full name</label>
              <input type="text" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="w-full rounded-xl border border-input bg-background/80 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all" placeholder="Jane Smith" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-xl border border-input bg-background/80 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all" placeholder="you@company.com" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full rounded-xl border border-input bg-background/80 px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all" placeholder="Min. 8 characters" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Create account
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/auth/login" className="text-primary hover:underline font-medium">Sign in</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

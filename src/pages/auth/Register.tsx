import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setLoading(true);
    const { error } = await signUp(form.email, form.password, form.full_name);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Account created! Welcome to GAEO.");
      navigate("/dashboard");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden lg:flex lg:w-[45%] relative items-center justify-center border-r border-border bg-card/30">
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="max-w-[340px] px-12">
          <div className="flex items-center gap-2 mb-10">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">G</span>
            </div>
            <span className="font-heading font-bold text-xl tracking-tight">GAEO</span>
          </div>
          <h2 className="text-[1.75rem] font-heading font-bold tracking-tight mb-3 leading-tight">
            Your brand in every<br /><span className="text-primary">AI answer.</span>
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">Join hundreds of companies already optimizing their AI visibility.</p>
          <div className="mt-10 grid grid-cols-3 gap-6">
            {[{ v: "42→78", l: "Score uplift" }, { v: "3.2×", l: "More citations" }, { v: "14 days", l: "First results" }].map((s) => (
              <div key={s.l} className="text-center">
                <div className="text-lg font-heading font-bold text-primary">{s.v}</div>
                <div className="text-[10px] text-muted-foreground/40 mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-[360px]">
          <div className="lg:hidden flex items-center justify-center gap-2 mb-10">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">G</span>
            </div>
            <span className="font-heading font-bold text-xl tracking-tight">GAEO</span>
          </div>

          <h1 className="text-xl font-heading font-bold mb-1">Create your account</h1>
          <p className="text-muted-foreground text-sm mb-8">Start optimizing for AI discovery</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Full name</label>
              <input type="text" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="input-field" placeholder="Jane Smith" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" placeholder="you@company.com" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field pr-10" placeholder="Min. 8 characters" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5 text-sm">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Create account <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-muted-foreground">By creating an account, you agree to our Terms and Privacy Policy.</p>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/auth/login" className="text-primary hover:underline font-medium">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

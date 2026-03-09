import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const demoUser = { full_name: "Demo User", email };
      localStorage.setItem("access_token", "demo-token");
      localStorage.setItem("user", JSON.stringify(demoUser));
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch {
      toast.error("Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left branding */}
      <div className="hidden lg:flex lg:w-[45%] relative items-center justify-center border-r border-border bg-card/30">
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="max-w-[340px] px-12">
          <div className="flex items-center gap-2 mb-10">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">G</span>
            </div>
            <span className="font-heading font-bold text-xl tracking-tight">GAEO</span>
          </div>
          <h2 className="text-[1.75rem] font-heading font-bold tracking-tight mb-3 leading-tight">
            Make AI<br /><span className="text-primary">recommend you.</span>
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Measure, monitor, and maximize your brand's visibility across every AI answer engine.
          </p>
          <div className="mt-12 flex items-center gap-6">
            {["Claude", "ChatGPT", "Gemini"].map((name) => (
              <span key={name} className="text-xs text-muted-foreground/25 font-medium">{name}</span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-[360px]">
          <div className="lg:hidden flex items-center justify-center gap-2 mb-10">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">G</span>
            </div>
            <span className="font-heading font-bold text-xl tracking-tight">GAEO</span>
          </div>

          <h1 className="text-xl font-heading font-bold mb-1">Welcome back</h1>
          <p className="text-muted-foreground text-sm mb-8">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="you@company.com" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pr-10" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5 text-sm">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Sign in <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/auth/register" className="text-primary hover:underline font-medium">Create one</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

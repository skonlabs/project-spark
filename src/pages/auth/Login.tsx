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
    <div className="min-h-screen flex bg-background relative overflow-hidden">
      {/* Left — branding panel */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center bg-mesh">
        <div className="absolute inset-0 bg-dot-grid opacity-20" />
        <div className="absolute top-1/4 left-1/3 w-72 h-72 rounded-full bg-violet-600/15 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-60 h-60 rounded-full bg-blue-500/10 blur-[80px]" />
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="relative max-w-md px-12"
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-white font-black text-sm">G</span>
            </div>
            <span className="font-black text-2xl tracking-tight" style={{ fontFamily: "'Space Grotesk'" }}>GAEO</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight mb-4 leading-tight" style={{ fontFamily: "'Space Grotesk'" }}>
            Make AI
            <br />
            <span className="gradient-text">recommend you.</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Measure, monitor, and maximize your brand's visibility across every AI answer engine.
          </p>
          <div className="mt-12 flex items-center gap-6">
            {["Claude", "ChatGPT", "Gemini"].map((name) => (
              <span key={name} className="text-xs text-muted-foreground/40 font-semibold tracking-wide">{name}</span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-10">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-black text-sm">G</span>
            </div>
            <span className="font-black text-2xl tracking-tight" style={{ fontFamily: "'Space Grotesk'" }}>GAEO</span>
          </div>

          <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "'Space Grotesk'" }}>Welcome back</h1>
          <p className="text-muted-foreground text-sm mb-8">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="you@company.com" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Password</label>
              <div className="relative">
                <input id="password" type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pr-10" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-sm font-bold">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Sign in
              <ArrowRight className="h-4 w-4" />
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

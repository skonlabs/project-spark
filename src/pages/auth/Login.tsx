import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Brain, Eye, EyeOff, Loader2 } from "lucide-react";
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
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
      {/* Background effects */}
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
          <h1 className="text-2xl font-bold text-center mb-1.5 tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground text-center text-sm mb-7">Sign in to your GAEO account</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium mb-2 block" htmlFor="email">Email</label>
              <input
                id="email" type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-input bg-background/80 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password" type={showPassword ? "text" : "password"} required value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background/80 px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Sign in
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/auth/register" className="text-primary hover:underline font-medium">Create one</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

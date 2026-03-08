import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, Brain, Globe, LineChart, Search, Shield, Zap } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { icon: BarChart3, title: "AI Visibility Score", description: "A composite 0-100 score measuring how likely your brand is to appear in LLM-generated answers. Track it over time.", color: "text-blue-400", bg: "bg-blue-500/10" },
  { icon: Brain, title: "LLM Simulation Engine", description: "Test exactly how Claude, ChatGPT, Gemini, and Grok respond to queries about your category. See your ranking position.", color: "text-purple-400", bg: "bg-purple-500/10" },
  { icon: Search, title: "Content Gap Analysis", description: "Identify which topics, questions, and prompts your content doesn't cover — before your competitors do.", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { icon: Globe, title: "Competitive Intelligence", description: "Measure your LLM share of voice against competitors. Know exactly where you rank vs. the competition.", color: "text-orange-400", bg: "bg-orange-500/10" },
  { icon: LineChart, title: "AI Answer Monitoring", description: "Continuously monitor AI answers with automated alerts when your visibility changes or competitors surge.", color: "text-cyan-400", bg: "bg-cyan-500/10" },
  { icon: Zap, title: "AI Content Generation", description: "Generate AEO-optimized articles, FAQs, comparisons, and entity definitions that LLMs actually cite.", color: "text-yellow-400", bg: "bg-yellow-500/10" },
];

const stats = [
  { label: "LLM Models Supported", value: "7+" },
  { label: "Content Sources", value: "15+" },
  { label: "Optimization Signals", value: "10" },
  { label: "Content Types Generated", value: "6" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Ambient background effects */}
      <div className="fixed inset-0 bg-radial-glow pointer-events-none" />
      <div className="fixed inset-0 bg-grid opacity-30 pointer-events-none" />

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 z-50 w-full glass"
      >
        <div className="container mx-auto flex h-16 items-center px-6">
          <div className="flex items-center gap-2.5 mr-auto">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-primary/20">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-extrabold text-lg tracking-tight">GAEO</span>
            <span className="hidden sm:inline text-muted-foreground text-xs ml-1 font-medium tracking-wide uppercase">AI Engine Optimization</span>
          </div>
          <nav className="flex items-center gap-3 ml-auto">
            <Link to="/auth/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2">Sign In</Link>
            <Link to="/auth/register" className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30">
              Get Started <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </nav>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="container mx-auto px-6 pt-36 pb-24 text-center relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs text-primary mb-10 backdrop-blur-sm"
        >
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
          The industry standard for AI discovery optimization
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-8 leading-[1.05]"
        >
          Your brand in every{" "}
          <span className="gradient-text-glow">AI answer</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          GAEO is the platform for Generative AI Engine Optimization — measure, monitor, and maximize your visibility in ChatGPT, Claude, Gemini, Grok, and every AI answer engine.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/auth/register" className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-3.5 text-base font-bold text-white hover:opacity-90 transition-all shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-0.5">
            Start for free <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link to="/auth/login" className="inline-flex items-center gap-2 rounded-xl border border-border/80 px-8 py-3.5 text-base font-semibold hover:bg-accent/50 transition-all backdrop-blur-sm">
            View demo
          </Link>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="grid grid-cols-2 sm:grid-cols-4 gap-8 mt-24 max-w-3xl mx-auto"
        >
          {stats.map((stat, i) => (
            <motion.div key={stat.label} variants={fadeUp} custom={i} className="text-center">
              <div className="text-4xl font-black text-foreground tracking-tight">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1.5 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Score visualization */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
        className="container mx-auto px-6 py-16"
      >
        <div className="rounded-3xl border border-border/60 bg-card/80 p-8 sm:p-10 max-w-4xl mx-auto backdrop-blur-sm gradient-border glow-blue">
          <div className="flex flex-col lg:flex-row items-center gap-10">
            <div className="relative flex-shrink-0">
              <svg viewBox="0 0 200 200" className="w-52 h-52">
                <circle cx="100" cy="100" r="85" fill="none" stroke="hsl(217.2 20% 16%)" strokeWidth="14" />
                <motion.circle
                  cx="100" cy="100" r="85" fill="none" stroke="hsl(217.2 91.2% 59.8%)" strokeWidth="14" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 85}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 85 }}
                  whileInView={{ strokeDashoffset: 2 * Math.PI * 85 * (1 - 0.42) }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                  transform="rotate(-90 100 100)"
                  style={{ filter: "drop-shadow(0 0 6px hsl(217.2 91.2% 59.8% / 0.5))" }}
                />
                <text x="100" y="95" textAnchor="middle" className="fill-foreground" fontSize="40" fontWeight="800">42</text>
                <text x="100" y="120" textAnchor="middle" fill="hsl(215 20.2% 55%)" fontSize="13" fontWeight="500">out of 100</text>
              </svg>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-orange-500/15 border border-orange-500/20 px-4 py-1.5 text-xs text-orange-400 font-semibold backdrop-blur-sm">
                Grade D — Needs Work
              </div>
            </div>
            <div className="flex-1 space-y-3.5 w-full">
              {[
                { label: "Entity Clarity", score: 65 },
                { label: "Prompt Coverage", score: 28 },
                { label: "Educational Authority", score: 45 },
                { label: "Comparison Coverage", score: 15 },
                { label: "Ecosystem Coverage", score: 38 },
                { label: "External Authority", score: 52 },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + i * 0.08, duration: 0.5 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-sm text-muted-foreground w-44 flex-shrink-0 font-medium">{item.label}</span>
                  <div className="flex-1 h-2 rounded-full bg-muted/60 overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${item.score >= 60 ? "bg-emerald-500" : item.score >= 40 ? "bg-yellow-500" : "bg-red-500"}`}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.score}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.6 + i * 0.08, duration: 0.8, ease: "easeOut" }}
                      style={{
                        boxShadow: item.score >= 60
                          ? "0 0 8px rgb(16 185 129 / 0.4)"
                          : item.score >= 40
                          ? "0 0 8px rgb(234 179 8 / 0.4)"
                          : "0 0 8px rgb(239 68 68 / 0.4)",
                      }}
                    />
                  </div>
                  <span className="text-sm font-bold w-8 text-right tabular-nums">{item.score}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Features */}
      <section className="container mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-black mb-4 tracking-tight">Everything you need for AI visibility</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From content analysis to competitive intelligence, GAEO gives you every tool to dominate AI-generated answers.
          </p>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                custom={i}
                className="rounded-2xl border border-border/60 bg-card/80 p-6 card-hover backdrop-blur-sm group"
              >
                <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${feature.bg} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`h-5 w-5 ${feature.color}`} />
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* CTA */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="container mx-auto px-6 py-24"
      >
        <div className="rounded-3xl bg-gradient-to-br from-blue-600/15 via-purple-600/10 to-cyan-500/5 border border-primary/20 p-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="relative">
            <Shield className="h-12 w-12 text-primary mx-auto mb-6 animate-float" />
            <h2 className="text-3xl sm:text-4xl font-black mb-5 tracking-tight">Own your position in the AI era</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10">
              Companies that invest in AI Engine Optimization today will dominate AI-generated answers for years to come.
            </p>
            <Link to="/auth/register" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-10 py-4 text-base font-bold text-white hover:opacity-90 transition-all shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30">
              Start optimizing for free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="border-t border-border/60 py-10">
        <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold">GAEO Platform</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 GAEO. Built for the AI era.</p>
        </div>
      </footer>
    </div>
  );
}

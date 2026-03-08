import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, Brain, Globe, LineChart, Search, Shield, Sparkles, Zap } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const features = [
  { icon: BarChart3, title: "AI Visibility Score", description: "A composite 0–100 score measuring how likely your brand is to appear in LLM-generated answers.", color: "from-blue-500 to-cyan-400" },
  { icon: Brain, title: "LLM Simulation Engine", description: "Test how Claude, ChatGPT, Gemini, and Grok respond to queries about your category.", color: "from-violet-500 to-purple-400" },
  { icon: Search, title: "Content Gap Analysis", description: "Identify which topics, questions, and prompts your content doesn't cover yet.", color: "from-emerald-500 to-green-400" },
  { icon: Globe, title: "Competitive Intelligence", description: "Measure your LLM share of voice against competitors in real time.", color: "from-orange-500 to-amber-400" },
  { icon: LineChart, title: "AI Answer Monitoring", description: "Continuously monitor AI answers with automated alerts when visibility changes.", color: "from-rose-500 to-pink-400" },
  { icon: Zap, title: "AI Content Generation", description: "Generate AEO-optimized content that LLMs actually cite and recommend.", color: "from-yellow-500 to-orange-400" },
];

const logos = ["Claude", "ChatGPT", "Gemini", "Grok", "Perplexity", "Copilot"];

export default function Landing() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Ambient mesh */}
      <div className="fixed inset-0 bg-mesh pointer-events-none" />

      {/* Navbar */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 z-50 w-full"
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="mt-4 flex h-14 items-center justify-between rounded-2xl glass px-5">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-black text-xs">G</span>
              </div>
              <span className="font-bold text-lg tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>GAEO</span>
            </div>
            <nav className="flex items-center gap-2">
              <Link to="/auth/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-xl hover:bg-accent/50">Log in</Link>
              <Link to="/auth/register" className="btn-primary text-xs px-4 py-2">
                Get Started <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </nav>
          </div>
        </div>
      </motion.header>

      {/* Hero */}
      <section ref={heroRef} className="relative pt-32 pb-20 overflow-hidden">
        {/* Animated orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-violet-600/10 blur-[120px] animate-float" />
        <div className="absolute top-40 right-1/4 w-80 h-80 rounded-full bg-blue-500/8 blur-[100px] animate-float" style={{ animationDelay: '2s' }} />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="container mx-auto px-6 text-center relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs text-primary mb-8 backdrop-blur-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
            The AI Engine Optimization Platform
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter mb-6 leading-[0.95]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Make AI
            <br />
            <span className="gradient-text-glow">recommend you</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="text-lg text-muted-foreground max-w-lg mx-auto mb-10 leading-relaxed"
          >
            Measure, monitor, and maximize your visibility in every AI answer engine — from ChatGPT to Claude to Gemini.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link to="/auth/register" className="btn-primary px-8 py-3.5 text-base font-bold group">
              Start for free <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/auth/login" className="inline-flex items-center gap-2 rounded-xl border border-border/80 px-8 py-3.5 text-sm font-semibold hover:bg-accent/50 transition-all backdrop-blur-sm">
              View demo
            </Link>
          </motion.div>

          {/* LLM logos ticker */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="mt-20 flex items-center justify-center gap-8 flex-wrap"
          >
            <span className="text-xs text-muted-foreground/60 uppercase tracking-widest font-medium">Optimized for</span>
            {logos.map((name) => (
              <span key={name} className="text-sm text-muted-foreground/50 font-semibold tracking-wide">{name}</span>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Score visualization — the hero demo */}
      <motion.section
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8 }}
        className="container mx-auto px-6 pb-32"
      >
        <div className="max-w-4xl mx-auto rounded-3xl border border-border/40 bg-card/60 p-1 backdrop-blur-sm glow-primary">
          <div className="rounded-[20px] bg-background/80 p-8 sm:p-10">
            <div className="flex items-center gap-2 mb-8">
              <div className="h-3 w-3 rounded-full bg-red-500/60" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
              <div className="h-3 w-3 rounded-full bg-green-500/60" />
              <span className="text-xs text-muted-foreground/50 ml-2 font-mono">gaeo.ai/dashboard</span>
            </div>
            <div className="flex flex-col lg:flex-row items-center gap-10">
              <div className="relative flex-shrink-0">
                <svg viewBox="0 0 200 200" className="w-44 h-44">
                  <circle cx="100" cy="100" r="82" fill="none" stroke="hsl(var(--border))" strokeWidth="12" />
                  <motion.circle
                    cx="100" cy="100" r="82" fill="none" stroke="url(#scoreGrad)" strokeWidth="12" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 82}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 82 }}
                    whileInView={{ strokeDashoffset: 2 * Math.PI * 82 * (1 - 0.42) }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.8, ease: "easeOut", delay: 0.3 }}
                    transform="rotate(-90 100 100)"
                  />
                  <defs>
                    <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="hsl(250 89% 67%)" />
                      <stop offset="100%" stopColor="hsl(280 80% 60%)" />
                    </linearGradient>
                  </defs>
                  <text x="100" y="92" textAnchor="middle" className="fill-foreground" fontSize="44" fontWeight="800" style={{ fontFamily: "'Space Grotesk'" }}>42</text>
                  <text x="100" y="118" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="12" fontWeight="500">out of 100</text>
                </svg>
              </div>
              <div className="flex-1 space-y-3 w-full">
                {[
                  { label: "Entity Clarity", score: 65 },
                  { label: "Prompt Coverage", score: 28 },
                  { label: "Educational Authority", score: 45 },
                  { label: "Comparison Coverage", score: 15 },
                  { label: "Ecosystem Coverage", score: 38 },
                  { label: "External Authority", score: 52 },
                ].map((item, i) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-40 flex-shrink-0 font-medium">{item.label}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-border/60 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background: item.score >= 60 ? 'hsl(160 84% 39%)' : item.score >= 40 ? 'hsl(45 93% 47%)' : 'hsl(0 84% 60%)',
                          boxShadow: `0 0 8px ${item.score >= 60 ? 'hsl(160 84% 39% / 0.4)' : item.score >= 40 ? 'hsl(45 93% 47% / 0.4)' : 'hsl(0 84% 60% / 0.4)'}`,
                        }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.score}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + i * 0.08, duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                    <span className="text-xs font-bold w-7 text-right tabular-nums">{item.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Features — Bento grid */}
      <section className="container mx-auto px-6 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4" style={{ fontFamily: "'Space Grotesk'" }}>
            Everything you need to<br /><span className="gradient-text">dominate AI answers</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            From content analysis to competitive intelligence — one platform.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="bento-card group"
              >
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold text-base mb-1.5" style={{ fontFamily: "'Space Grotesk'" }}>{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Stats band */}
      <section className="border-y border-border/40 py-16 bg-card/30">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-3xl mx-auto text-center">
            {[
              { label: "LLM Models", value: "7+" },
              { label: "Content Sources", value: "15+" },
              { label: "Optimization Signals", value: "10" },
              { label: "Content Types", value: "6" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-4xl font-black tracking-tight gradient-text" style={{ fontFamily: "'Space Grotesk'" }}>{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1.5 font-medium uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="container mx-auto px-6 py-32"
      >
        <div className="max-w-3xl mx-auto rounded-3xl border border-primary/15 p-16 text-center relative overflow-hidden gradient-border">
          <div className="absolute inset-0 bg-dot-grid opacity-30" />
          <div className="relative">
            <Sparkles className="h-10 w-10 text-primary mx-auto mb-6 animate-float" />
            <h2 className="text-3xl sm:text-4xl font-black mb-4 tracking-tight" style={{ fontFamily: "'Space Grotesk'" }}>
              Own your position in the AI era
            </h2>
            <p className="text-muted-foreground text-lg max-w-md mx-auto mb-8">
              Companies that invest in AI Engine Optimization today will dominate for years.
            </p>
            <Link to="/auth/register" className="btn-primary px-10 py-4 text-base font-bold">
              Start optimizing for free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-10">
        <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-black text-[9px]">G</span>
            </div>
            <span className="text-sm font-bold">GAEO</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 GAEO. Built for the AI era.</p>
        </div>
      </footer>
    </div>
  );
}

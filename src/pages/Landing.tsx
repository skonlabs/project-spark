import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, Brain, Check, Globe, LineChart, Search, Shield, Sparkles, Zap, ArrowUpRight, Play } from "lucide-react";
import { motion } from "framer-motion";

const fade = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5 },
};

const features = [
  { icon: BarChart3, title: "AI Visibility Score", description: "Composite 0–100 score measuring how likely AI engines cite your content in generated answers." },
  { icon: Brain, title: "LLM Simulation Engine", description: "Test real queries across Claude, ChatGPT, Gemini, and Grok. See exactly where you rank." },
  { icon: Search, title: "Content Gap Analysis", description: "Discover which topics, questions, and prompts your content doesn't cover yet." },
  { icon: Globe, title: "Competitive Intelligence", description: "Track your share of voice against competitors across every major AI model." },
  { icon: LineChart, title: "AI Answer Monitoring", description: "Continuous monitoring with automated alerts when your AI visibility changes." },
  { icon: Zap, title: "Content Generation", description: "Generate AI-optimized articles, FAQs, and comparisons that LLMs actually cite." },
];

const steps = [
  { num: "01", title: "Connect your content", desc: "Import from your website, CMS, documentation, or Git repo. We support 15+ sources." },
  { num: "02", title: "Analyze for AI readability", desc: "We score each piece across 10 dimensions that determine LLM citation likelihood." },
  { num: "03", title: "Get actionable recommendations", desc: "Each insight explains what the issue is, why it matters for AI, and exactly how to fix it." },
  { num: "04", title: "Optimize and publish", desc: "Generate AI-compliant content and publish directly to your CMS or docs platform." },
];

const scoreDimensions = [
  { label: "Entity Clarity", score: 65 },
  { label: "Prompt Coverage", score: 28 },
  { label: "Educational Authority", score: 45 },
  { label: "Comparison Coverage", score: 15 },
  { label: "Ecosystem Coverage", score: 38 },
  { label: "External Authority", score: 52 },
];

const pricing = [
  { name: "Starter", price: "Free", description: "For individuals exploring AI visibility.", features: ["3 content items", "Basic AI analysis", "1 project", "Community support"], cta: "Get started" },
  { name: "Pro", price: "$99", period: "/mo", description: "For teams optimizing their AI presence.", features: ["Unlimited content", "Full analysis & generation", "5 projects", "LLM simulation engine", "Competitive intelligence", "CMS integrations", "Priority support"], cta: "Start free trial", featured: true },
  { name: "Enterprise", price: "Custom", description: "For organizations at scale.", features: ["Unlimited everything", "SSO & advanced roles", "Custom integrations", "Dedicated support", "API access", "SLA guarantee"], cta: "Contact sales" },
];

const logos = ["Claude", "ChatGPT", "Gemini", "Grok", "Perplexity", "Copilot"];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ─── Navbar ───────────────────────────────────────── */}
      <header className="sticky top-0 z-50 glass">
        <div className="mx-auto max-w-[1200px] px-6 flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-[10px]">G</span>
            </div>
            <span className="font-heading font-bold text-sm tracking-tight">GAEO</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/auth/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:inline">Log in</Link>
            <Link to="/auth/register" className="btn-primary text-xs px-4 py-2">
              Get Started <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero ─────────────────────────────────────────── */}
      <section className="relative pt-20 pb-4 px-6 overflow-hidden">
        {/* Subtle radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] opacity-[0.07] pointer-events-none" style={{ background: "radial-gradient(ellipse, hsl(32 95% 55%), transparent 70%)" }} />

        <div className="mx-auto max-w-[1200px] relative">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-[640px]">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              AI Engine Optimization Platform
            </div>

            <h1 className="text-[2.75rem] sm:text-5xl lg:text-[3.5rem] font-heading font-extrabold tracking-tight leading-[1.08] mb-5">
              Make your content{" "}
              <span className="gradient-text">discoverable by AI.</span>
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-[520px]">
              Optimize your content for ChatGPT, Claude, Gemini, and AI search engines. The Google Search Console for AI.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/auth/register" className="btn-primary px-6 py-3 text-sm">
                Start for free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/auth/login" className="btn-secondary px-6 py-3 text-sm justify-center">
                <Play className="h-3.5 w-3.5" /> Watch demo
              </Link>
            </div>
          </motion.div>

          {/* Logo strip */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.6 }} className="mt-16 flex items-center gap-8 flex-wrap">
            <span className="text-[10px] text-muted-foreground/40 uppercase tracking-[0.15em] font-semibold">Optimized for</span>
            {logos.map((name) => (
              <span key={name} className="text-sm text-muted-foreground/30 font-medium tracking-tight">{name}</span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Score Demo ───────────────────────────────────── */}
      <section className="py-16 px-6">
        <motion.div {...fade} className="mx-auto max-w-[920px]">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary/30">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-destructive/40" />
                <div className="h-2.5 w-2.5 rounded-full bg-warning/40" />
                <div className="h-2.5 w-2.5 rounded-full bg-success/40" />
              </div>
              <div className="ml-3 flex-1 rounded-md bg-background/50 border border-border/50 px-3 py-1 text-[11px] text-muted-foreground font-mono">
                gaeo.ai/dashboard
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex flex-col lg:flex-row items-center gap-10">
                {/* Score ring */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <svg viewBox="0 0 160 160" className="w-40 h-40">
                      <circle cx="80" cy="80" r="64" fill="none" stroke="hsl(var(--border))" strokeWidth="10" />
                      <motion.circle
                        cx="80" cy="80" r="64" fill="none" stroke="hsl(var(--primary))" strokeWidth="10" strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 64}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 64 }}
                        whileInView={{ strokeDashoffset: 2 * Math.PI * 64 * (1 - 0.42) }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                        transform="rotate(-90 80 80)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-heading font-extrabold tabular-nums">42</span>
                      <span className="text-xs text-muted-foreground">out of 100</span>
                    </div>
                  </div>
                </div>

                {/* Score bars */}
                <div className="flex-1 space-y-3 w-full">
                  <p className="text-xs text-muted-foreground font-medium mb-4">Score Breakdown</p>
                  {scoreDimensions.map((item, i) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-[140px] flex-shrink-0 truncate">{item.label}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-border/60 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: item.score >= 50 ? "hsl(var(--primary))" : item.score >= 30 ? "hsl(var(--warning))" : "hsl(var(--error))" }}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${item.score}%` }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.4 + i * 0.07, duration: 0.8, ease: "easeOut" }}
                        />
                      </div>
                      <span className="text-xs font-mono font-semibold w-6 text-right tabular-nums text-muted-foreground">{item.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── Problem Statement ────────────────────────────── */}
      <section className="py-20 px-6 border-y border-border">
        <motion.div {...fade} className="mx-auto max-w-[680px] text-center">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight mb-5">
            AI engines are the new search engines
          </h2>
          <p className="text-muted-foreground leading-relaxed text-[15px]">
            Over 40% of product research now starts with an AI assistant. When someone asks
            <span className="text-foreground font-medium"> "what is the best tool for X?"</span>, the AI's answer shapes buying decisions. If your content isn't structured for LLMs, you're invisible to a growing segment of buyers.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-4 text-[15px]">
            GAEO analyzes how AI models parse, understand, and cite your content — then tells you exactly what to fix.
          </p>
        </motion.div>
      </section>

      {/* ─── Features ─────────────────────────────────────── */}
      <section id="features" className="py-20 px-6">
        <div className="mx-auto max-w-[1200px]">
          <motion.div {...fade} className="mb-14">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight mb-3">
              Everything you need to own AI answers
            </h2>
            <p className="text-muted-foreground max-w-md text-[15px]">
              From content analysis to competitive intelligence — one platform for AI Engine Optimization.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}
                  className="bento-card group"
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold text-[15px] mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── How it Works ─────────────────────────────────── */}
      <section id="how-it-works" className="py-20 px-6 border-y border-border bg-card/30">
        <div className="mx-auto max-w-[1200px]">
          <motion.div {...fade} className="mb-14">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight mb-3">How it works</h2>
            <p className="text-muted-foreground max-w-md text-[15px]">Four steps to AI-optimized content that gets cited.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((item, i) => (
              <motion.div key={item.num} {...fade} transition={{ delay: i * 0.1, duration: 0.4 }}>
                <span className="text-xs font-mono text-primary font-bold">{item.num}</span>
                <h3 className="font-heading font-semibold text-[15px] mt-3 mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── LLM Compatibility ────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-[700px] text-center">
          <motion.div {...fade}>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight mb-4">Works with every major LLM</h2>
            <p className="text-muted-foreground mb-10 text-[15px]">Evaluate and optimize your content across all leading AI models.</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {logos.map((name, i) => (
                <motion.div key={name} {...fade} transition={{ delay: i * 0.05 }}
                  className="rounded-lg border border-border bg-card/50 p-4 text-center hover:border-primary/20 transition-colors"
                >
                  <span className="text-xs font-medium text-muted-foreground">{name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Stats ────────────────────────────────────────── */}
      <section className="py-16 px-6 border-y border-border bg-card/30">
        <div className="mx-auto max-w-[800px]">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[
              { value: "7+", label: "LLM Models" },
              { value: "15+", label: "Content Sources" },
              { value: "10", label: "Optimization Signals" },
              { value: "6", label: "Publishing Targets" },
            ].map((stat, i) => (
              <motion.div key={stat.label} {...fade} transition={{ delay: i * 0.06 }}>
                <div className="text-3xl font-heading font-extrabold tracking-tight">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1.5">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ──────────────────────────────────────── */}
      <section id="pricing" className="py-20 px-6">
        <div className="mx-auto max-w-[1200px]">
          <motion.div {...fade} className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight mb-3">Simple, transparent pricing</h2>
            <p className="text-muted-foreground text-[15px]">Start free. Scale as your AI visibility grows.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-[920px] mx-auto">
            {pricing.map((plan, i) => (
              <motion.div key={plan.name} {...fade} transition={{ delay: i * 0.08 }}
                className={`rounded-xl border p-6 flex flex-col ${plan.featured ? "border-primary/40 bg-primary/[0.03] ring-1 ring-primary/10" : "border-border bg-card"}`}
              >
                {plan.featured && (
                  <div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3">Most Popular</div>
                )}
                <h3 className="font-heading font-semibold">{plan.name}</h3>
                <div className="mt-3 mb-1">
                  <span className="text-3xl font-heading font-extrabold">{plan.price}</span>
                  {plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
                </div>
                <p className="text-xs text-muted-foreground mb-6">{plan.description}</p>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/auth/register"
                  className={`w-full inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                    plan.featured ? "btn-primary justify-center" : "border border-border hover:bg-accent text-foreground"
                  }`}
                >
                  {plan.cta} {plan.featured && <ArrowRight className="h-3.5 w-3.5 ml-1" />}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ────────────────────────────────────── */}
      <section className="py-20 px-6 border-t border-border">
        <motion.div {...fade} className="mx-auto max-w-[560px] text-center">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight mb-4">
            Own your position in the AI era
          </h2>
          <p className="text-muted-foreground mb-8 text-[15px]">
            Companies investing in AI Engine Optimization today will dominate AI-generated answers for years to come.
          </p>
          <Link to="/auth/register" className="btn-primary px-8 py-3 text-sm">
            Start optimizing for free <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </section>

      {/* ─── Footer ───────────────────────────────────────── */}
      <footer className="border-t border-border py-8 px-6">
        <div className="mx-auto max-w-[1200px] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-[9px]">G</span>
            </div>
            <span className="font-heading font-bold text-sm">GAEO</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Documentation</a>
            <a href="#" className="hover:text-foreground transition-colors">Changelog</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
          </div>
          <p className="text-xs text-muted-foreground/50">© 2026 GAEO</p>
        </div>
      </footer>
    </div>
  );
}

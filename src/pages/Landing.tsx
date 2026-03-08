import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, Brain, Check, Globe, LineChart, Search, Shield, Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useRef } from "react";

const features = [
  { icon: BarChart3, title: "AI Visibility Score", description: "A composite 0–100 score measuring how likely your brand appears in LLM-generated answers." },
  { icon: Brain, title: "LLM Simulation Engine", description: "Test how Claude, ChatGPT, Gemini, and Grok respond to queries about your category." },
  { icon: Search, title: "Content Gap Analysis", description: "Identify which topics, questions, and prompts your content doesn't cover yet." },
  { icon: Globe, title: "Competitive Intelligence", description: "Measure your LLM share of voice against competitors in real time." },
  { icon: LineChart, title: "AI Answer Monitoring", description: "Continuously monitor AI answers with automated alerts when visibility changes." },
  { icon: Zap, title: "AI Content Generation", description: "Generate AEO-optimized content that LLMs actually cite and recommend." },
];

const howItWorks = [
  { step: "01", title: "Connect your content", description: "Import from your website, CMS, or documentation. We support 15+ content sources." },
  { step: "02", title: "Analyze for AI readability", description: "We score your content across 10 dimensions that determine LLM citation likelihood." },
  { step: "03", title: "Get actionable recommendations", description: "Each insight explains what the issue is, why it matters, and exactly how to fix it." },
  { step: "04", title: "Optimize and publish", description: "Generate AI-compliant content and publish directly to your CMS." },
];

const logos = ["Claude", "ChatGPT", "Gemini", "Grok", "Perplexity", "Copilot"];

const pricing = [
  { name: "Starter", price: "Free", description: "For individuals exploring AI visibility", features: ["3 content items", "Basic AI analysis", "1 project", "Community support"], cta: "Get started" },
  { name: "Pro", price: "$99", period: "/mo", description: "For teams optimizing their AI presence", features: ["Unlimited content", "Full analysis & generation", "5 projects", "LLM simulation engine", "Competitive intelligence", "CMS integrations"], cta: "Start free trial", featured: true },
  { name: "Enterprise", price: "Custom", description: "For organizations at scale", features: ["Unlimited everything", "SSO & advanced roles", "Custom integrations", "Dedicated support", "API access", "SLA guarantee"], cta: "Contact sales" },
];

const fade = { initial: { opacity: 0, y: 16 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-60px" } };

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-[1200px] px-6 flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">G</span>
            </div>
            <span className="font-heading font-bold text-base tracking-tight">GAEO</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/auth/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Log in</Link>
            <Link to="/auth/register" className="btn-primary text-xs px-3.5 py-2">
              Get Started <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-24 pb-16 px-6">
        <div className="mx-auto max-w-[1200px]">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs text-muted-foreground mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              AI Engine Optimization Platform
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold tracking-tight leading-[1.1] mb-5">
              Make your content{" "}
              <span className="gradient-text">discoverable by AI</span>
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
              Optimize your content for ChatGPT, Claude, Gemini, and AI search engines. The Google Search Console for AI.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/auth/register" className="btn-primary px-6 py-3 text-sm font-semibold">
                Start for free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/auth/login" className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                View demo
              </Link>
            </div>

            <div className="mt-12 flex items-center gap-6 flex-wrap">
              <span className="text-xs text-muted-foreground/50 uppercase tracking-widest font-medium">Optimized for</span>
              {logos.map((name) => (
                <span key={name} className="text-sm text-muted-foreground/40 font-medium">{name}</span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Score Demo */}
      <section className="pb-24 px-6">
        <motion.div {...fade} transition={{ duration: 0.6 }} className="mx-auto max-w-[900px]">
          <div className="rounded-lg border border-border bg-card p-1">
            <div className="rounded-md bg-background p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-6 text-xs text-muted-foreground">
                <div className="h-2.5 w-2.5 rounded-full bg-destructive/50" />
                <div className="h-2.5 w-2.5 rounded-full bg-warning/50" />
                <div className="h-2.5 w-2.5 rounded-full bg-success/50" />
                <span className="ml-2 font-mono">gaeo.ai/dashboard</span>
              </div>
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="relative flex-shrink-0">
                  <svg viewBox="0 0 160 160" className="w-36 h-36">
                    <circle cx="80" cy="80" r="66" fill="none" stroke="hsl(var(--border))" strokeWidth="10" />
                    <motion.circle
                      cx="80" cy="80" r="66" fill="none" stroke="hsl(var(--primary))" strokeWidth="10" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 66}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 66 }}
                      whileInView={{ strokeDashoffset: 2 * Math.PI * 66 * (1 - 0.42) }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                      transform="rotate(-90 80 80)"
                    />
                    <text x="80" y="74" textAnchor="middle" className="fill-foreground font-heading" fontSize="36" fontWeight="800">42</text>
                    <text x="80" y="96" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="11" fontWeight="500">out of 100</text>
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
                      <span className="text-xs text-muted-foreground w-36 flex-shrink-0">{item.label}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-primary"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${item.score}%` }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.4 + i * 0.06, duration: 0.7, ease: "easeOut" }}
                        />
                      </div>
                      <span className="text-xs font-mono font-medium w-6 text-right tabular-nums text-muted-foreground">{item.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Problem statement */}
      <section className="py-20 px-6 border-y border-border bg-secondary/30">
        <motion.div {...fade} className="mx-auto max-w-[700px] text-center">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight mb-4">
            How AI engines read your content
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Over 40% of product research now starts with an AI assistant. When someone asks "what is the best tool for X?", the AI's answer shapes buying decisions. If your content isn't structured for LLMs, you're invisible to a growing segment of buyers.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-4">
            GAEO analyzes how AI models parse, understand, and cite your content — then tells you exactly what to fix.
          </p>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="mx-auto max-w-[1200px]">
          <motion.div {...fade} className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight mb-3">
              Everything you need to dominate AI answers
            </h2>
            <p className="text-muted-foreground max-w-md">
              From content analysis to competitive intelligence — one platform.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  {...fade}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  className="bento-card group"
                >
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                    <Icon className="h-4.5 w-4.5 text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold text-sm mb-1.5">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-6 border-y border-border bg-secondary/30">
        <div className="mx-auto max-w-[1200px]">
          <motion.div {...fade} className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight mb-3">
              How it works
            </h2>
            <p className="text-muted-foreground max-w-md">
              Four steps to AI-optimized content that gets cited.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((item, i) => (
              <motion.div key={item.step} {...fade} transition={{ delay: i * 0.08, duration: 0.4 }}>
                <span className="text-xs font-mono text-primary font-semibold">{item.step}</span>
                <h3 className="font-heading font-semibold text-sm mt-2 mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* LLM compatibility */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-[700px] text-center">
          <motion.div {...fade}>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight mb-4">
              Works with every major LLM
            </h2>
            <p className="text-muted-foreground mb-10">
              GAEO evaluates and optimizes your content across all leading AI models.
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
              {["Claude", "ChatGPT", "Gemini", "Grok", "Perplexity", "Copilot"].map((name, i) => (
                <motion.div key={name} {...fade} transition={{ delay: i * 0.05 }}
                  className="rounded-lg border border-border bg-card p-3 text-center"
                >
                  <span className="text-xs font-medium text-muted-foreground">{name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-y border-border bg-secondary/30">
        <div className="mx-auto max-w-[800px]">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[
              { label: "LLM Models", value: "7+" },
              { label: "Content Sources", value: "15+" },
              { label: "Optimization Signals", value: "10" },
              { label: "Content Types", value: "6" },
            ].map((stat, i) => (
              <motion.div key={stat.label} {...fade} transition={{ delay: i * 0.06 }}>
                <div className="text-3xl font-heading font-extrabold tracking-tight text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6">
        <div className="mx-auto max-w-[1200px]">
          <motion.div {...fade} className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight mb-3">
              Simple, transparent pricing
            </h2>
            <p className="text-muted-foreground">Start free. Scale as your AI visibility grows.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-[900px] mx-auto">
            {pricing.map((plan, i) => (
              <motion.div key={plan.name} {...fade} transition={{ delay: i * 0.08 }}
                className={`rounded-lg border p-6 ${plan.featured ? "border-primary bg-primary/5" : "border-border bg-card"}`}
              >
                <h3 className="font-heading font-semibold text-sm">{plan.name}</h3>
                <div className="mt-3 mb-1">
                  <span className="text-3xl font-heading font-extrabold">{plan.price}</span>
                  {plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
                </div>
                <p className="text-xs text-muted-foreground mb-5">{plan.description}</p>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/auth/register"
                  className={`w-full inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                    plan.featured ? "bg-primary text-primary-foreground hover:bg-primary/90" : "border border-border hover:bg-secondary text-foreground"
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 border-t border-border">
        <motion.div {...fade} className="mx-auto max-w-[600px] text-center">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight mb-4">
            Own your position in the AI era
          </h2>
          <p className="text-muted-foreground mb-8">
            Companies that invest in AI Engine Optimization today will dominate for years.
          </p>
          <Link to="/auth/register" className="btn-primary px-8 py-3 text-sm font-semibold">
            Start optimizing for free <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="mx-auto max-w-[1200px] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-[9px]">G</span>
            </div>
            <span className="text-sm font-heading font-semibold">GAEO</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 GAEO. Built for the AI era.</p>
        </div>
      </footer>
    </div>
  );
}

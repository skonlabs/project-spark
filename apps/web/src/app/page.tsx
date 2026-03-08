import Link from "next/link";
import { ArrowRight, BarChart3, Brain, Globe, LineChart, Search, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "AI Visibility Score",
    description:
      "A composite 0-100 score measuring how likely your brand is to appear in LLM-generated answers. Track it over time.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: Brain,
    title: "LLM Simulation Engine",
    description:
      "Test exactly how Claude, ChatGPT, Gemini, and Grok respond to queries about your category. See your ranking position.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  {
    icon: Search,
    title: "Content Gap Analysis",
    description:
      "Identify which topics, questions, and prompts your content doesn't cover — before your competitors do.",
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  {
    icon: Globe,
    title: "Competitive Intelligence",
    description:
      "Measure your LLM share of voice against competitors. Know exactly where you rank vs. the competition.",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
  },
  {
    icon: LineChart,
    title: "AI Answer Monitoring",
    description:
      "Continuously monitor AI answers with automated alerts when your visibility changes or competitors surge.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
  },
  {
    icon: Zap,
    title: "AI Content Generation",
    description:
      "Generate AEO-optimized articles, FAQs, comparisons, and entity definitions that LLMs actually cite.",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },
];

const stats = [
  { label: "LLM Models Supported", value: "7+" },
  { label: "Content Sources", value: "15+" },
  { label: "Optimization Signals", value: "10" },
  { label: "Content Types Generated", value: "6" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center px-4">
          <div className="flex items-center gap-2 mr-auto">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">GAEO</span>
            <span className="hidden sm:inline text-muted-foreground text-sm ml-1">
              AI Engine Optimization
            </span>
          </div>
          <nav className="flex items-center gap-4 ml-auto">
            <Link
              href="/auth/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get Started
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 pt-32 pb-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary mb-8">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          The industry standard for AI discovery optimization
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
          Your brand in every{" "}
          <span className="gradient-text">AI answer</span>
        </h1>

        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          GAEO is the platform for Generative AI Engine Optimization — measure,
          monitor, and maximize your visibility in ChatGPT, Claude, Gemini, Grok,
          and every AI answer engine.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
          >
            Start for free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-base font-semibold hover:bg-accent transition-colors"
          >
            View demo
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mt-20 max-w-3xl mx-auto">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Score visualization */}
      <section className="container mx-auto px-4 py-16">
        <div className="rounded-2xl border border-border bg-card p-8 max-w-4xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Score ring */}
            <div className="relative flex-shrink-0">
              <svg viewBox="0 0 200 200" className="w-48 h-48">
                <circle
                  cx="100" cy="100" r="85"
                  fill="none" stroke="hsl(217.2 32.6% 17.5%)" strokeWidth="14"
                />
                <circle
                  cx="100" cy="100" r="85"
                  fill="none" stroke="hsl(217.2 91.2% 59.8%)" strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 85}`}
                  strokeDashoffset={`${2 * Math.PI * 85 * (1 - 0.42)}`}
                  transform="rotate(-90 100 100)"
                />
                <text x="100" y="95" textAnchor="middle" className="fill-foreground" fontSize="36" fontWeight="bold">42</text>
                <text x="100" y="120" textAnchor="middle" fill="hsl(215 20.2% 65.1%)" fontSize="13">out of 100</text>
              </svg>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-orange-500/20 px-3 py-1 text-xs text-orange-400 font-medium">
                Grade D — Needs Work
              </div>
            </div>

            {/* Score breakdown */}
            <div className="flex-1 space-y-3 w-full">
              {[
                { label: "Entity Clarity", score: 65 },
                { label: "Prompt Coverage", score: 28 },
                { label: "Educational Authority", score: 45 },
                { label: "Comparison Coverage", score: 15 },
                { label: "Ecosystem Coverage", score: 38 },
                { label: "External Authority", score: 52 },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-44 flex-shrink-0">
                    {item.label}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        item.score >= 60
                          ? "bg-green-500"
                          : item.score >= 40
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8 text-right">{item.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Everything you need for AI visibility
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From content analysis to competitive intelligence, GAEO gives you
            every tool to dominate AI-generated answers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-xl border border-border bg-card p-6 card-hover"
              >
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${feature.bg} mb-4`}>
                  <Icon className={`h-5 w-5 ${feature.color}`} />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/30 p-12 text-center">
          <Shield className="h-12 w-12 text-primary mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Own your position in the AI era
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
            Companies that invest in AI Engine Optimization today will dominate
            AI-generated answers for years to come.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Start optimizing for free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">GAEO Platform</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 GAEO. Built for the AI era.
          </p>
        </div>
      </footer>
    </div>
  );
}

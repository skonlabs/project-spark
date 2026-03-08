"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  BookOpen,
  Copy,
  Download,
  FileText,
  HelpCircle,
  Loader2,
  Sparkles,
  Swords,
  Zap,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import toast from "react-hot-toast";
import { contentApi } from "@/lib/api";

type ContentType = "article" | "comparison" | "faq" | "entity-definition" | "optimize";

const CONTENT_TYPES = [
  { id: "article", label: "Educational Article", icon: BookOpen, description: "Generate educational content on any topic" },
  { id: "comparison", label: "Comparison Article", icon: Swords, description: "X vs Y comparison articles" },
  { id: "faq", label: "FAQ Page", icon: HelpCircle, description: "Comprehensive FAQ content" },
  { id: "entity-definition", label: "Entity Definition", icon: Sparkles, description: "Optimal product descriptions for LLMs" },
  { id: "optimize", label: "Optimize Existing", icon: Zap, description: "Rewrite content for AEO" },
];

export default function GenerateContentPage() {
  const [activeType, setActiveType] = useState<ContentType>("article");
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);

  // Article form
  const [article, setArticle] = useState({
    topic: "What is AI Observability?",
    product_name: "GAEO Platform",
    product_category: "AI Observability",
    target_audience: "ML engineers and data scientists",
    word_count: 1500,
  });

  // Comparison form
  const [comparison, setComparison] = useState({
    product_name: "GAEO Platform",
    competitor_name: "Competitor X",
    product_category: "AI Observability",
    product_description: "AI Engine Optimization platform",
  });

  // FAQ form
  const [faq, setFaq] = useState({
    product_name: "GAEO Platform",
    product_category: "AI Observability",
    product_description: "The leading AI Engine Optimization platform",
    num_questions: 15,
  });

  // Entity definition form
  const [entityDef, setEntityDef] = useState({
    product_name: "GAEO Platform",
    current_description: "GAEO helps companies optimize their AI visibility",
    product_category: "AI Engine Optimization",
  });

  // Optimize form
  const [optimize, setOptimize] = useState({
    content: "",
    product_name: "GAEO Platform",
    product_category: "AI Engine Optimization",
    target_prompts: [] as string[],
  });

  const articleMutation = useMutation({
    mutationFn: () => contentApi.generateArticle(article),
    onSuccess: ({ data }) => {
      setGeneratedContent(data.content);
      toast.success("Article generated!");
    },
    onError: () => toast.error("Generation failed"),
  });

  const comparisonMutation = useMutation({
    mutationFn: () => contentApi.generateComparison(comparison),
    onSuccess: ({ data }) => {
      setGeneratedContent(data.content);
      toast.success("Comparison article generated!");
    },
    onError: () => toast.error("Generation failed"),
  });

  const faqMutation = useMutation({
    mutationFn: () => contentApi.generateFAQ(faq),
    onSuccess: ({ data }) => {
      const content = data.faqs
        ?.map((f: { question: string; answer: string }) => `## ${f.question}\n\n${f.answer}`)
        .join("\n\n");
      setGeneratedContent(content || "");
      toast.success("FAQ generated!");
    },
    onError: () => toast.error("Generation failed"),
  });

  const entityMutation = useMutation({
    mutationFn: () => contentApi.generateEntityDefinition(entityDef),
    onSuccess: ({ data }) => {
      const content = `# Entity Definitions for ${entityDef.product_name}

## One-Liner
${data.one_liner}

## Short Description
${data.short_description}

## Long Description
${data.long_description}

## Technical Description
${data.technical_description}

## Category Positioning
${data.category_positioning}

## LLM-Optimized Definition
${data.llm_optimized_definition}`;
      setGeneratedContent(content);
      toast.success("Entity definitions generated!");
    },
    onError: () => toast.error("Generation failed"),
  });

  const optimizeMutation = useMutation({
    mutationFn: () => contentApi.optimize(optimize),
    onSuccess: ({ data }) => {
      setGeneratedContent(data.rewritten_content);
      toast.success("Content optimized!");
    },
    onError: () => toast.error("Optimization failed"),
  });

  const isLoading =
    articleMutation.isPending ||
    comparisonMutation.isPending ||
    faqMutation.isPending ||
    entityMutation.isPending ||
    optimizeMutation.isPending;

  function handleGenerate() {
    switch (activeType) {
      case "article": articleMutation.mutate(); break;
      case "comparison": comparisonMutation.mutate(); break;
      case "faq": faqMutation.mutate(); break;
      case "entity-definition": entityMutation.mutate(); break;
      case "optimize": optimizeMutation.mutate(); break;
    }
  }

  function copyContent() {
    if (generatedContent) {
      navigator.clipboard.writeText(generatedContent);
      toast.success("Copied to clipboard!");
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Content Generation</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Generate AI-optimized content that LLMs cite and recommend
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Config */}
        <div className="space-y-4">
          {/* Type selector */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CONTENT_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => { setActiveType(type.id as ContentType); setGeneratedContent(null); }}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center text-xs transition-all ${
                    activeType === type.id
                      ? "border-primary/50 bg-primary/10 text-primary"
                      : "border-border hover:border-primary/30 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{type.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            {activeType === "article" && (
              <>
                <FormField label="Topic" value={article.topic} onChange={(v) => setArticle({ ...article, topic: v })} />
                <FormField label="Product Name" value={article.product_name} onChange={(v) => setArticle({ ...article, product_name: v })} />
                <FormField label="Category" value={article.product_category} onChange={(v) => setArticle({ ...article, product_category: v })} />
                <FormField label="Target Audience" value={article.target_audience} onChange={(v) => setArticle({ ...article, target_audience: v })} />
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Target Word Count</label>
                  <select
                    value={article.word_count}
                    onChange={(e) => setArticle({ ...article, word_count: parseInt(e.target.value) })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    {[800, 1200, 1500, 2000, 2500, 3000].map((v) => (
                      <option key={v} value={v}>{v.toLocaleString()} words</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {activeType === "comparison" && (
              <>
                <FormField label="Your Product" value={comparison.product_name} onChange={(v) => setComparison({ ...comparison, product_name: v })} />
                <FormField label="Competitor" value={comparison.competitor_name} onChange={(v) => setComparison({ ...comparison, competitor_name: v })} />
                <FormField label="Category" value={comparison.product_category} onChange={(v) => setComparison({ ...comparison, product_category: v })} />
                <FormField label="Your Product Description" value={comparison.product_description} onChange={(v) => setComparison({ ...comparison, product_description: v })} textarea />
              </>
            )}

            {activeType === "faq" && (
              <>
                <FormField label="Product Name" value={faq.product_name} onChange={(v) => setFaq({ ...faq, product_name: v })} />
                <FormField label="Category" value={faq.product_category} onChange={(v) => setFaq({ ...faq, product_category: v })} />
                <FormField label="Product Description" value={faq.product_description} onChange={(v) => setFaq({ ...faq, product_description: v })} textarea />
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Number of Questions</label>
                  <select
                    value={faq.num_questions}
                    onChange={(e) => setFaq({ ...faq, num_questions: parseInt(e.target.value) })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  >
                    {[10, 15, 20, 25, 30].map((v) => (
                      <option key={v} value={v}>{v} questions</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {activeType === "entity-definition" && (
              <>
                <FormField label="Product Name" value={entityDef.product_name} onChange={(v) => setEntityDef({ ...entityDef, product_name: v })} />
                <FormField label="Category" value={entityDef.product_category} onChange={(v) => setEntityDef({ ...entityDef, product_category: v })} />
                <FormField label="Current Description" value={entityDef.current_description} onChange={(v) => setEntityDef({ ...entityDef, current_description: v })} textarea />
              </>
            )}

            {activeType === "optimize" && (
              <>
                <FormField label="Product Name" value={optimize.product_name} onChange={(v) => setOptimize({ ...optimize, product_name: v })} />
                <FormField label="Category" value={optimize.product_category} onChange={(v) => setOptimize({ ...optimize, product_category: v })} />
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Existing Content</label>
                  <textarea
                    value={optimize.content}
                    onChange={(e) => setOptimize({ ...optimize, content: e.target.value })}
                    rows={8}
                    placeholder="Paste your existing content here..."
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                  />
                </div>
              </>
            )}

            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output */}
        <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col" style={{ minHeight: "400px" }}>
          <div className="flex items-center justify-between px-5 py-3 border-b border-border">
            <span className="font-medium text-sm">Generated Content</span>
            {generatedContent && (
              <div className="flex items-center gap-2">
                <button
                  onClick={copyContent}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </button>
                <button className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <Download className="h-3.5 w-3.5" />
                  Export
                </button>
              </div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            {generatedContent ? (
              <div className="prose prose-sm prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {generatedContent}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <FileText className="h-12 w-12 text-muted-foreground/20 mb-3" />
                <p className="text-muted-foreground text-sm">
                  Configure your content settings and click Generate to create AI-optimized content.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  textarea = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
}) {
  const className =
    "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring";
  return (
    <div>
      <label className="text-sm font-medium mb-1.5 block">{label}</label>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className={`${className} resize-none`} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={className} />
      )}
    </div>
  );
}

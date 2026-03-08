import { useState } from "react";
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
import toast from "react-hot-toast";

type ContentType = "article" | "comparison" | "faq" | "entity-definition" | "optimize";

const CONTENT_TYPES = [
  { id: "article", label: "Educational Article", icon: BookOpen, description: "Generate educational content on any topic" },
  { id: "comparison", label: "Comparison Article", icon: Swords, description: "X vs Y comparison articles" },
  { id: "faq", label: "FAQ Page", icon: HelpCircle, description: "Comprehensive FAQ content" },
  { id: "entity-definition", label: "Entity Definition", icon: Sparkles, description: "Optimal product descriptions for LLMs" },
  { id: "optimize", label: "Optimize Existing", icon: Zap, description: "Rewrite content for AEO" },
];

function FormField({ label, value, onChange, textarea = false }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean }) {
  const cls = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring";
  return (
    <div>
      <label className="text-sm font-medium mb-1.5 block">{label}</label>
      {textarea ? <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className={`${cls} resize-none`} /> : <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={cls} />}
    </div>
  );
}

export default function GenerateContentPage() {
  const [activeType, setActiveType] = useState<ContentType>("article");
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [article, setArticle] = useState({ topic: "What is AI Observability?", product_name: "GAEO Platform", product_category: "AI Observability", target_audience: "ML engineers and data scientists", word_count: 1500 });
  const [comparison, setComparison] = useState({ product_name: "GAEO Platform", competitor_name: "Competitor X", product_category: "AI Observability", product_description: "AI Engine Optimization platform" });
  const [faq, setFaq] = useState({ product_name: "GAEO Platform", product_category: "AI Observability", product_description: "The leading AI Engine Optimization platform", num_questions: 15 });
  const [entityDef, setEntityDef] = useState({ product_name: "GAEO Platform", current_description: "GAEO helps companies optimize their AI visibility", product_category: "AI Engine Optimization" });
  const [optimize, setOptimize] = useState({ content: "", product_name: "GAEO Platform", product_category: "AI Engine Optimization" });

  function handleGenerate() {
    setIsLoading(true);
    toast.success("Generation started!");
    setTimeout(() => {
      setGeneratedContent("# Sample Generated Content\n\nThis is a demo of the content generation feature. In production, this would call your AI backend to generate real AEO-optimized content.\n\n## Key Points\n\n- AI Engine Optimization is crucial for modern brands\n- LLMs are becoming primary discovery channels\n- Content structure matters for AI citations");
      setIsLoading(false);
    }, 2000);
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
        <p className="text-muted-foreground text-sm mt-0.5">Generate AI-optimized content that LLMs cite and recommend</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CONTENT_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <button key={type.id} onClick={() => { setActiveType(type.id as ContentType); setGeneratedContent(null); }} className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center text-xs transition-all ${activeType === type.id ? "border-primary/50 bg-primary/10 text-primary" : "border-border hover:border-primary/30 text-muted-foreground hover:text-foreground"}`}>
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{type.label}</span>
                </button>
              );
            })}
          </div>

          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            {activeType === "article" && (
              <>
                <FormField label="Topic" value={article.topic} onChange={(v) => setArticle({ ...article, topic: v })} />
                <FormField label="Product Name" value={article.product_name} onChange={(v) => setArticle({ ...article, product_name: v })} />
                <FormField label="Category" value={article.product_category} onChange={(v) => setArticle({ ...article, product_category: v })} />
                <FormField label="Target Audience" value={article.target_audience} onChange={(v) => setArticle({ ...article, target_audience: v })} />
              </>
            )}
            {activeType === "comparison" && (
              <>
                <FormField label="Your Product" value={comparison.product_name} onChange={(v) => setComparison({ ...comparison, product_name: v })} />
                <FormField label="Competitor" value={comparison.competitor_name} onChange={(v) => setComparison({ ...comparison, competitor_name: v })} />
                <FormField label="Category" value={comparison.product_category} onChange={(v) => setComparison({ ...comparison, product_category: v })} />
                <FormField label="Description" value={comparison.product_description} onChange={(v) => setComparison({ ...comparison, product_description: v })} textarea />
              </>
            )}
            {activeType === "faq" && (
              <>
                <FormField label="Product Name" value={faq.product_name} onChange={(v) => setFaq({ ...faq, product_name: v })} />
                <FormField label="Category" value={faq.product_category} onChange={(v) => setFaq({ ...faq, product_category: v })} />
                <FormField label="Description" value={faq.product_description} onChange={(v) => setFaq({ ...faq, product_description: v })} textarea />
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
                  <textarea value={optimize.content} onChange={(e) => setOptimize({ ...optimize, content: e.target.value })} rows={8} placeholder="Paste your existing content here..." className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
                </div>
              </>
            )}

            <button onClick={handleGenerate} disabled={isLoading} className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-2">
              {isLoading ? (<><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>) : (<><Sparkles className="h-4 w-4" /> Generate</>)}
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col" style={{ minHeight: "400px" }}>
          <div className="flex items-center justify-between px-5 py-3 border-b border-border">
            <span className="font-medium text-sm">Generated Content</span>
            {generatedContent && (
              <div className="flex items-center gap-2">
                <button onClick={copyContent} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"><Copy className="h-3.5 w-3.5" /> Copy</button>
                <button className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"><Download className="h-3.5 w-3.5" /> Export</button>
              </div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            {generatedContent ? (
              <div className="prose prose-sm prose-invert max-w-none whitespace-pre-wrap text-sm">{generatedContent}</div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <FileText className="h-12 w-12 text-muted-foreground/20 mb-3" />
                <p className="text-muted-foreground text-sm">Configure your content settings and click Generate to create AI-optimized content.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

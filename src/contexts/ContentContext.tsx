import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import {
  MOCK_PRODUCTS,
  CONTENT_ANALYSIS,
  INITIAL_PROMPT_DATABASE,
  type Product,
  type ContentItem,
  type ContentAnalysis,
  type ContentSourceType,
  type ProductPrompt,
  type LLMIntentType,
} from "@/data/products";

// ─── Helpers ──────────────────────────────────────────────────────────────────

let _nextPromptId = 100;

function generateMockAnalysis(item: ContentItem): ContentAnalysis {
  const score = Math.floor(Math.random() * 30) + 35;
  return {
    score,
    analyzed_at: new Date().toISOString(),
    gaps: [
      {
        id: "g1",
        label: "Missing entity definition",
        description: 'No clear "X is Y" statement found in the introduction.',
        severity: "critical",
        fix: "Add a one-sentence entity definition in the first paragraph.",
      },
      {
        id: "g2",
        label: "No FAQ section",
        description: "FAQ content is cited 3.2× more often by LLMs.",
        severity: "high",
        fix: "Add 5–7 Q&A pairs covering common user questions.",
      },
    ],
    dimension_scores: [
      { label: "Entity Clarity", score: Math.floor(score * 0.8), max: 100 },
      { label: "Structure Quality", score: Math.floor(score * 0.6), max: 100 },
      { label: "Educational Authority", score: Math.floor(score * 0.5), max: 100 },
      { label: "Prompt Coverage", score: Math.floor(score * 0.3), max: 100 },
    ],
    recommendations: [
      { action: `Add a clear entity definition to "${item.title}"`, impact: 9 },
      { action: "Add FAQ section with 5–7 Q&A pairs", impact: 7 },
      { action: "Add comparison table vs. alternatives", impact: 6 },
    ],
  };
}

// ─── Context shape ─────────────────────────────────────────────────────────────

interface ContentContextValue {
  products: Product[];
  getAnalysis: (contentId: string) => ContentAnalysis | null;
  findContent: (contentId: string) => { product: Product; folder: Product["folders"][0]; item: ContentItem } | null;
  addContentItem: (params: {
    productId: string;
    folderId: string;
    title: string;
    url: string;
    source_type: ContentSourceType;
    word_count?: number;
  }) => string;
  updateItemStatus: (contentId: string, status: ContentItem["status"], score?: number) => void;
  addFolder: (productId: string, folderName: string) => string;
  getProductPrompts: (productId: string) => ProductPrompt[];
  addPromptsToProduct: (productId: string, prompts: Omit<ProductPrompt, "id" | "addedAt">[]) => void;
}

const ContentContext = createContext<ContentContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ContentProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() =>
    MOCK_PRODUCTS.map((p) => ({
      ...p,
      folders: p.folders.map((f) => ({ ...f, items: [...f.items] })),
    }))
  );

  // Analysis results: static mock data + dynamically generated results
  const [dynamicAnalysis, setDynamicAnalysis] = useState<Record<string, ContentAnalysis>>({});

  // Prompt database lives in React state so any change triggers re-renders
  const [promptDatabase, setPromptDatabase] = useState<Record<string, ProductPrompt[]>>(
    () => JSON.parse(JSON.stringify(INITIAL_PROMPT_DATABASE)) // deep-clone initial data
  );

  const getAnalysis = useCallback(
    (contentId: string): ContentAnalysis | null =>
      dynamicAnalysis[contentId] ?? CONTENT_ANALYSIS[contentId] ?? null,
    [dynamicAnalysis]
  );

  const findContent = useCallback(
    (contentId: string) => {
      for (const product of products) {
        for (const folder of product.folders) {
          for (const item of folder.items) {
            if (item.id === contentId) return { product, folder, item };
          }
        }
      }
      return null;
    },
    [products]
  );

  const updateItemStatus = useCallback(
    (contentId: string, status: ContentItem["status"], score?: number) => {
      setProducts((prev) => {
        let analyzedItem: ContentItem | null = null;
        const next = prev.map((p) => ({
          ...p,
          folders: p.folders.map((f) => ({
            ...f,
            items: f.items.map((item) => {
              if (item.id !== contentId) return item;
              const updated = { ...item, status, score: score ?? item.score };
              if (status === "analyzed") analyzedItem = updated;
              return updated;
            }),
          })),
        }));
        if (analyzedItem) {
          setDynamicAnalysis((prev) => ({
            ...prev,
            [contentId]: generateMockAnalysis(analyzedItem!),
          }));
        }
        return next;
      });
    },
    []
  );

  const addContentItem = useCallback(
    ({
      productId,
      folderId,
      title,
      url,
      source_type,
      word_count,
    }: {
      productId: string;
      folderId: string;
      title: string;
      url: string;
      source_type: ContentSourceType;
      word_count?: number;
    }): string => {
      const id = `dynamic-${Date.now()}`;
      
      // Generate content immediately
      let rawContent: string;
      if (source_type === "url" && url) {
        try {
          const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
          const domain = parsed.hostname.replace("www.", "");
          const pathParts = parsed.pathname.split("/").filter(Boolean);
          const slug = pathParts[pathParts.length - 1]?.replace(/[-_]/g, " ") || title;
          rawContent = [
            `# ${title}`,
            ``,
            `> Source: [${domain}](${url})`,
            ``,
            `## Overview`,
            ``,
            `This content was ingested from **${domain}** and is being analyzed for AI visibility optimization.`,
            ``,
            `## Page Details`,
            ``,
            `- **URL**: ${url}`,
            `- **Domain**: ${domain}`,
            `- **Path**: ${parsed.pathname || "/"}`,
            ...(pathParts.length > 0 ? [`- **Section**: ${pathParts.map(p => p.replace(/[-_]/g, " ")).join(" → ")}`] : []),
            `- **Ingested**: ${new Date().toLocaleString()}`,
            ``,
            `## Content Summary`,
            ``,
            `The page "${slug}" from ${domain} has been ingested for analysis. The AI visibility score and recommendations will be generated based on the content structure, entity clarity, and prompt coverage.`,
            ``,
            `## Analysis Notes`,
            ``,
            `- Entity definitions need to be verified`,
            `- FAQ section coverage will be evaluated`,
            `- Competitive positioning signals will be extracted`,
            `- Prompt alignment will be scored against known LLM queries`,
          ].join("\n");
        } catch {
          rawContent = `# ${title}\n\nContent from ${url}.\n\nIngested: ${new Date().toLocaleString()}`;
        }
      } else {
        rawContent = `# ${title}\n\nContent ingested from ${source_type === "file" ? "uploaded file" : "crawl"}.\n\nSource: ${url}\nIngested: ${new Date().toLocaleString()}\nType: ${source_type}\n`;
      }

      const newItem: ContentItem = {
        id,
        title,
        url,
        source_type,
        status: "processing",
        score: null,
        word_count: word_count ?? rawContent.split(/\s+/).length,
        ingested_at: new Date().toISOString(),
        raw_content: rawContent,
      };

      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? {
                ...p,
                folders: p.folders.map((f) =>
                  f.id === folderId ? { ...f, items: [...f.items, newItem] } : f
                ),
              }
            : p
        )
      );

      // Simulate analysis after a short delay
      setTimeout(() => {
        updateItemStatus(id, "analyzed", Math.floor(Math.random() * 30) + 35);
      }, 2500);

      return id;
    },
    [updateItemStatus]
  );


  const getProductPrompts = useCallback(
    (productId: string): ProductPrompt[] => promptDatabase[productId] ?? [],
    [promptDatabase]
  );

  const addPromptsToProduct = useCallback(
    (productId: string, prompts: Omit<ProductPrompt, "id" | "addedAt">[]) => {
      setPromptDatabase((prev) => {
        const existing = prev[productId] ?? [];
        const existingTexts = new Set(existing.map((p) => p.text.toLowerCase()));
        const toAdd: ProductPrompt[] = prompts
          .filter((p) => !existingTexts.has(p.text.toLowerCase()))
          .map((p) => ({
            ...p,
            id: `pp${_nextPromptId++}`,
            addedAt: new Date().toISOString(),
          }));
        if (toAdd.length === 0) return prev;
        return { ...prev, [productId]: [...existing, ...toAdd] };
      });
    },
    []
  );

  const addFolder = useCallback(
    (productId: string, folderName: string): string => {
      const id = `folder-${Date.now()}`;
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? {
                ...p,
                folders: [...p.folders, { id, name: folderName, items: [] }],
              }
            : p
        )
      );
      return id;
    },
    []
  );

  return (
    <ContentContext.Provider
      value={{ products, getAnalysis, findContent, addContentItem, updateItemStatus, addFolder, getProductPrompts, addPromptsToProduct }}
    >
      {children}
    </ContentContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error("useContent must be used within <ContentProvider>");
  return ctx;
}

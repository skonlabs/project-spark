import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import {
  MOCK_PRODUCTS,
  CONTENT_ANALYSIS,
  type Product,
  type ContentItem,
  type ContentAnalysis,
  type ContentSourceType,
} from "@/data/products";

// ─── Dynamic content store (supplements MOCK_PRODUCTS) ────────────────────────

const _dynamicAnalysis: Record<string, ContentAnalysis> = {};

function generateMockAnalysis(item: ContentItem): ContentAnalysis {
  const score = Math.floor(Math.random() * 30) + 35; // 35–65
  return {
    score,
    analyzed_at: new Date().toISOString(),
    gaps: [
      { id: "g1", label: "Missing entity definition", description: 'No clear "X is Y" statement found in the introduction.', severity: "critical", fix: "Add a one-sentence entity definition in the first paragraph." },
      { id: "g2", label: "No FAQ section", description: "FAQ content is cited 3.2× more often by LLMs.", severity: "high", fix: "Add 5–7 Q&A pairs covering common user questions." },
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

// ─── Context ──────────────────────────────────────────────────────────────────

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
  }) => string; // returns new item id
  updateItemStatus: (contentId: string, status: ContentItem["status"], score?: number) => void;
}

const ContentContext = createContext<ContentContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ContentProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() =>
    // deep-clone so mutations don't affect the original const
    MOCK_PRODUCTS.map((p) => ({
      ...p,
      folders: p.folders.map((f) => ({ ...f, items: [...f.items] })),
    }))
  );

  const getAnalysis = useCallback(
    (contentId: string): ContentAnalysis | null => {
      return _dynamicAnalysis[contentId] ?? CONTENT_ANALYSIS[contentId] ?? null;
    },
    []
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

  const addContentItem = useCallback(
    ({ productId, folderId, title, url, source_type, word_count }: {
      productId: string;
      folderId: string;
      title: string;
      url: string;
      source_type: ContentSourceType;
      word_count?: number;
    }): string => {
      const id = `dynamic-${Date.now()}`;
      const newItem: ContentItem = {
        id,
        title,
        url,
        source_type,
        status: "processing",
        score: null,
        word_count: word_count ?? null,
        ingested_at: new Date().toISOString(),
        raw_content: `# ${title}\n\nContent ingested from ${url}.\n\nThis content is being processed and analysed for AI visibility. The analysis will complete shortly and you will be able to view gaps, recommendations, and generate an AI-enhanced version.\n\n## About this content\n\nSource: ${url}\nIngested: ${new Date().toLocaleString()}\nType: ${source_type}\n`,
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

      return id;
    },
    []
  );

  const updateItemStatus = useCallback(
    (contentId: string, status: ContentItem["status"], score?: number) => {
      setProducts((prev) =>
        prev.map((p) => ({
          ...p,
          folders: p.folders.map((f) => ({
            ...f,
            items: f.items.map((item) =>
              item.id === contentId
                ? { ...item, status, score: score ?? item.score }
                : item
            ),
          })),
        }))
      );

      // Generate mock analysis when analysis completes
      if (status === "analyzed") {
        setProducts((prev) => {
          for (const p of prev) {
            for (const f of p.folders) {
              const item = f.items.find((i) => i.id === contentId);
              if (item) {
                _dynamicAnalysis[contentId] = generateMockAnalysis(item);
              }
            }
          }
          return prev;
        });
      }
    },
    []
  );

  return (
    <ContentContext.Provider
      value={{ products, getAnalysis, findContent, addContentItem, updateItemStatus }}
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

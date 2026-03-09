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
      const newItem: ContentItem = {
        id,
        title,
        url,
        source_type,
        status: "processing",
        score: null,
        word_count: word_count ?? null,
        ingested_at: new Date().toISOString(),
        raw_content: null, // Will be populated after fetch
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

      // Set content and auto-analyze after a delay
      const finalizeContent = (content: string) => {
        setProducts((prev) =>
          prev.map((p) => ({
            ...p,
            folders: p.folders.map((f) => ({
              ...f,
              items: f.items.map((item) =>
                item.id === id
                  ? { ...item, raw_content: content, word_count: content.split(/\s+/).length }
                  : item
              ),
            })),
          }))
        );
        // Simulate analysis after content is loaded
        setTimeout(() => {
          updateItemStatus(id, "analyzed", Math.floor(Math.random() * 30) + 35);
        }, 3000);
      };

      if (source_type === "url" && url && url.startsWith("http")) {
        fetchUrlContent(url).then((content) => {
          finalizeContent(content || `# ${title}\n\nContent from ${url}.\n\nThe page could not be fetched automatically. You can paste the content manually.`);
        });
      } else {
        finalizeContent(`# ${title}\n\nContent ingested from ${source_type === "file" ? "uploaded file" : url}.\n\nSource: ${url}\nIngested: ${new Date().toLocaleString()}\nType: ${source_type}\n`);
      }

      return id;
    },
    []
  );

  // Fetch content from URL using a CORS proxy
  async function fetchUrlContent(url: string): Promise<string | null> {
    const proxies = [
      `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
      `https://corsproxy.io/?${encodeURIComponent(url)}`,
    ];

    for (const proxyUrl of proxies) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const response = await fetch(proxyUrl, { signal: controller.signal });
        clearTimeout(timeout);
        if (!response.ok) continue;

        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, "text/html");

        // Remove non-content elements
        doc.querySelectorAll("script, style, nav, footer, header, aside, .sidebar, .navigation, .menu, .ad, .advertisement")
          .forEach((el) => el.remove());

        const contentEl = doc.querySelector("main, article, .content, .post, .entry-content, #content") || doc.body;
        const pageTitle = doc.querySelector("h1")?.textContent?.trim() || doc.title || url;
        let content = `# ${pageTitle}\n\n`;

        const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute("content");
        if (metaDesc) content += `> ${metaDesc}\n\n`;

        contentEl.querySelectorAll("h1, h2, h3, h4, h5, h6, p, li, blockquote").forEach((el) => {
          const tag = el.tagName.toLowerCase();
          const text = el.textContent?.trim();
          if (!text || text.length < 3) return;
          if (tag === "h1") content += `# ${text}\n\n`;
          else if (tag === "h2") content += `## ${text}\n\n`;
          else if (tag === "h3") content += `### ${text}\n\n`;
          else if (tag.startsWith("h")) content += `#### ${text}\n\n`;
          else if (tag === "li") content += `- ${text}\n`;
          else if (tag === "blockquote") content += `> ${text}\n\n`;
          else content += `${text}\n\n`;
        });

        content = content.replace(/\n{3,}/g, "\n\n").trim();
        if (content.length < 100) {
          content = `# ${pageTitle}\n\n${contentEl.textContent?.replace(/\s+/g, " ").trim() || "Content could not be extracted."}`;
        }
        return content;
      } catch {
        continue;
      }
    }
    return null;
  }

  const updateItemStatus = useCallback(
    (contentId: string, status: ContentItem["status"], score?: number) => {
      // Single setProducts call that handles both status update and analysis generation
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

        // If analysis just completed, generate mock analysis result
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

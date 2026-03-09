import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";
import {
  MOCK_PRODUCTS,
  CONTENT_ANALYSIS,
  INITIAL_PROMPT_DATABASE,
  type Product,
  type ContentItem,
  type Folder,
  type ContentAnalysis,
  type ContentSourceType,
  type ProductPrompt,
  type LLMIntentType,
} from "@/data/products";
import { analyzeContentQuality } from "@/lib/ingest";

// ─── Helpers ──────────────────────────────────────────────────────────────────

let _nextPromptId = 100;

// ─── Context shape ─────────────────────────────────────────────────────────────

interface ContentContextValue {
  products: Product[];
  getAnalysis: (contentId: string) => ContentAnalysis | null;
  findContent: (contentId: string) => { product: Product; folder: Folder; item: ContentItem } | null;
  addContentItem: (params: {
    productId: string;
    folderId: string;
    title: string;
    url: string;
    source_type: ContentSourceType;
    word_count?: number;
  }) => string;
  updateItemStatus: (contentId: string, status: ContentItem["status"], score?: number) => void;
  /** Finalize ingestion: store extracted content, run quality analysis, set status to analyzed */
  finalizeIngestion: (contentId: string, rawContent: string, wordCount: number, title: string) => void;
  /** Mark an item as failed/errored */
  markIngestionError: (contentId: string) => void;
  addFolder: (productId: string, folderName: string) => string;
  // Prompt database — owned by context so changes trigger re-renders everywhere
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

  // Store titles for dynamically ingested items so updateItemStatus can generate
  // meaningful analysis without needing to read from stale closure state.
  const itemTitlesRef = useRef<Record<string, string>>({});

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
        raw_content: `# ${title}\n\nContent ingested from ${url}.\n\nThis content is being processed and analysed for AI visibility. The analysis will complete shortly.\n\n## About this content\n\nSource: ${url}\nIngested: ${new Date().toLocaleString()}\nType: ${source_type}\n`,
      };

      // Store title so updateItemStatus can generate meaningful analysis
      itemTitlesRef.current[id] = title;

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
      // Update product item status — keep separate from analysis generation
      // to avoid calling setState inside another setState's updater function.
      setProducts((prev) =>
        prev.map((p) => ({
          ...p,
          folders: p.folders.map((f) => ({
            ...f,
            items: f.items.map((item) => {
              if (item.id !== contentId) return item;
              return { ...item, status, score: score ?? item.score };
            }),
          })),
        }))
      );
    },
    []
  );

  const finalizeIngestion = useCallback(
    (contentId: string, rawContent: string, wordCount: number, title: string) => {
      // Store raw content and word count on the item
      setProducts((prev) =>
        prev.map((p) => ({
          ...p,
          folders: p.folders.map((f) => ({
            ...f,
            items: f.items.map((item) => {
              if (item.id !== contentId) return item;
              return { ...item, status: "analyzed" as const, word_count: wordCount, raw_content: rawContent };
            }),
          })),
        }))
      );

      // Run real quality analysis on the actual content
      const analysis = analyzeContentQuality(rawContent, title);
      setDynamicAnalysis((prev) => ({ ...prev, [contentId]: analysis }));

      // Keep title ref up to date
      itemTitlesRef.current[contentId] = title;
    },
    []
  );

  const markIngestionError = useCallback((contentId: string) => {
    setProducts((prev) =>
      prev.map((p) => ({
        ...p,
        folders: p.folders.map((f) => ({
          ...f,
          items: f.items.map((item) =>
            item.id === contentId ? { ...item, status: "error" as const } : item
          ),
        })),
      }))
    );
  }, []);

  const addFolder = useCallback((productId: string, folderName: string): string => {
    const folderId = `folder-${Date.now()}`;
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, folders: [...p.folders, { id: folderId, name: folderName, items: [] }] }
          : p
      )
    );
    return folderId;
  }, []);

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

  return (
    <ContentContext.Provider
      value={{
        products,
        getAnalysis,
        findContent,
        addContentItem,
        updateItemStatus,
        finalizeIngestion,
        markIngestionError,
        addFolder,
        getProductPrompts,
        addPromptsToProduct,
      }}
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

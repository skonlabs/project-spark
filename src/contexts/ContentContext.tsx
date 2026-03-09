import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type {
  ContentSourceType,
  LLMIntentType,
} from "@/data/products";

// ─── Types (kept compatible with existing UI) ─────────────────────────────────

export interface ContentItem {
  id: string;
  title: string;
  url: string;
  source_type: ContentSourceType;
  status: "pending" | "processing" | "analyzed" | "error";
  score: number | null;
  word_count: number | null;
  ingested_at: string;
  raw_content?: string;
}

export interface Folder {
  id: string;
  name: string;
  items: ContentItem[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  url: string;
  folders: Folder[];
}

export interface ContentAnalysis {
  score: number;
  analyzed_at: string;
  gaps: Array<{ id: string; label: string; description: string; severity: string; fix: string }>;
  dimension_scores: Array<{ label: string; score: number; max: number }>;
  recommendations: Array<{ action: string; impact: number }>;
}

export interface ProductPrompt {
  id: string;
  text: string;
  intent: LLMIntentType;
  covered: boolean;
  addedAt: string;
}

// ─── Context shape ─────────────────────────────────────────────────────────────

interface ContentContextValue {
  products: Product[];
  loading: boolean;
  getAnalysis: (contentId: string) => ContentAnalysis | null;
  findContent: (contentId: string) => { product: Product; folder: Folder; item: ContentItem } | null;
  addContentItem: (params: {
    productId: string;
    folderId: string;
    title: string;
    url: string;
    source_type: ContentSourceType;
    word_count?: number;
  }) => Promise<string>;
  updateItemStatus: (contentId: string, status: ContentItem["status"], score?: number) => void;
  addFolder: (productId: string, folderName: string) => Promise<string>;
  addProduct: (name: string, description: string, category: string, url: string) => Promise<string>;
  getProductPrompts: (productId: string) => ProductPrompt[];
  addPromptsToProduct: (productId: string, prompts: Omit<ProductPrompt, "id" | "addedAt">[]) => void;
  refresh: () => void;
}

const ContentContext = createContext<ContentContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ContentProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [analysisCache, setAnalysisCache] = useState<Record<string, ContentAnalysis>>({});
  const [promptsCache, setPromptsCache] = useState<Record<string, ProductPrompt[]>>({});
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user) { setProducts([]); setLoading(false); return; }
    setLoading(true);

    // Fetch products, folders, items, analysis, prompts in parallel
    const [prodRes, folderRes, itemRes, analysisRes, promptRes] = await Promise.all([
      supabase.from("products").select("*").eq("user_id", user.id).order("created_at"),
      supabase.from("folders").select("*").eq("user_id", user.id),
      supabase.from("content_items").select("*").eq("user_id", user.id),
      supabase.from("content_analysis").select("*").eq("user_id", user.id),
      supabase.from("product_prompts").select("*").eq("user_id", user.id),
    ]);

    const dbProducts = prodRes.data ?? [];
    const dbFolders = folderRes.data ?? [];
    const dbItems = itemRes.data ?? [];
    const dbAnalysis = analysisRes.data ?? [];
    const dbPrompts = promptRes.data ?? [];

    // Build nested structure
    const built: Product[] = dbProducts.map((p: any) => {
      const folders: Folder[] = dbFolders
        .filter((f: any) => f.product_id === p.id)
        .map((f: any) => ({
          id: f.id,
          name: f.name,
          items: dbItems
            .filter((i: any) => i.folder_id === f.id)
            .map((i: any): ContentItem => ({
              id: i.id,
              title: i.title,
              url: i.url ?? "",
              source_type: i.source_type as ContentSourceType,
              status: i.status as ContentItem["status"],
              score: i.score,
              word_count: i.word_count,
              ingested_at: i.ingested_at,
              raw_content: i.raw_content ?? undefined,
            })),
        }));
      return {
        id: p.id,
        name: p.name,
        description: p.description ?? "",
        category: p.category ?? "",
        url: p.url ?? "",
        folders,
      };
    });

    // Build analysis cache
    const ac: Record<string, ContentAnalysis> = {};
    for (const a of dbAnalysis as any[]) {
      ac[a.content_item_id] = {
        score: a.score,
        analyzed_at: a.analyzed_at,
        gaps: a.gaps as any,
        dimension_scores: a.dimension_scores as any,
        recommendations: a.recommendations as any,
      };
    }

    // Build prompts cache
    const pc: Record<string, ProductPrompt[]> = {};
    for (const p of dbPrompts as any[]) {
      if (!pc[p.product_id]) pc[p.product_id] = [];
      pc[p.product_id].push({
        id: p.id,
        text: p.text,
        intent: p.intent as LLMIntentType,
        covered: p.covered,
        addedAt: p.added_at,
      });
    }

    setProducts(built);
    setAnalysisCache(ac);
    setPromptsCache(pc);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const getAnalysis = useCallback(
    (contentId: string): ContentAnalysis | null => analysisCache[contentId] ?? null,
    [analysisCache]
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

  const addProduct = useCallback(async (name: string, description: string, category: string, url: string) => {
    if (!user) throw new Error("Not authenticated");
    const { data, error } = await supabase
      .from("products")
      .insert({ name, description, category, url, user_id: user.id })
      .select("id")
      .single();
    if (error) throw error;
    await fetchAll();
    return data.id;
  }, [user, fetchAll]);

  const addFolder = useCallback(async (productId: string, folderName: string) => {
    if (!user) throw new Error("Not authenticated");
    const { data, error } = await supabase
      .from("folders")
      .insert({ product_id: productId, name: folderName, user_id: user.id })
      .select("id")
      .single();
    if (error) throw error;
    await fetchAll();
    return data.id;
  }, [user, fetchAll]);

  const addContentItem = useCallback(async ({
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
  }) => {
    if (!user) throw new Error("Not authenticated");

    // Generate raw content
    let rawContent = `# ${title}\n\nContent from ${url}.\nIngested: ${new Date().toLocaleString()}`;
    if (source_type === "url" && url) {
      try {
        const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
        const domain = parsed.hostname.replace("www.", "");
        rawContent = `# ${title}\n\n> Source: [${domain}](${url})\n\n## Overview\n\nThis content was ingested from **${domain}** and is being analyzed for AI visibility optimization.\n\nIngested: ${new Date().toLocaleString()}`;
      } catch { /* keep default */ }
    }

    const { data, error } = await supabase
      .from("content_items")
      .insert({
        folder_id: folderId,
        user_id: user.id,
        title,
        url,
        source_type,
        status: "processing",
        word_count: word_count ?? rawContent.split(/\s+/).length,
        raw_content: rawContent,
      })
      .select("id")
      .single();
    if (error) throw error;

    // Simulate analysis after delay
    const itemId = data.id;
    setTimeout(async () => {
      const score = Math.floor(Math.random() * 30) + 35;
      await supabase.from("content_items").update({ status: "analyzed", score }).eq("id", itemId);
      await supabase.from("content_analysis").insert({
        content_item_id: itemId,
        user_id: user!.id,
        score,
        gaps: [
          { id: "g1", label: "Missing entity definition", description: 'No clear "X is Y" statement found.', severity: "critical", fix: "Add a one-sentence entity definition." },
          { id: "g2", label: "No FAQ section", description: "FAQ content is cited 3.2× more often by LLMs.", severity: "high", fix: "Add 5–7 Q&A pairs." },
        ],
        dimension_scores: [
          { label: "Entity Clarity", score: Math.floor(score * 0.8), max: 100 },
          { label: "Structure Quality", score: Math.floor(score * 0.6), max: 100 },
          { label: "Educational Authority", score: Math.floor(score * 0.5), max: 100 },
          { label: "Prompt Coverage", score: Math.floor(score * 0.3), max: 100 },
        ],
        recommendations: [
          { action: `Add a clear entity definition to "${title}"`, impact: 9 },
          { action: "Add FAQ section with 5–7 Q&A pairs", impact: 7 },
        ],
      });
      fetchAll();
    }, 2500);

    await fetchAll();
    return itemId;
  }, [user, fetchAll]);

  const updateItemStatus = useCallback(
    async (contentId: string, status: ContentItem["status"], score?: number) => {
      const updates: any = { status };
      if (score !== undefined) updates.score = score;
      await supabase.from("content_items").update(updates).eq("id", contentId);
      fetchAll();
    },
    [fetchAll]
  );

  const getProductPrompts = useCallback(
    (productId: string): ProductPrompt[] => promptsCache[productId] ?? [],
    [promptsCache]
  );

  const addPromptsToProduct = useCallback(
    async (productId: string, prompts: Omit<ProductPrompt, "id" | "addedAt">[]) => {
      if (!user) return;
      const existing = promptsCache[productId] ?? [];
      const existingTexts = new Set(existing.map((p) => p.text.toLowerCase()));
      const toInsert = prompts
        .filter((p) => !existingTexts.has(p.text.toLowerCase()))
        .map((p) => ({
          product_id: productId,
          user_id: user.id,
          text: p.text,
          intent: p.intent,
          covered: p.covered,
        }));
      if (toInsert.length === 0) return;
      await supabase.from("product_prompts").insert(toInsert);
      fetchAll();
    },
    [user, promptsCache, fetchAll]
  );

  return (
    <ContentContext.Provider
      value={{
        products, loading, getAnalysis, findContent, addContentItem,
        updateItemStatus, addFolder, addProduct, getProductPrompts,
        addPromptsToProduct, refresh: fetchAll,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error("useContent must be used within <ContentProvider>");
  return ctx;
}

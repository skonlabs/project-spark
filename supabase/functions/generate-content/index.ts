import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      title,
      originalContent,
      productName,
      productCategory,
      intent,
      tone,
      targetLlm,
      enhancements,
      gaps,
      dimensionScores,
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build enhancement instructions
    const enhancementList: string[] = [];
    if (enhancements?.entity_definition) enhancementList.push('Add a clear "X is Y" entity definition in the opening paragraph');
    if (enhancements?.faq_injection) enhancementList.push("Add a comprehensive FAQ section (5-7 Q&A pairs) based on common user questions");
    if (enhancements?.comparison_table) enhancementList.push("Add a comparison table vs alternatives/competitors");
    if (enhancements?.heading_optimization) enhancementList.push("Optimize heading structure with clear H2/H3 hierarchy");
    if (enhancements?.keyword_density) enhancementList.push("Improve keyword consistency and natural repetition");
    if (enhancements?.people_also_ask) enhancementList.push('Add a "People Also Ask" section with related questions');

    // Build gap fix instructions
    const gapInstructions = (gaps ?? [])
      .map((g: any) => `- [${g.severity}] ${g.label}: ${g.fix}`)
      .join("\n");

    const systemPrompt = `You are an expert content writer specializing in AI-optimized content. Your task is to REWRITE the user's existing content into a substantially improved version that will be cited by AI assistants (ChatGPT, Claude, Gemini).

CRITICAL RULES:
- You must produce the ACTUAL rewritten content in Markdown format — not guidelines, not tips, not instructions about what to write.
- Preserve the core information and topic from the original content.
- The output should be a complete, publishable article/page ready to replace the original.
- Write in ${tone || "professional"} tone.
- Target user intent: ${intent || "seek_explanation"}.
${targetLlm && targetLlm !== "all" ? `- Optimize especially for ${targetLlm} citation patterns.` : ""}

ENHANCEMENTS TO APPLY:
${enhancementList.length > 0 ? enhancementList.map((e) => `- ${e}`).join("\n") : "- General quality improvement"}

CONTENT GAPS TO FIX:
${gapInstructions || "- No specific gaps identified"}

OUTPUT FORMAT:
- Return ONLY the rewritten content in clean Markdown.
- Do NOT include meta-commentary like "Here is the rewritten content" or explanations of what you changed.
- Start directly with the content (heading, paragraphs, etc.).`;

    const userPrompt = `Rewrite this content for "${productName}" (${productCategory}):

**Title:** ${title}

**Original Content:**
${(originalContent || "").slice(0, 8000)}

Generate the complete rewritten article now.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    return new Response(
      JSON.stringify({ content }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-content error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PromptResult {
  text: string;
  intent: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contentTitle, contentBody, productName, productCategory } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an AI content analyst specializing in AI visibility and search optimization. Your task is to analyze content and generate the most relevant AI search queries (prompts) that this content should answer well.

Generate prompts that users would ask an AI assistant like ChatGPT, Claude, or Gemini that should lead to this content being cited.

Categories of prompts to consider:
- seek_explanation: Questions asking to explain or define something (e.g., "What is X?")
- find_best: Questions looking for top tools/recommendations (e.g., "Best X tools")
- compare: Questions comparing options (e.g., "X vs Y")
- learn_howto: Questions seeking step-by-step guidance (e.g., "How to X?")
- find_alternative: Questions looking for alternatives (e.g., "X alternatives")
- troubleshoot: Questions diagnosing problems or seeking fixes (e.g., "Why is X not working?")

Return ONLY a valid JSON array of objects with "text" and "intent" properties. Generate 8-15 highly relevant prompts based on the content. Each prompt should be specific and actionable.`;

    const userPrompt = `Analyze this content and generate AI search prompts it should answer:

**Product/Brand:** ${productName}
**Category:** ${productCategory}
**Content Title:** ${contentTitle}

**Content:**
${contentBody?.slice(0, 4000) || "No content body available"}

Generate 8-15 prompts that users would ask AI assistants that this content should answer. Return ONLY a JSON array like:
[{"text": "What is AI observability?", "intent": "seek_explanation"}, ...]`;

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

    // Parse the JSON response
    let prompts: PromptResult[] = [];
    try {
      // Try to extract JSON from the response (handle markdown code blocks)
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        prompts = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError, content);
      return new Response(
        JSON.stringify({ error: "Failed to parse AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate and clean the prompts
    const validIntents = ["seek_explanation", "find_best", "compare", "learn_howto", "find_alternative", "troubleshoot"];
    const validatedPrompts = prompts
      .filter((p) => p.text && typeof p.text === "string" && validIntents.includes(p.intent))
      .map((p) => ({ text: p.text.trim(), intent: p.intent }));

    return new Response(
      JSON.stringify({ prompts: validatedPrompts }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-prompts error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

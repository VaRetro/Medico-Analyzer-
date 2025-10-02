import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query_id, query_text, search_type, sources } = await req.json();
    
    console.log("Processing research query:", { query_id, search_type, sources_count: sources?.length });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Prepare system prompt based on search type
    let systemPrompt = "";
    if (search_type === "web_search") {
      systemPrompt = `You are a research assistant specializing in regulatory and clinical trial information. 
Analyze the user's query and provide comprehensive findings from regulatory websites and clinical trial databases.
Format your response with clear structure: title, summary, and key findings.`;
    } else if (search_type === "market_analysis") {
      systemPrompt = `You are a market analysis expert specializing in pharmaceutical and medical device markets.
Analyze trends, competitive landscape, and market opportunities based on the user's query.
Provide actionable insights with data-driven conclusions.`;
    } else if (search_type === "journal_summary") {
      systemPrompt = `You are a scientific literature analyst specializing in medical and pharmaceutical research.
Summarize key findings, methodologies, and conclusions from relevant scientific journals.
Highlight clinical significance and implications for practice.`;
    }

    // Add context about available sources
    const sourcesContext = sources && sources.length > 0
      ? `\n\nAvailable data sources: ${sources.map((s: any) => `${s.name} (${s.type})`).join(", ")}`
      : "";

    // Call Lovable AI Gateway
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    console.log("Calling Lovable AI Gateway...");
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: systemPrompt + sourcesContext,
          },
          {
            role: "user",
            content: query_text,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errorText);
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices[0]?.message?.content || "";

    console.log("AI response received, generating report...");

    // Parse AI response and create structured report
    const reportTitle = `Research Report: ${query_text.substring(0, 50)}${query_text.length > 50 ? "..." : ""}`;
    const reportSummary = aiContent.substring(0, 200) + "...";
    
    // Extract key findings (simplified parsing)
    const keyFindings = aiContent
      .split("\n")
      .filter((line: string) => line.trim().length > 20)
      .slice(0, 5);

    // Update search query status
    await supabaseClient
      .from("search_queries")
      .update({ status: "completed" })
      .eq("id", query_id);

    // Get user from query
    const { data: searchQueryData } = await supabaseClient
      .from("search_queries")
      .select("user_id")
      .eq("id", query_id)
      .single();

    if (!searchQueryData) {
      throw new Error("Search query not found");
    }

    // Create report record
    const { data: report, error: reportError } = await supabaseClient
      .from("reports")
      .insert({
        user_id: searchQueryData.user_id,
        query_id: query_id,
        title: reportTitle,
        summary: reportSummary,
        full_content: {
          ai_response: aiContent,
          key_findings: keyFindings,
          search_type: search_type,
          sources_used: sources?.map((s: any) => ({ name: s.name, type: s.type })) || [],
        },
      })
      .select()
      .single();

    if (reportError) {
      console.error("Error creating report:", reportError);
      throw reportError;
    }

    console.log("Report created successfully:", report.id);

    return new Response(
      JSON.stringify({
        success: true,
        title: reportTitle,
        summary: reportSummary,
        key_findings: keyFindings,
        report_id: report.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error processing research query:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Globe, TrendingUp, BookOpen, Loader2, Sparkles, FileText } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type SearchType = "web_search" | "market_analysis" | "journal_summary";

const searchTypes = [
  {
    id: "web_search" as SearchType,
    label: "Web Search",
    icon: Globe,
    description: "Search regulatory and clinical trial websites",
    color: "from-primary to-primary-glow",
  },
  {
    id: "market_analysis" as SearchType,
    label: "Market Analysis",
    icon: TrendingUp,
    description: "Analyze market data and trends",
    color: "from-secondary to-purple-600",
  },
  {
    id: "journal_summary" as SearchType,
    label: "Journal Summary",
    icon: BookOpen,
    description: "Summarize scientific journals and papers",
    color: "from-accent to-teal-600",
  },
];

export const SearchInterface = () => {
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState<SearchType>("web_search");
  const [currentResult, setCurrentResult] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sources } = useQuery({
    queryKey: ["data-sources"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("data_sources")
        .select("*")
        .eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });

  const searchMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create search query record
      const { data: searchQuery, error: queryError } = await supabase
        .from("search_queries")
        .insert({
          user_id: user.id,
          query_text: query,
          search_type: selectedType,
          selected_sources: sources?.map(s => s.id) || [],
          status: "processing",
        })
        .select()
        .single();

      if (queryError) throw queryError;

      // Call edge function for AI processing
      const { data, error } = await supabase.functions.invoke("process-research-query", {
        body: {
          query_id: searchQuery.id,
          query_text: query,
          search_type: selectedType,
          sources: sources || [],
        },
      });

      if (error) throw error;
      return { searchQuery, result: data };
    },
    onSuccess: (data) => {
      setCurrentResult(data.result);
      queryClient.invalidateQueries({ queryKey: ["search-history"] });
      toast({
        title: "Search completed",
        description: "Your research query has been processed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Search failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSearch = () => {
    if (!query.trim()) {
      toast({
        title: "Please enter a query",
        description: "Enter your research question or topic",
        variant: "destructive",
      });
      return;
    }
    searchMutation.mutate();
  };

  return (
    <div className="space-y-6">
      {/* Search Type Selection */}
      <Card className="p-6 shadow-elevated">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Select Research Mode
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {searchTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`p-4 rounded-lg border-2 transition-all duration-300 text-left ${
                selectedType === type.id
                  ? "border-primary bg-primary/5 shadow-card"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              }`}
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${type.color} flex items-center justify-center mb-3 shadow-glow`}>
                <type.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold mb-1">{type.label}</h3>
              <p className="text-sm text-muted-foreground">{type.description}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* Query Input */}
      <Card className="p-6 shadow-elevated">
        <h2 className="text-lg font-semibold mb-4">Enter Your Research Query</h2>
        <Textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Example: Latest FDA approvals for cardiovascular drugs in 2024, or key findings from recent clinical trials on immunotherapy..."
          className="min-h-[120px] mb-4 resize-none"
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{sources?.length || 0} sources connected</Badge>
            <Badge variant="outline" className="bg-gradient-to-r from-primary/10 to-secondary/10">
              {selectedType.replace("_", " ")}
            </Badge>
          </div>
          <Button
            onClick={handleSearch}
            disabled={searchMutation.isPending}
            className="bg-gradient-to-r from-primary to-secondary hover:shadow-glow"
          >
            {searchMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Research
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Results */}
      {currentResult && (
        <Card className="p-6 shadow-elevated animate-fade-in">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent" />
            Research Summary
          </h2>
          <div className="prose prose-sm max-w-none">
            <div className="bg-muted/30 p-4 rounded-lg mb-4">
              <h3 className="text-base font-semibold mb-2">{currentResult.title}</h3>
              <p className="text-muted-foreground">{currentResult.summary}</p>
            </div>
            {currentResult.key_findings && (
              <div className="space-y-2">
                <h4 className="font-semibold">Key Findings:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {currentResult.key_findings.map((finding: string, idx: number) => (
                    <li key={idx} className="text-sm">{finding}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

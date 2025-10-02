import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { FileText, Download, Calendar, TrendingUp, BookOpen, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const searchTypeIcons = {
  web_search: Globe,
  market_analysis: TrendingUp,
  journal_summary: BookOpen,
};

export const ReportArchive = () => {
  const { data: reports, isLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reports")
        .select(`
          *,
          search_queries (
            query_text,
            search_type,
            created_at
          )
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Report Archive</h2>
        <p className="text-muted-foreground">Access your generated research reports</p>
      </div>

      {!isLoading && reports && reports.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {reports.map((report, idx) => {
            const searchQuery = report.search_queries as any;
            const SearchTypeIcon = searchTypeIcons[searchQuery?.search_type as keyof typeof searchTypeIcons] || FileText;
            
            return (
              <Card key={report.id} className={cn("p-6 shadow-card hover:shadow-elevated transition-all duration-300 motion-safe:animate-slide-in-left", "anim-delay")} style={{ ['--anim-delay' as any]: `${idx * 45}ms` }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent to-teal-600 flex items-center justify-center shadow-glow">
                      <SearchTypeIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{report.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{report.summary}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(report.created_at), "MMM d, yyyy")}
                        </span>
                        {searchQuery && (
                          <Badge variant="outline" className="bg-gradient-to-r from-primary/10 to-secondary/10">
                            {searchQuery.search_type.replace("_", " ")}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-4"
                    onClick={() => {
                      // Download or view report
                      console.log("Download report:", report.id);
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
                
                {searchQuery?.query_text && (
                  <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm">
                      <span className="font-medium">Original Query: </span>
                      {searchQuery.query_text}
                    </p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center shadow-card shimmer-layer">
          <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No reports yet</h3>
          <p className="text-muted-foreground">
            Your generated research reports will appear here
          </p>
        </Card>
      )}
    </div>
  );
};

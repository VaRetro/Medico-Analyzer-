import { useState } from "react";
import { playClick, playSuccess } from "@/lib/sound";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { SearchInterface } from "./SearchInterface";
import { DataSources } from "./DataSources";
import { ReportArchive } from "./ReportArchive";
import { Database, Search, FileText, LogOut, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("search");
  const { toast } = useToast();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out successfully",
      description: "You have been logged out of your account",
    });
    try { playSuccess(); } catch {}
  };

  const onTabChange = (val: string) => {
    setActiveTab(val);
    try { playClick(0.12, 420); } catch {}
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* decorative floating accents */}
      <div className="pointer-events-none fixed inset-0 -z-10">
  <div className="absolute left-10 top-20 w-72 h-72 rounded-full bg-gradient-to-br from-primary/20 to-secondary/10 opacity-70 blur-3xl animate-float-slow will-change-transform" />
  <div className="absolute right-10 bottom-24 w-56 h-56 rounded-full bg-gradient-to-br from-secondary/20 to-accent/10 opacity-60 blur-2xl animate-float-slow will-change-transform" />
      </div>
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-lg sticky top-0 z-50 animate-fade-up">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow motion-safe:hover:animate-wobble motion-safe:hover:translate3d(0,-6px,0) transition-transform will-change-transform">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-pop shimmer-layer">
                Medico Analyzer
              </h1>
              <p className="text-xs text-muted-foreground">Intelligent Research & Analysis</p>
            </div>
          </div>
          <Button onClick={() => { handleSignOut(); try { playClick(); } catch {} }} variant="outline" size="sm" className="interactive-float">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 bg-card shadow-card animate-pop interactive-float">
            <TabsTrigger value="search" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white">
              <Search className="w-4 h-4 mr-2" />
              Search
            </TabsTrigger>
            <TabsTrigger value="sources" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white">
              <Database className="w-4 h-4 mr-2" />
              Sources
            </TabsTrigger>
            <TabsTrigger value="archive" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white">
              <FileText className="w-4 h-4 mr-2" />
              Archive
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            <SearchInterface />
          </TabsContent>

          <TabsContent value="sources" className="space-y-6">
            <DataSources />
          </TabsContent>

          <TabsContent value="archive" className="space-y-6">
            <ReportArchive />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

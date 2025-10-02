import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Link as LinkIcon, Database, FlaskConical, FileText, Building } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const sourceTypes = [
  { value: "regulatory", label: "Regulatory", icon: Building, color: "from-blue-500 to-blue-600" },
  { value: "clinical_trial", label: "Clinical Trial", icon: FlaskConical, color: "from-green-500 to-green-600" },
  { value: "journal", label: "Scientific Journal", icon: FileText, color: "from-purple-500 to-purple-600" },
  { value: "database", label: "Database", icon: Database, color: "from-orange-500 to-orange-600" },
];

export const DataSources = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSource, setNewSource] = useState({
    name: "",
    type: "regulatory",
    url: "",
    description: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sources, isLoading } = useQuery({
    queryKey: ["data-sources"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("data_sources")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addSourceMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("data_sources").insert({
        user_id: user.id,
        ...newSource,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["data-sources"] });
      setShowAddForm(false);
      setNewSource({ name: "", type: "regulatory", url: "", description: "" });
      toast({
        title: "Data source added",
        description: "Your new data source has been connected successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add source",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteSourceMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("data_sources")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["data-sources"] });
      toast({
        title: "Data source removed",
        description: "The data source has been disconnected",
      });
    },
  });

  const getSourceIcon = (type: string) => {
    const sourceType = sourceTypes.find((t) => t.value === type);
    return sourceType ? sourceType.icon : Database;
  };

  const getSourceColor = (type: string) => {
    const sourceType = sourceTypes.find((t) => t.value === type);
    return sourceType ? sourceType.color : "from-gray-500 to-gray-600";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Connected Data Sources</h2>
          <p className="text-muted-foreground">Manage your research data connections</p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gradient-to-r from-primary to-secondary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Source
        </Button>
      </div>

      {showAddForm && (
        <Card className="p-6 shadow-elevated animate-scale-in">
          <h3 className="text-lg font-semibold mb-4">Add New Data Source</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Source Name</Label>
              <Input
                id="name"
                value={newSource.name}
                onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                placeholder="e.g., FDA Database"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Source Type</Label>
              <Select
                value={newSource.type}
                onValueChange={(value) => setNewSource({ ...newSource, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sourceTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">URL (Optional)</Label>
              <Input
                id="url"
                value={newSource.url || ""}
                onChange={(e) => setNewSource({ ...newSource, url: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newSource.description}
                onChange={(e) => setNewSource({ ...newSource, description: e.target.value })}
                placeholder="Brief description of this data source"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => addSourceMutation.mutate()}
                disabled={!newSource.name || addSourceMutation.isPending}
                className="bg-gradient-to-r from-primary to-secondary"
              >
                Add Source
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setNewSource({ name: "", type: "regulatory", url: "", description: "" });
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sources?.map((source) => {
          const SourceIcon = getSourceIcon(source.type);
          return (
            <Card key={source.id} className="p-4 shadow-card hover:shadow-elevated transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getSourceColor(source.type)} flex items-center justify-center shadow-glow`}>
                    <SourceIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{source.name}</h3>
                    <Badge variant="outline" className="mt-1">
                      {source.type.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteSourceMutation.mutate(source.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              {source.description && (
                <p className="text-sm text-muted-foreground mb-2">{source.description}</p>
              )}
              {source.url && (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary flex items-center gap-1 hover:underline"
                >
                  <LinkIcon className="w-3 h-3" />
                  {source.url}
                </a>
              )}
            </Card>
          );
        })}
      </div>

      {!isLoading && sources?.length === 0 && (
        <Card className="p-12 text-center shadow-card">
          <Database className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No data sources connected</h3>
          <p className="text-muted-foreground mb-4">
            Add your first data source to start researching
          </p>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-primary to-secondary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Source
          </Button>
        </Card>
      )}
    </div>
  );
};

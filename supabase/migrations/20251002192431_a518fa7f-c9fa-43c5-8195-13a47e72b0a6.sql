-- Create data_sources table to store connected sources
CREATE TABLE public.data_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'regulatory', 'clinical_trial', 'journal', 'database'
  url TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  credentials JSONB, -- For storing API keys or auth info (encrypted)
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create search_queries table to store search history
CREATE TABLE public.search_queries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  query_text TEXT NOT NULL,
  search_type TEXT NOT NULL, -- 'web_search', 'market_analysis', 'journal_summary'
  selected_sources UUID[], -- Array of data_source ids
  status TEXT DEFAULT 'processing', -- 'processing', 'completed', 'failed'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reports table to store generated reports
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  query_id UUID REFERENCES public.search_queries(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT,
  full_content JSONB, -- Structured report data
  file_url TEXT, -- URL to archived report file
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for data_sources
CREATE POLICY "Users can view their own data sources"
  ON public.data_sources FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own data sources"
  ON public.data_sources FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own data sources"
  ON public.data_sources FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own data sources"
  ON public.data_sources FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for search_queries
CREATE POLICY "Users can view their own search queries"
  ON public.search_queries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own search queries"
  ON public.search_queries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own search queries"
  ON public.search_queries FOR UPDATE
  USING (auth.uid() = user_id);

-- Create RLS policies for reports
CREATE POLICY "Users can view their own reports"
  ON public.reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports"
  ON public.reports FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reports"
  ON public.reports FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_data_sources_updated_at
  BEFORE UPDATE ON public.data_sources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
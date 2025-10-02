import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Loader2, FileText, Upload } from "lucide-react";

type SummaryResult = {
  title: string;
  summary: string;
  key_findings: string[];
};

const simpleSummarize = (text: string): SummaryResult => {
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  const summary = sentences.slice(0, 3).join(" ");
  const key = sentences.slice(3, 8);
  return {
    title: `Medical Report Summary`,
    summary: summary || text.substring(0, 200),
    key_findings: key,
  };
};

export const ReportScanner = () => {
  const [reportText, setReportText] = useState("");
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [results, setResults] = useState<Array<{ fileName: string; result: SummaryResult | null; error?: string }>>([]);
  const [files, setFiles] = useState<File[]>([]);
  const { toast } = useToast();

  const handleScan = async () => {
    if (!reportText || reportText.trim().length < 20) {
      toast({ title: "Please paste a medical report (min 20 chars)", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/process-research-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query_id: null, query_text: reportText, search_type: "medical_report", sources: [] }),
      });

      if (res.ok) {
        const data = await res.json();
        setResults([{ fileName: 'pasted-text', result: { title: data.title, summary: data.summary, key_findings: data.key_findings || [] } }]);
        toast({ title: "Report scanned", description: "Summary generated successfully" });
      } else {
        const fallback = simpleSummarize(reportText);
        setResults([{ fileName: 'pasted-text', result: fallback }]);
        toast({ title: "Fallback used", description: "Server summarization failed, used local summarizer" });
      }
    } catch (err) {
      const fallback = simpleSummarize(reportText);
      setResults([{ fileName: 'pasted-text', result: fallback }]);
      toast({ title: "Error", description: "Could not reach server, used local summarizer" });
    } finally {
      setLoading(false);
    }
  };

  const extractTextFromPDF = async (file: File) => {
    setExtracting(true);
    try {
      // dynamic import to avoid bundling heavy libs into initial bundle
      const pdfjs = await import('pdfjs-dist/legacy/build/pdf');
      // set worker src to CDN
      // @ts-ignore
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map((it: any) => it.str);
        text += strings.join(' ') + '\n\n';
      }
      return text;
    } catch (err) {
      console.error('PDF extraction error', err);
      toast({ title: 'PDF extraction failed', description: String(err) });
      return '';
    } finally {
      setExtracting(false);
    }
  };

  const extractTextFromImage = async (file: File) => {
    setExtracting(true);
    try {
  const tesseract: any = await import('tesseract.js');
  const worker: any = await tesseract.createWorker({ logger: () => undefined });
  await worker.load();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  const { data } = await worker.recognize(file);
  await worker.terminate();
  return data?.text || '';
    } catch (err) {
      console.error('OCR error', err);
      toast({ title: 'Image OCR failed', description: String(err) });
      return '';
    } finally {
      setExtracting(false);
    }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = Array.from(e.target.files || []);
    if (fileList.length === 0) return;
    setFiles(fileList);
    // clear previous results
    setResults(fileList.map((f) => ({ fileName: f.name, result: null })));
    toast({ title: `${fileList.length} file(s) selected`, description: 'Ready to upload and scan' });
  };

  const handleUploadAndScan = async () => {
    if (!files || files.length === 0) {
      toast({ title: 'No files selected', variant: 'destructive' });
      return;
    }

    setLoading(true);
    const newResults: typeof results = [];

    for (const file of files) {
      let extracted = '';
      try {
        const mime = file.type;
        if (mime === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
          extracted = await extractTextFromPDF(file);
        } else if (mime.startsWith('image/') || /\.(png|jpe?g|tiff?)$/i.test(file.name)) {
          extracted = await extractTextFromImage(file);
        } else {
          try {
            extracted = await file.text();
          } catch (err) {
            extracted = '';
          }
        }

        if (!extracted || extracted.trim().length < 10) {
          newResults.push({ fileName: file.name, result: null, error: 'No text extracted' });
          continue;
        }

        // Send to server summarizer
        const res = await fetch('/api/process-research-query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query_id: null, query_text: extracted, search_type: 'medical_report', sources: [] }),
        });

        if (res.ok) {
          const data = await res.json();
          const r: SummaryResult = { title: data.title || `Summary: ${file.name}`, summary: data.summary || '', key_findings: data.key_findings || [] };
          newResults.push({ fileName: file.name, result: r });
        } else {
          // fallback
          const fallback = simpleSummarize(extracted);
          newResults.push({ fileName: file.name, result: fallback });
        }
      } catch (err: any) {
        console.error('File process error', err);
        newResults.push({ fileName: file.name, result: null, error: String(err) });
      }
      // update intermediate results so UI shows progress
      setResults((prev) => [...prev.filter((p) => p.fileName !== file.name), ...newResults.filter((n) => n.fileName === file.name)]);
    }

    // finalize results
    setResults(newResults);
    setLoading(false);
    toast({ title: 'Scan complete', description: `${newResults.length} file(s) processed` });
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-2">Medical Report Scanner</h2>
      <p className="text-sm text-muted-foreground mb-4">Paste the text of a medical report or upload the contents and click Scan to get a short research-style summary.</p>

      <Textarea value={reportText} onChange={(e: any) => setReportText(e.target.value)} className="min-h-[200px] mb-4" />

      <div className="flex items-center gap-4">
        <Button onClick={handleScan} disabled={loading}>
          {loading ? "Scanning..." : "Scan & Summarize"}
        </Button>
        <Button variant="ghost" onClick={() => { setReportText(""); setResults([]); setFiles([]); }}>
          Clear
        </Button>
      </div>

      {results && results.length > 0 && (
        <div className="mt-6 space-y-4">
          {results.map((r, idx) => (
            <Card key={idx} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{r.fileName}</h4>
                    {r.error ? (
                      <p className="text-sm text-destructive">{r.error}</p>
                    ) : r.result ? (
                      <>
                        <p className="text-sm text-muted-foreground">{r.result.summary}</p>
                        {r.result.key_findings && r.result.key_findings.length > 0 && (
                          <ul className="mt-2 list-disc list-inside text-sm">
                            {r.result.key_findings.map((k, i) => (
                              <li key={i}>{k}</li>
                            ))}
                          </ul>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">Pending...</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Card>
  );
};

export default ReportScanner;

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    // Bind explicitly to IPv4 localhost to avoid IPv6/::1 resolution issues on Windows
    host: "127.0.0.1",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Increase warning threshold slightly and split large vendor chunks
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            // Put React and core libs in a separate chunk
            if (id.match(/node_modules\/(react|react-dom|react-router-dom|@tanstack)\b/)) {
              return 'vendor-react';
            }

            // UI libraries and icons
            if (id.match(/node_modules\/(?:@radix-ui|lucide-react|class-variance-authority|cmdk)\b/)) {
              return 'vendor-ui';
            }

            // Heavy libs used for PDF/OCR
            if (id.includes('pdfjs-dist') || id.includes('tesseract.js')) {
              return 'vendor-ocr';
            }

            // Fallback vendor chunk
            return 'vendor';
          }
        }
      }
    }
  },
}));

import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper to get OpenRouter Key
  const getOpenRouterKey = () => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey.trim() === "") {
      throw new Error("OPENROUTER_API_KEY tidak ditemukan. Mohon konfigurasi di menu Secrets.");
    }
    return apiKey;
  };

  // Simple in-memory store for shared PRDs (Clears on restart, which is fine for this environment)
  const sharedPrds = new Map<string, { content: string, createdAt: number }>();

  // Cleanup old shares every hour
  setInterval(() => {
    const now = Date.now();
    for (const [id, data] of sharedPrds.entries()) {
      if (now - data.createdAt > 24 * 60 * 60 * 1000) {
        sharedPrds.delete(id);
      }
    }
  }, 60 * 60 * 1000);

  // API Routes
  app.get("/api/models/status", async (req, res) => {
    try {
      const apiKey = getOpenRouterKey();
      // Fast check for multiple models
      const checkModel = async (model: string) => {
        try {
          const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model,
              messages: [{ role: "user", content: "hi" }],
              max_tokens: 1
            })
          });
          return resp.ok ? "ACTIVE" : "SLOW";
        } catch {
          return "DOWN";
        }
      };

      const status = {
        pro: await checkModel("google/gemini-2.0-pro-exp-02-05:free"),
        standard: await checkModel("google/gemini-2.0-flash-001"),
        fallback: await checkModel("google/gemini-flash-1.5")
      };
      res.json(status);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tech-stack/recommend", async (req, res) => {
    const { input } = req.body;
    try {
      const apiKey = getOpenRouterKey();
      const prompt = `Berikan rekomendasi tech stack untuk ide produk berikut: "${input}". 
      Tanggapi HANYA dengan format JSON mentah seperti ini:
      { "categories": [{ "id": "frontend", "name": "Frontend", "options": [{ "name": "React + Vite", "description": "Cepat dan modern", "badge": "Paling Populer" }] }] }
      Berikan minimal 4 kategori (Frontend, Backend, Database, Cloud/Infrastructure).`;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-001",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" }
        })
      });

      const data = await response.json();
      res.json(JSON.parse(data.choices[0].message.content));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/prd/share", (req, res) => {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: "Content is required" });
    const id = Math.random().toString(36).substring(2, 11);
    sharedPrds.set(id, { content, createdAt: Date.now() });
    res.json({ id });
  });

  app.get("/api/prd/share/:id", (req, res) => {
    const data = sharedPrds.get(req.params.id);
    if (!data) return res.status(404).json({ error: "PRD not found or expired" });
    res.json({ content: data.content });
  });

  // System Prompts & Helpers for Multi-depth Generation
  const CODING_RULES_SECTION = `
## CODING RULES & ENGINEERING STANDARDS

| Prinsip | Definisi |
|---|---|
| Clean Code | Kode mudah dibaca developer lain |
| Maintainable | Mudah diubah tanpa merusak sistem |
| Scalable | Tetap bagus walau project membesar |
| Secure | Tidak rentan serangan umum |
| Consistent | Semua developer punya style sama |

### Aturan Wajib Kode:
- **Single Responsibility** — setiap function/class hanya 1 tanggung jawab
- **Maksimal 3 Level Nesting** — gunakan early return jika lebih
- **No Magic Number/String** — semua literal wajib jadi named constant
- **API Validation Wajib** — gunakan Zod atau Joi di setiap endpoint
- **Async Error Handling** — setiap async wajib try/catch

### Contoh Implementasi
#### Maksimal 3 Level Nesting
❌ **SALAH:**
\`\`\`typescript
function process(data) {
  if (data) {
    if (data.items) {
      data.items.forEach(item => {
        if (item.active) {
          // logic
        }
      });
    }
  }
}
\`\`\`

✅ **BENAR:**
\`\`\`typescript
function process(data) {
  if (!data || !data.items) return;
  
  data.items.forEach(item => {
    if (!item.active) return;
    // logic
  });
}
\`\`\`

### Aturan Deployment:
- PR Review minimal 1 developer sebelum merge
- Dilarang push langsung ke branch main/production
- Semua secret di .env, dilarang hardcode
`;

  app.post("/api/prd/generate", async (req, res) => {
    const { input, mode, history = [], techStack = {} } = req.body;

    if (!input) {
      return res.status(400).json({ error: "Input is required" });
    }

    const techStackString = Object.entries(techStack).map(([cat, val]) => `${cat}: ${val}`).join(", ");
    
    // Set headers for SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    try {
      const apiKey = getOpenRouterKey();
      
      let systemInstruction = `Kamu adalah PRDLY, asisten AI PRD Generator tingkat enterprise.
      PENTING: Gunakan Tech Stack pilihan user berikut: ${techStackString}.
      PENTING: Di akhir dokumen, SELALU sertakan section "CODING RULES & ENGINEERING STANDARDS" dengan tabel prinsip dan panduan teknis.`;

      if (mode === "enterprise") {
        systemInstruction += `\nMode: ENTERPRISE (High Detail). Hasilkan PRD minimal 23 section termasuk SWOT per kompetitor, RACI matrix, Gantt chart ASCII, Compliance PDPA, dan Estimasi biaya dalam Rupiah.`;
      } else if (mode === "lengkap") {
        systemInstruction += `\nMode: LENGKAP. Hasilkan PRD 18+ section termasuk analisis kompetitor & user journey.`;
      } else {
        systemInstruction += `\nMode: STANDAR. Hasilkan PRD 12 section inti secara padat dan jelas.`;
      }

      systemInstruction += `\n\nATURAN OUTPUT:
      - Sertakan section penutup: "This Product Requirements Document was Generated by AI Gemini - Pro Reasoning Engine. Created By Ramdan."
      - Gunakan diagram ASCII untuk Arsitektur.
      - Sertakan contoh JSON Request dan Response untuk API.
      - Gunakan HEADINGS markdown yang jelas.
      - Tambahkan coding rules di akhir: ${CODING_RULES_SECTION}`;

      // Enterprise mode might need multi-phase but for simplicity and safety in streaming environment, 
      // we'll use a very powerful prompt first. If we need true multi-call, we'd handle it differently.
      // But let's follow user request: Mode Enterprise harus menggunakan multi-phase.
      // However, SSE streaming multiple calls is tricky. 
      // We will do a loop for enterprise if needed, but for now let's focus on the prompt quality.

      const modelsToTry = [
        "google/gemini-2.0-pro-exp-02-05:free",
        "google/gemini-2.0-flash-001",
        "google/gemini-flash-1.5"
      ];

      const performStream = async (msgs: any[], modelName: string, isSequential = false) => {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "HTTP-Referer": "https://prdly.app",
            "X-Title": "PRDLY",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: modelName,
            messages: msgs,
            stream: true,
            max_tokens: isSequential ? 2500 : 5000,
          })
        });

        if (!response.ok) return null;

        const reader = response.body?.getReader();
        if (!reader) return null;
        const decoder = new TextDecoder();
        let buffer = "";
        let fullText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            const cleanedLine = line.replace(/^data: /, "").trim();
            if (cleanedLine === "[DONE]" || !cleanedLine) continue;
            try {
              const parsed = JSON.parse(cleanedLine);
              const content = parsed.choices?.[0]?.delta?.content || "";
              if (content) {
                res.write(`data: ${JSON.stringify({ type: "prd", text: content })}\n\n`);
                fullText += content;
              }
            } catch (e) {}
          }
        }
        return fullText;
      };

      let successfulModel = "";
      for (const m of modelsToTry) {
        // Test first model availability
        const test = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model: m, messages: [{ role: "user", content: "hi" }], max_tokens: 1 })
        });
        if (test.ok) {
          successfulModel = m;
          break;
        }
      }

      if (!successfulModel) successfulModel = modelsToTry[0];
      res.write(`data: ${JSON.stringify({ type: "model_info", model: successfulModel })}\n\n`);

      if (mode === "enterprise") {
        // Multi-phase approach
        const phases = [
          "Phase 1: Executive Summary, Problem, Objectives, Persona, and User Journey.",
          "Phase 2: Scope, MoSCoW Features, competitive analysis, and SWOT per competitor.",
          "Phase 3: System Architecture (ASCII), API Specs, ERD, and UI/UX Structure.",
          "Phase 4: RACI Matrix, Gantt Chart ASCII, PDPA Compliance, and Cost Estimation in IDR.",
          "Phase 5: Release Strategy, Risks, Testing Plans, Metrics, and Coding Rules."
        ];

        let context = "";
        for (let i = 0; i < phases.length; i++) {
          const phasePrompt = `[PHASE ${i + 1}/5]
          Current Task: ${phases[i]}
          
          Guidelines:
          - Detail tingkat Enterprise.
          - Bahasa consistent.
          - Context sebelumnya: ${context.slice(-1000)}
          - Ide Utama: ${input}
          - Tech Stack: ${techStackString}
          - ALWAYS add Coding Rules if this is the final phase.
          
          Jangan ulangi section yang sudah ada. Lanjutkan dokumentasi.`;
          
          const msgs = [
            { role: "system", content: systemInstruction },
            { role: "user", content: phasePrompt }
          ];
          
          const result = await performStream(msgs, successfulModel, true);
          context += (result || "");
          res.write(`data: ${JSON.stringify({ type: "prd", text: "\n\n" })}\n\n`);
        }
      } else {
        // Single call for standard/lengkap
        const messages = [
          { role: "system", content: systemInstruction },
          ...history.map((h: any) => ({ role: h.role === 'user' ? 'user' : 'assistant', content: h.text })),
          { role: "user", content: input }
        ];
        await performStream(messages, successfulModel);
      }

      res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
      res.end();
    } catch (error: any) {
      res.write(`data: ${JSON.stringify({ type: "error", message: error.message })}\n\n`);
      res.end();
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PRDLY Server running on port ${PORT}`);
  });
}

startServer();

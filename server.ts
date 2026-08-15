import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
    });
  });

  // AI Assistant Chat & Actions endpoint
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { message, history = [], crmContext = {} } = req.body;

      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required" });
      }

      const ai = getAI();
      if (!ai) {
        return res.status(503).json({
          error: "Gemini API key is not configured. Please ensure GEMINI_API_KEY is present in settings.",
          fallback: `[AI System Demo Response]: Received query: "${message}". In production with GEMINI_API_KEY configured, this generates live actionable CRM intelligence.`
        });
      }

      const systemInstruction = `You are TRISHUL AI, an executive AI Business Consultant and intelligent assistant embedded inside TRISHUL CRM.
Your role is to assist CRM Admins, Supervisors, and Account Managers in managing leads, customers, sales pipelines, employee assignments, and business analytics.

Here is the current live CRM Context:
- Total Customers: ${crmContext.totalCustomers ?? "N/A"}
- Total Leads: ${crmContext.totalLeads ?? "N/A"}
- Active Employees: ${crmContext.activeEmployees ?? "N/A"}
- Total Revenue: ${crmContext.totalRevenue ?? "₹8,45,230"}
- Pending Tasks: ${crmContext.pendingTasks ?? "N/A"}
- Recent Leads: ${JSON.stringify(crmContext.recentLeads || [])}
- Top Customers: ${JSON.stringify(crmContext.topCustomers || [])}
- Active Team Members: ${JSON.stringify(crmContext.employees || [])}

Instructions:
1. Provide sharp, professional, concise, and structured answers formatted cleanly in markdown with bullet points and bold highlights.
2. If asked to write a follow-up email or proposal, craft a compelling, ready-to-send template with placeholders like [Lead Name], [Company], [Your Name].
3. If asked to summarize activity, highlight key KPIs, conversion status, and immediate action items.
4. Keep the tone authoritative, helpful, and focused on accelerating business growth.`;

      const contents = [
        ...history.map((h: { role: string; content: string }) => ({
          role: h.role === "assistant" ? "model" : "user",
          parts: [{ text: h.content }],
        })),
        {
          role: "user",
          parts: [{ text: message }],
        },
      ];

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const responseText = response.text || "No response generated.";
      return res.json({ reply: responseText });
    } catch (err: any) {
      console.error("Gemini API error:", err);
      return res.status(500).json({
        error: err.message || "Failed to generate AI response",
      });
    }
  });

  // Specialized prompt generator (Follow-up email, proposal, inactive clients analysis)
  app.post("/api/gemini/action", async (req, res) => {
    try {
      const { actionType, payload = {} } = req.body;
      const ai = getAI();

      if (!ai) {
        return res.status(503).json({
          error: "Gemini API key is not configured.",
          result: `[Sample Generated Response for ${actionType}]: Trishul AI CRM automation sample result.`
        });
      }

      let prompt = "";
      switch (actionType) {
        case "follow-up-email":
          prompt = `Generate a high-converting, professional B2B follow-up email for a lead with details:
Lead Name: ${payload.leadName || "Client"}
Company: ${payload.company || "Prospect Corp"}
Interest: ${payload.interest || "CRM & Automation Solutions"}
Current Status: ${payload.status || "Contacted"}
Make it engaging, polite, value-driven, and end with a clear call-to-action for a 15-minute discovery call.`;
          break;

        case "customer-proposal":
          prompt = `Draft an executive proposal summary for client:
Customer Name: ${payload.customerName || "Enterprise Client"}
Company: ${payload.company || "Innovate Corp"}
Estimated Value: ${payload.value || "₹1,50,000"}
Key Needs: Business Management, Lead Conversion, Task automation
Include: Executive Summary, Proposed Solution, Deliverables, Value proposition, and Next steps.`;
          break;

        case "summarize-activity":
          prompt = `Provide an executive daily business summary based on this data:
Total Leads: ${payload.totalLeads || 12}
New Deals Won Today: ${payload.dealsWon || 3}
Meetings Scheduled: ${payload.meetings || 5}
Today's Revenue: ${payload.revenue || "₹2,45,000"}
Tasks Completed: ${payload.tasksDone || 8}
Give 3 key business takeaways and 2 priority actions for tomorrow.`;
          break;

        case "inactive-customers":
          prompt = `Analyze this list of inactive customers and recommend a 3-step re-engagement campaign:
${JSON.stringify(payload.inactiveList || [{ name: "Nexus Corp", daysInactive: 45 }, { name: "Bright Solutions", daysInactive: 60 }])}
Include specific reactivation incentives and messaging strategies.`;
          break;

        case "top-performing-employee":
          prompt = `Review this team performance data and highlight the top performers with constructive recognition:
${JSON.stringify(payload.employees || [{ name: "Rahul Verma", leadsClosed: 8, revenue: "₹3,20,000" }, { name: "Ankit Sharma", leadsClosed: 6, revenue: "₹2,10,000" }])}
Give celebratory feedback and tips to scale their best practices to the whole team.`;
          break;

        default:
          prompt = `Provide strategic CRM optimization recommendations for: ${JSON.stringify(payload)}`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are TRISHUL CRM AI Business Advisor. Provide well-formatted, executive-grade responses in clean markdown.",
          temperature: 0.6,
        },
      });

      return res.json({ result: response.text || "" });
    } catch (err: any) {
      console.error("Gemini Action Error:", err);
      return res.status(500).json({ error: err.message || "Action processing failed" });
    }
  });

  // Vite middleware in dev mode / Static file serving in production
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
    console.log(`TRISHUL CRM Server active at http://0.0.0.0:${PORT}`);
  });
}

startServer();

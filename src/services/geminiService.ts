/**
 * TRISHUL CRM Gemini AI Service
 * Supports Cloudflare Pages Functions, Express Node.js Server, and Direct Client Fallback
 */

export interface GeminiChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface GeminiCrmContext {
  totalCustomers?: number;
  totalLeads?: number;
  totalTasks?: number;
  totalEmployees?: number;
  sampleCustomers?: Array<{ name: string; company: string; value?: number }>;
  sampleLeads?: Array<{ name: string; company: string; status: string; value?: number }>;
  pendingTasks?: Array<{ title: string; assignee: string; due?: string }>;
  recentLeads?: any[];
  topCustomers?: any[];
  employees?: any[];
  [key: string]: any;
}

function getClientApiKey(): string {
  // Vite define variables & environment variables
  return (
    (typeof process !== 'undefined' && process.env && process.env.GEMINI_API_KEY) ||
    (import.meta as any).env?.VITE_GEMINI_API_KEY ||
    (import.meta as any).env?.GEMINI_API_KEY ||
    ''
  );
}

/**
 * Execute direct client-side Gemini request if server /api endpoint is not running (e.g. static Cloudflare Pages build)
 */
async function callDirectGeminiApi(
  message: string,
  history: GeminiChatMessage[] = [],
  crmContext: GeminiCrmContext = {}
): Promise<string> {
  const apiKey = getClientApiKey();

  if (!apiKey) {
    throw new Error(
      'Gemini API key is not detected. Please verify your GEMINI_API_KEY is configured in your deployment settings or .env file.'
    );
  }

  const systemInstruction = `You are TRISHUL AI, an executive AI Business Consultant and intelligent assistant embedded inside TRISHUL CRM.
Your role is to assist CRM Admins, Supervisors, and Account Managers in managing leads, customers, sales pipelines, employee assignments, and business analytics.

Here is the current live CRM Context:
- Total Customers: ${crmContext.totalCustomers ?? 'N/A'}
- Total Leads: ${crmContext.totalLeads ?? 'N/A'}
- Active Employees: ${crmContext.totalEmployees ?? 'N/A'}
- Total Tasks: ${crmContext.totalTasks ?? 'N/A'}
- Sample Customers: ${JSON.stringify(crmContext.sampleCustomers || [])}
- Sample Leads: ${JSON.stringify(crmContext.sampleLeads || [])}
- Pending Tasks: ${JSON.stringify(crmContext.pendingTasks || [])}

Instructions:
1. Provide sharp, professional, concise, and structured answers formatted cleanly in markdown with bullet points and bold highlights.
2. If asked to write a follow-up email or proposal, craft a compelling, ready-to-send template with placeholders like [Lead Name], [Company], [Your Name].
3. If asked to summarize activity, highlight key KPIs, conversion status, and immediate action items.
4. Keep the tone authoritative, helpful, and focused on accelerating business growth.`;

  const contents = [
    ...history.map((h) => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.content }],
    })),
    {
      role: 'user',
      parts: [{ text: message }],
    },
  ];

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: systemInstruction }],
      },
      contents: contents,
      generationConfig: {
        temperature: 0.7,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorJson: any = null;
    try {
      errorJson = JSON.parse(errorText);
    } catch {}
    const message = errorJson?.error?.message || `Gemini API returned status ${response.status}: ${errorText}`;
    throw new Error(message);
  }

  const result = await response.json();
  const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini did not return any candidate response.');
  }

  return text;
}

/**
 * Sends a message to the AI Consultant with robust error handling and multi-runtime fallback
 */
export async function sendGeminiChatMessage(
  message: string,
  history: GeminiChatMessage[] = [],
  crmContext: GeminiCrmContext = {}
): Promise<string> {
  // Step 1: Try server API endpoint first (/api/gemini/chat)
  try {
    const response = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        history,
        crmContext,
      }),
    });

    const rawText = await response.text();

    // Check if response is valid JSON (and not an HTML error or SPA fallback)
    if (rawText.trim().startsWith('{') || rawText.trim().startsWith('[')) {
      try {
        const data = JSON.parse(rawText);
        if (data.reply) {
          return data.reply;
        }
        if (data.error) {
          // If server reported missing key or error, try direct client fallback if key is present
          if (getClientApiKey()) {
            return await callDirectGeminiApi(message, history, crmContext);
          }
          throw new Error(data.error);
        }
      } catch (jsonErr: any) {
        if (jsonErr.message && !jsonErr.message.includes('Unexpected end')) {
          throw jsonErr;
        }
      }
    }
  } catch (err: any) {
    console.warn('Server API endpoint /api/gemini/chat unavailable, attempting direct client fallback:', err);
  }

  // Step 2: Fallback to direct Gemini API call (e.g. for static Cloudflare Pages or when API route is bypassed)
  return await callDirectGeminiApi(message, history, crmContext);
}

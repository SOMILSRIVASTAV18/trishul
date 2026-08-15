interface Env {
  GEMINI_API_KEY?: string;
  VITE_GEMINI_API_KEY?: string;
}

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  try {
    const { request, env } = context;
    const body = await request.json() as any;
    const { message, history = [], crmContext = {} } = body || {};

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiKey = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || (globalThis as any).process?.env?.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: 'GEMINI_API_KEY is not configured in Cloudflare environment variables.',
          reply: '⚠️ **Gemini API Key Missing**: Please set `GEMINI_API_KEY` in your Cloudflare Pages dashboard under Settings > Environment Variables.'
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
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
      ...history.map((h: { role: string; content: string }) => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }],
      })),
      {
        role: 'user',
        parts: [{ text: message }],
      },
    ];

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent?key=${apiKey}`;

    const geminiResponse = await fetch(geminiUrl, {
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

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      let errJson: any = null;
      try {
        errJson = JSON.parse(errText);
      } catch {}
      const errMsg = errJson?.error?.message || `Gemini API returned status ${geminiResponse.status}: ${errText}`;
      return new Response(JSON.stringify({ error: errMsg, reply: `⚠️ Error from Gemini: ${errMsg}` }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const geminiData: any = await geminiResponse.json();
    const candidateText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';

    return new Response(JSON.stringify({ reply: candidateText }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Internal server error', reply: `Error: ${err.message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

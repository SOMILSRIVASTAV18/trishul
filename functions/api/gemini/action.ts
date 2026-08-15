interface Env {
  GEMINI_API_KEY?: string;
  VITE_GEMINI_API_KEY?: string;
}

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  try {
    const { request, env } = context;
    const body = await request.json() as any;
    const { actionType, payload = {} } = body || {};

    const apiKey = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || (globalThis as any).process?.env?.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: 'GEMINI_API_KEY is not configured.',
          result: `[Sample Generated Response for ${actionType}]: Please configure GEMINI_API_KEY in Cloudflare settings.`
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
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

      default:
        prompt = `Provide strategic CRM optimization recommendations for: ${JSON.stringify(payload)}`;
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent?key=${apiKey}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: "You are TRISHUL CRM AI Business Advisor. Provide well-formatted, executive-grade responses in clean markdown." }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.6,
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      return new Response(JSON.stringify({ error: errText, result: `Error from Gemini: ${errText}` }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const geminiData: any = await geminiResponse.json();
    const candidateText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return new Response(JSON.stringify({ result: candidateText }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Action processing failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

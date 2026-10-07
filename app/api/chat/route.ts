export async function POST(req: Request) {
  try {
    const { prompt, messages } = await req.json();
    const apiKey =
      process.env.GROQ_API_KEY ||
      process.env.GROQ_ASSISTANT_KEY ||
      process.env.OPENAI_API_KEY;

    if (!apiKey) {
      const userText = prompt || messages?.[messages.length - 1]?.content || "";
      return Response.json({
        reply: `Got it! Here's help for: "${userText}"\n\n🔥 3 Viral Hooks:\n1. "I spent 100 hours testing AI tools - here are 3 that actually save you 10hrs/week"\n2. "Most people use AI wrong. Here's the framework that 10x'd my content"\n3. "Stop writing captions manually - this AI trick got me 50K views"\n\nWant me to write the full caption, reel script, or 7-day calendar for this?`,
      });
    }

    const formattedMessages = messages || [{ role: "user", content: prompt }];

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content:
              "You are ContentAI Assistant, an expert social media and content marketing strategist. Provide concise, punchy, high-converting social copy, hooks, calendar schedules, and campaign ideas.",
          },
          ...formattedMessages,
        ],
        max_tokens: 1000,
      }),
    });

    const data = await res.json();
    const reply =
      data.choices?.[0]?.message?.content ||
      "I'm ready to help! What content do you need?";
    return Response.json({ reply });
  } catch (err: unknown) {
    return Response.json({
      reply:
        "I'm here! Tell me what content you need - hooks, captions, reel script, or campaign plan - I'll create it for you right now.",
    });
  }
}

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { message } = await req.json();
  const apiKey = process.env.GROQ_ASSISTANT_KEY;

  if (!apiKey) {
    return NextResponse.json({ reply: "No API key configured." });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          { role: "system", content: "You are a helpful social media assistant." },
          { role: "user", content: message },
        ],
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    
    // Return full debug info
    return NextResponse.json({ 
      reply: data.choices?.[0]?.message?.content ?? "No content in response",
      debug: {
        status: response.status,
        hasChoices: !!data.choices,
        error: data.error ?? null,
        keyPrefix: apiKey.substring(0, 8),
      }
    });
  } catch (e: unknown) {
    return NextResponse.json({ reply: "Fetch failed", error: String(e) });
  }
}

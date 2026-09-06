import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { message } = await req.json();
  const apiKey = process.env.GROQ_ASSISTANT_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "No API key" }, { status: 500 });
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama3-8b-8192",
      messages: [
        {
          role: "system",
          content: "You are an AI assistant for a social media content platform. Help the user with content ideas, captions, strategies, and anything related to social media marketing. Keep responses concise and helpful."
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 500,
    }),
  });

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content ?? "Sorry, I could not generate a response.";
  return NextResponse.json({ reply: text });
}

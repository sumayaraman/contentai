import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { message } = await req.json();
  const apiKey = process.env.GEMINI_ASSISTANT_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "No API key" }, { status: 500 });
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are an AI assistant for a social media content platform. Help the user with content ideas, captions, strategies, and anything related to social media marketing. User says: ${message}`
          }]
        }]
      }),
    }
  );

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "Sorry, I could not generate a response.";
  return NextResponse.json({ reply: text });
}

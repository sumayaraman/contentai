import { NextRequest, NextResponse } from "next/server";

const MOCK_REPLIES = [
  "Great idea! For social media content, try leading with a strong hook in the first line — something that stops the scroll.",
  "I'd suggest posting this type of content on Tuesday or Wednesday mornings for maximum engagement.",
  "Consider turning this into a carousel post — they typically get 3x more reach than single images on LinkedIn.",
  "Add a clear CTA at the end: 'Save this for later' or 'Tag someone who needs this' works really well.",
  "Use a mix of niche hashtags (10k–100k posts) and broader ones. Avoid oversaturated tags above 1M.",
];

export async function POST(req: NextRequest) {
  const { message } = await req.json();
  const apiKey = process.env.GROQ_ASSISTANT_KEY;

  if (!apiKey) {
    const reply = MOCK_REPLIES[Math.floor(Math.random() * MOCK_REPLIES.length)];
    return NextResponse.json({ reply, demo: true });
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
          {
            role: "system",
            content: "You are an AI assistant for a social media content platform. Help the user with content ideas, captions, strategies, and anything related to social media marketing. Keep responses concise and helpful.",
          },
          { role: "user", content: message },
        ],
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? "Sorry, I could not generate a response.";
    return NextResponse.json({ reply: text });
  } catch {
    return NextResponse.json({ reply: "Something went wrong. Please try again." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userPrompt =
      body.prompt || body.messages?.[body.messages.length - 1]?.content || "";
    const messages = body.messages || [];

    if (!userPrompt) {
      return NextResponse.json({ reply: "Please type a message!" });
    }

    const groqKey =
      process.env.GROQ_API_KEY || process.env.GROQ_ASSISTANT_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    // System prompt - makes assistant know about ContentAI
    const systemPrompt = `You are ContentAI Assistant - expert in viral hooks, social media strategy, content calendars, reel scripts, copywriting, LinkedIn, Instagram, YouTube.

About ContentAI platform:
- It has 8 Studios: AI Writer, Image Studio, Video Generator, Content Planner, Hashtag Generator, Hook Generator, Reel Maker, Analytics
- Users can generate AI content, images, videos in one place
- You help with: viral hooks, 7-day campaigns, reel storyboards, content scoring, caption writing

Be helpful, concise, give actionable examples. Use bullet points and emojis sparingly.`;

    let reply = "";

    if (groqKey) {
      console.log("Using Groq");
      const conversation = [
        { role: "system", content: systemPrompt },
        ...messages.slice(-6), // last 6 messages for context
        { role: "user", content: userPrompt },
      ].filter(
        (m: { role: string; content: string }) =>
          m.role !== "system" || m.content === systemPrompt
      );

      const res = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: "llama3-8b-8192",
            messages: conversation,
            temperature: 0.7,
            max_tokens: 1024,
          }),
        }
      );
      const data = await res.json();
      console.log("Groq response:", JSON.stringify(data).slice(0, 500));

      if (data.error) {
        console.error("Groq error:", data.error);

        // Retry with backup model if deactivated or missing
        if (
          data.error?.code === "model_deactivated" ||
          data.error?.message?.includes("does not exist") ||
          data.error?.message?.includes("decommissioned") ||
          data.error?.message?.includes("deprecated")
        ) {
          const fallbackModels = [
            "llama-3.3-70b-versatile",
            "mixtral-8x7b-32768",
            "gemma2-9b-it",
          ];

          for (const backupModel of fallbackModels) {
            console.log(`Retrying Groq with backup model: ${backupModel}`);
            const retry = await fetch(
              "https://api.groq.com/openai/v1/chat/completions",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${groqKey}`,
                },
                body: JSON.stringify({
                  model: backupModel,
                  messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt },
                  ],
                  max_tokens: 1024,
                }),
              }
            );
            const retryData = await retry.json();
            if (retryData.choices?.[0]?.message?.content) {
              reply = retryData.choices[0].message.content;
              break;
            }
          }
        }

        if (!reply) {
          return NextResponse.json({
            reply: `Groq Error: ${data.error.message}. Check your API key.`,
          });
        }
      } else {
        reply = data.choices?.[0]?.message?.content || "";
      }
    } else if (openaiKey) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages.slice(-6),
            { role: "user", content: userPrompt },
          ],
          max_tokens: 1024,
        }),
      });
      const data = await res.json();
      if (data.error) {
        return NextResponse.json({
          reply: `OpenAI Error: ${data.error.message}. Check your API key.`,
        });
      }
      reply = data.choices?.[0]?.message?.content || "";
    }

    if (!reply) {
      reply = `I'm your ContentAI Assistant! I can help with:\n\n• **Viral Hooks** - "Give me 5 hooks for X"\n• **Campaigns** - "Create a 7-day launch plan"\n• **Reel Scripts** - "Write a 30s reel about AI tools"\n• **Content Scores** - "Improve my post to 95+"\n• **How ContentAI works** - We have 8 studios to generate text, images, videos\n\n💡 Tip: To enable real-time unlimited AI replies, add GROQ_API_KEY in Vercel Project Settings → Environment Variables (free from console.groq.com)!`;
    }

    return NextResponse.json({ reply });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Chat API Error:", msg);
    return NextResponse.json({
      reply: `Error: ${msg}. I'm still here! Ask me about hooks, campaigns, or how ContentAI works - I have 8 studios for content creation.`,
    });
  }
}

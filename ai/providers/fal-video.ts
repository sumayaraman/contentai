export interface GeneratedVideo {
  url: string;
  provider: string;
  model: string;
}

export class FalVideoProvider {
  async generateVideo(prompt: string): Promise<GeneratedVideo> {
    const apiKey = process.env.FAL_API_KEY;

    // Submit the request
    const submitRes = await fetch("https://queue.fal.run/fal-ai/kling-video/v1.6/standard/text-to-video", {
      method: "POST",
      headers: {
        "Authorization": `Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        duration: "5",
        aspect_ratio: "16:9",
      }),
    });

    const submitted = await submitRes.json();
    const requestId = submitted.request_id;

    // Poll for result
    let result: any = null;
    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, 5000));
      const pollRes = await fetch(`https://queue.fal.run/fal-ai/kling-video/v1.6/standard/text-to-video/requests/${requestId}`, {
        headers: { "Authorization": `Key ${apiKey}` },
      });
      result = await pollRes.json();
      if (result.status === "COMPLETED") break;
      if (result.status === "FAILED") throw new Error("Video generation failed");
    }

    const videoUrl = result?.output?.video?.url;
    if (!videoUrl) throw new Error("No video URL returned");

    return { url: videoUrl, provider: "fal", model: "kling-v1.6" };
  }
}

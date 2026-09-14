import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { createClient } from "@/lib/supabase/server";

type LogoPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";

const GRAVITY_MAP: Record<LogoPosition, string> = {
  "top-left":     "northwest",
  "top-right":    "northeast",
  "bottom-left":  "southwest",
  "bottom-right": "southeast",
  "center":       "center",
};

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      imageBase64,
      logoMediaId,
      position = "bottom-right" as LogoPosition,
      logoSizePercent = 18,
      padding = 24,
    } = body;

    if (!imageBase64 || !logoMediaId) {
      return NextResponse.json(
        { error: "imageBase64 and logoMediaId are required" },
        { status: 400 }
      );
    }

    const { data: logoMedia, error: mediaError } = await supabase
      .from("media")
      .select("storage_path, mime_type")
      .eq("id", logoMediaId)
      .single();

    if (mediaError || !logoMedia) {
      return NextResponse.json(
        { error: "Logo media not found" },
        { status: 404 }
      );
    }

    const { data: signedData, error: signedError } = await supabase.storage
      .from("media")
      .createSignedUrl(logoMedia.storage_path, 120);

    if (signedError || !signedData?.signedUrl) {
      return NextResponse.json(
        { error: "Could not access logo file" },
        { status: 500 }
      );
    }

    const logoResponse = await fetch(signedData.signedUrl);
    if (!logoResponse.ok) {
      return NextResponse.json(
        { error: "Failed to download logo" },
        { status: 500 }
      );
    }
    const logoBuffer = Buffer.from(await logoResponse.arrayBuffer());

    const imageBuffer = Buffer.from(imageBase64, "base64");
    const mainImage   = sharp(imageBuffer);
    const { width: imgWidth = 1024, height: imgHeight = 1024 } =
      await mainImage.metadata();

    const logoTargetWidth = Math.floor(imgWidth * (logoSizePercent / 100));
    const resizedLogo = await sharp(logoBuffer)
      .resize(logoTargetWidth, undefined, { fit: "inside", withoutEnlargement: true })
      .ensureAlpha()
      .toBuffer();

    const { width: logoW = logoTargetWidth, height: logoH = logoTargetWidth } =
      await sharp(resizedLogo).metadata();

    let left = padding;
    let top  = padding;

    if (position === "top-right"   || position === "bottom-right") left = imgWidth  - logoW - padding;
    if (position === "bottom-left" || position === "bottom-right") top  = imgHeight - logoH - padding;
    if (position === "center") {
      left = Math.floor((imgWidth  - logoW) / 2);
      top  = Math.floor((imgHeight - logoH) / 2);
    }

    const watermarked = await mainImage
      .composite([{ input: resizedLogo, left, top, blend: "over" }])
      .jpeg({ quality: 92 })
      .toBuffer();

    return NextResponse.json({
      watermarkedBase64: watermarked.toString("base64"),
      mimeType: "image/jpeg",
    });

  } catch (err) {
    console.error("[watermark] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

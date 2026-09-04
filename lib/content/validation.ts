import type { Platform, PostStatus } from "@/types/database";

export const platforms: Platform[] = ["INSTAGRAM", "FACEBOOK", "LINKEDIN", "X"];
export const statuses: PostStatus[] = ["DRAFT", "SCHEDULED", "PUBLISHED", "FAILED"];

export function normalizeText(value: FormDataEntryValue | null, maxLength: number) {
  const text = typeof value === "string" ? value.trim() : "";
  return text ? text.slice(0, maxLength) : null;
}

export function validatePostForm(formData: FormData) {
  const title = normalizeText(formData.get("title"), 200);
  const caption = normalizeText(formData.get("caption"), 10000);
  const cta = normalizeText(formData.get("cta"), 500);
  const hashtags = normalizeText(formData.get("hashtags"), 2000);
  const imagePrompt = normalizeText(formData.get("image_prompt"), 2000);
  const imageUrl = normalizeText(formData.get("image_url"), 2000);
  const categoryId = normalizeText(formData.get("category_id"), 100);
  const scheduledAtRaw = normalizeText(formData.get("scheduled_at"), 100);
  const platform = normalizeText(formData.get("platform"), 20) as Platform | null;
  const status = normalizeText(formData.get("status"), 20) as PostStatus | null;

  const errors: Record<string, string> = {};
  if (!title) errors.title = "A title is required.";
  if (title && title.length < 2) errors.title = "Title must be at least 2 characters.";
  if (!platform || !platforms.includes(platform)) errors.platform = "Choose a supported platform.";
  if (!status || !statuses.includes(status)) errors.status = "Choose a supported status.";
  if (hashtags && hashtags.length > 2000) errors.hashtags = "Hashtags are too long.";
  if (status === "SCHEDULED" && !scheduledAtRaw) errors.scheduled_at = "A scheduled date is required for scheduled posts.";

  let scheduledAt: string | null = null;
  if (scheduledAtRaw) {
    const parsed = new Date(scheduledAtRaw);
    if (Number.isNaN(parsed.getTime())) errors.scheduled_at = "Enter a valid date and time.";
    else if (status === "SCHEDULED" && parsed.getTime() <= Date.now()) errors.scheduled_at = "Scheduled posts must be set for a future date and time.";
    else scheduledAt = parsed.toISOString();
  }

  return {
    values: { title: title ?? "", caption, cta, hashtags, imagePrompt, imageUrl, categoryId, platform, status, scheduledAt },
    errors,
  };
}

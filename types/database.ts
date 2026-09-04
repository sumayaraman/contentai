export type UserRole = "OWNER" | "ADMIN" | "MEMBER";
export type PostStatus = "DRAFT" | "SCHEDULED" | "PUBLISHED" | "FAILED";
export type Platform = "INSTAGRAM" | "FACEBOOK" | "LINKEDIN" | "X";

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  ai_provider?: "auto" | "mock" | "openai" | "anthropic" | "groq";
}

export interface Category {
  id: string;
  workspace_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Post {
  id: string;
  workspace_id: string;
  created_by: string;
  title: string;
  caption: string | null;
  platform: Platform;
  status: PostStatus;
  category_id: string | null;
  cta: string | null;
  hashtags: string | null;
  image_url: string | null;
  image_prompt: string | null;
  scheduled_at: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}


export interface Media {
  id: string;
  workspace_id: string;
  uploaded_by: string;
  file_name: string;
  mime_type: string;
  file_size: number;
  storage_path: string | null;
  url: string;
  source: "UPLOAD" | "DEMO_FALLBACK" | "AI_GENERATED";
  generation_prompt: string | null;
  generation_provider: string | null;
  generation_model: string | null;
  created_at: string;
}

export interface AIGeneration {
  id: string;
  workspace_id: string;
  user_id: string;
  generation_type: string;
  input: string | null;
  output: string | null;
  provider: string;
  created_at: string;
}

export type CampaignStatus = "DRAFT" | "ADDED_TO_CALENDAR" | "ARCHIVED";
export interface Campaign {
  id: string;
  workspace_id: string;
  created_by: string;
  title: string;
  platform: Platform;
  duration_days: number;
  target_audience: string;
  tone: string;
  goal: string;
  prompt: string;
  provider: string;
  status: CampaignStatus;
  created_at: string;
  updated_at: string;
}
export interface CampaignDay {
  id: string;
  campaign_id: string;
  workspace_id: string;
  post_id: string | null;
  day_number: number;
  content_idea: string;
  hook: string;
  caption: string;
  cta: string;
  hashtags: string[];
  image_prompt: string;
  suggested_date: string;
  created_at: string;
  updated_at: string;
}

export interface Analytics {
  id: string;
  post_id: string;
  platform: Platform;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  impressions: number;
  engagement_rate: number;
  recorded_at: string;
}

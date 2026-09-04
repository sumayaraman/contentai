import type { Platform } from "@/types/database";

export interface AnalyticsPoint {
  date: string;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  impressions: number;
  engagementRate: number;
}

export interface PlatformPerformance {
  platform: Platform;
  posts: number;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  impressions: number;
  engagementRate: number;
}

export interface CategoryPerformance {
  categoryId: string | null;
  categoryName: string;
  posts: number;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  impressions: number;
  engagementRate: number;
}

export interface BestPerformingPost {
  id: string;
  title: string;
  caption: string | null;
  platform: Platform;
  categoryName: string;
  engagementRate: number;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  impressions: number;
  publishedAt: string | null;
  imageUrl: string | null;
}

export interface AnalyticsSummary {
  totalPublishedPosts: number;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  impressions: number;
  engagementRate: number;
}

export interface AnalyticsDashboardData {
  summary: AnalyticsSummary;
  engagementOverTime: AnalyticsPoint[];
  platformPerformance: PlatformPerformance[];
  categoryPerformance: CategoryPerformance[];
  bestPosts: BestPerformingPost[];
}

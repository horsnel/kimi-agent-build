/**
 * Pipeline API Service
 * Fetches articles from the Sigma Pipeline Cloudflare Worker
 * URL: https://sigma-pipeline.odehebuka48.workers.dev
 */

const PIPELINE_URL = 'https://sigma-pipeline.odehebuka48.workers.dev';

export interface PipelineArticleSummary {
  id: string;
  type: string;
  title: string;
  slug: string;
  date: string;
  displayDate: string;
  category: string;
  tags: string[];
  metaDescription: string;
  excerpt: string;
  content?: {
    introduction: string;
    body: string[];
  };
  readingTime: number;
  status?: string;
  source?: string;
  sourceUrl?: string;
  image?: { src: string; alt: string };
}

export interface PipelineArticleList {
  articles: PipelineArticleSummary[];
  count: number;
}

/**
 * Fetch list of published articles from pipeline
 */
export async function fetchPipelineArticles(limit = 50): Promise<PipelineArticleSummary[]> {
  try {
    const res = await fetch(`${PIPELINE_URL}/api/articles?status=published&limit=${limit}`);
    if (!res.ok) return [];
    const data: PipelineArticleList = await res.json();
    return data.articles || [];
  } catch {
    return [];
  }
}

/**
 * Fetch a single article by slug from pipeline
 */
export async function fetchPipelineArticle(slug: string): Promise<PipelineArticleSummary | null> {
  try {
    const res = await fetch(`${PIPELINE_URL}/api/articles/${slug}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Get pipeline manifest (article count, last update)
 */
export async function fetchPipelineManifest(): Promise<{
  lastUpdated: string | null;
  articleCount: number;
  categories: string[];
} | null> {
  try {
    const res = await fetch(`${PIPELINE_URL}/api/manifest`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

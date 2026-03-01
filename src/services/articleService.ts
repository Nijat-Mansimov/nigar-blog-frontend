const API_BASE_URL = import.meta.env.VITE_API_URL || "https://nigar-blog-backend.onrender.com/api";

interface ArticleTranslation {
  title: string;
  subtitle: string;
  excerpt: string;
  body: string;
}

export interface Article {
  _id?: string;
  id?: string;
  slug: string;
  translations: {
    en: ArticleTranslation;
    az: ArticleTranslation;
    ru: ArticleTranslation;
    tr: ArticleTranslation;
  };
  date: string;
  category: string;
  featured?: boolean;
  readingTime: number;
  views?: number;
  image?: string;
  defaultLanguage?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  total?: number;
  error?: string;
}

// Helper to map API response to Article interface
const mapArticle = (data: any): Article => ({
  id: data._id || data.id,
  slug: data.slug,
  translations: data.translations || {
    en: {
      title: data.title || "",
      subtitle: data.subtitle || "",
      excerpt: data.excerpt || "",
      body: data.body || "",
    },
    az: {
      title: data.title || "",
      subtitle: data.subtitle || "",
      excerpt: data.excerpt || "",
      body: data.body || "",
    },
    ru: {
      title: data.title || "",
      subtitle: data.subtitle || "",
      excerpt: data.excerpt || "",
      body: data.body || "",
    },
    tr: {
      title: data.title || "",
      subtitle: data.subtitle || "",
      excerpt: data.excerpt || "",
      body: data.body || "",
    },
  },
  date: data.date,
  category: data.category,
  featured: data.featured,
  readingTime: data.readingTime,
  views: data.views,
  image: data.image,
  defaultLanguage: data.defaultLanguage,
});

export const articleService = {
  // Get all articles
  async getAllArticles(): Promise<Article[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/articles`);
      if (!response.ok) throw new Error("Failed to fetch articles");
      const result: ApiResponse<any[]> = await response.json();
      return result.data.map(mapArticle);
    } catch (error) {
      console.error("Error fetching articles:", error);
      return [];
    }
  },

  // Get featured article
  async getFeaturedArticle(): Promise<Article | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/articles/featured`);
      if (!response.ok) throw new Error("Failed to fetch featured article");
      const result: ApiResponse<any> = await response.json();
      return mapArticle(result.data);
    } catch (error) {
      console.error("Error fetching featured article:", error);
      return null;
    }
  },

  // Get single article by slug
  async getArticleBySlug(slug: string): Promise<Article | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/articles/${slug}`);
      if (!response.ok) throw new Error("Failed to fetch article");
      const result: ApiResponse<any> = await response.json();
      return mapArticle(result.data);
    } catch (error) {
      console.error(`Error fetching article ${slug}:`, error);
      return null;
    }
  },

  // Get view count for article
  async getViewCount(slug: string): Promise<number> {
    try {
      const response = await fetch(`${API_BASE_URL}/articles/${slug}/views`);
      if (!response.ok) throw new Error("Failed to fetch view count");
      const result: ApiResponse<{ slug: string; views: number }> = await response.json();
      return result.data.views;
    } catch (error) {
      console.error(`Error fetching view count for ${slug}:`, error);
      return 0;
    }
  },

  // Increment view count
  async incrementViewCount(slug: string): Promise<number> {
    try {
      const response = await fetch(`${API_BASE_URL}/articles/${slug}/views`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to increment view count");
      const result: ApiResponse<{ slug: string; views: number }> = await response.json();
      return result.data.views;
    } catch (error) {
      console.error(`Error incrementing view count for ${slug}:`, error);
      return 0;
    }
  },

  // Get all categories
  async getCategories(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (!response.ok) throw new Error("Failed to fetch categories");
      const result: ApiResponse<any[]> = await response.json();
      return result.data || [];
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  },
};

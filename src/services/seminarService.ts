const API_BASE_URL = import.meta.env.VITE_API_URL || "https://nigar-blog-backend.onrender.com/api";

interface SeminarTranslation {
  title: string;
  description: string;
}

export interface Seminar {
  _id?: string;
  id?: string;
  slug: string;
  translations: {
    en: SeminarTranslation;
    az: SeminarTranslation;
    ru: SeminarTranslation;
    tr: SeminarTranslation;
  };
  topic: string;
  startDateTime: string;
  endDateTime: string;
  format: "online" | "offline" | "hybrid";
  location?: string;
  platformLink?: string;
  registrationLink?: string;
  coverImage?: string;
  views?: number;
  status: "upcoming" | "completed";
  published: boolean;
  defaultLanguage?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  total?: number;
  error?: string;
  message?: string;
}

const mapSeminar = (data: any): Seminar => ({
  id: data._id || data.id,
  slug: data.slug,
  translations: data.translations || {
    en: {
      title: data.title || "",
      description: data.description || "",
    },
    az: {
      title: data.title || "",
      description: data.description || "",
    },
    ru: {
      title: data.title || "",
      description: data.description || "",
    },
    tr: {
      title: data.title || "",
      description: data.description || "",
    },
  },
  topic: data.topic || "",
  startDateTime: data.startDateTime || "",
  endDateTime: data.endDateTime || "",
  format: data.format || "online",
  location: data.location,
  platformLink: data.platformLink,
  registrationLink: data.registrationLink,
  coverImage: data.coverImage,
  views: data.views || 0,
  status: data.status || "upcoming",
  published: data.published || false,
  defaultLanguage: data.defaultLanguage,
});

export const seminarService = {
  // Get all published seminars
  async getAll(): Promise<Seminar[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/seminars`);
      const result: ApiResponse<Seminar[]> = await response.json();
      if (!result.success) throw new Error(result.error || "Failed to fetch seminars");
      return result.data.map(mapSeminar);
    } catch (error) {
      console.error("Error fetching seminars:", error);
      throw error;
    }
  },

  // Get seminar by slug
  async getBySlug(slug: string): Promise<Seminar> {
    try {
      const response = await fetch(`${API_BASE_URL}/seminars/${slug}`);
      const result: ApiResponse<any> = await response.json();
      if (!result.success) throw new Error(result.error || "Failed to fetch seminar");
      return mapSeminar(result.data);
    } catch (error) {
      console.error(`Error fetching seminar ${slug}:`, error);
      throw error;
    }
  },

  // Get seminar by ID (admin)
  async getById(id: string, token: string): Promise<Seminar> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/seminars/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result: ApiResponse<any> = await response.json();
      if (!result.success) throw new Error(result.error || "Failed to fetch seminar");
      return mapSeminar(result.data);
    } catch (error) {
      console.error(`Error fetching seminar ${id}:`, error);
      throw error;
    }
  },

  // Get all seminars for admin
  async getAdminList(token: string): Promise<Seminar[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/seminars`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result: ApiResponse<Seminar[]> = await response.json();
      if (!result.success) throw new Error(result.error || "Failed to fetch seminars");
      return result.data.map(mapSeminar);
    } catch (error) {
      console.error("Error fetching seminars:", error);
      throw error;
    }
  },

  // Create seminar
  async create(seminarData: Partial<Seminar>, token: string): Promise<Seminar> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/seminars`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(seminarData),
      });
      const result: ApiResponse<any> = await response.json();
      if (!result.success) throw new Error(result.error || "Failed to create seminar");
      return mapSeminar(result.data);
    } catch (error) {
      console.error("Error creating seminar:", error);
      throw error;
    }
  },

  // Update seminar
  async update(id: string, seminarData: Partial<Seminar>, token: string): Promise<Seminar> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/seminars/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(seminarData),
      });
      const result: ApiResponse<any> = await response.json();
      if (!result.success) throw new Error(result.error || "Failed to update seminar");
      return mapSeminar(result.data);
    } catch (error) {
      console.error("Error updating seminar:", error);
      throw error;
    }
  },

  // Delete seminar
  async delete(id: string, token: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/seminars/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result: ApiResponse<null> = await response.json();
      if (!result.success) throw new Error(result.error || "Failed to delete seminar");
    } catch (error) {
      console.error("Error deleting seminar:", error);
      throw error;
    }
  },

  // Upload image
  async uploadImage(imageData: string, token: string): Promise<{ url: string; name: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ image: imageData }),
      });
      const result: ApiResponse<{ url: string; name: string }> = await response.json();
      if (!result.success) throw new Error(result.error || "Failed to upload image");
      return result.data;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  },

  // Increment view count
  async incrementViews(slug: string): Promise<number> {
    try {
      const response = await fetch(`${API_BASE_URL}/seminars/${slug}/views`, {
        method: "POST",
      });
      const result: ApiResponse<{ slug: string; views: number }> = await response.json();
      if (!result.success) throw new Error(result.error || "Failed to increment views");
      return result.data.views;
    } catch (error) {
      console.error("Error incrementing views:", error);
      throw error;
    }
  },

  // Get view count
  async getViews(slug: string): Promise<number> {
    try {
      const response = await fetch(`${API_BASE_URL}/seminars/${slug}/views`);
      const result: ApiResponse<{ slug: string; views: number }> = await response.json();
      if (!result.success) throw new Error(result.error || "Failed to fetch views");
      return result.data.views;
    } catch (error) {
      console.error("Error fetching views:", error);
      return 0;
    }
  },
};

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://nigar-blog-backend.onrender.com/api";

export interface ArticleTranslation {
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

interface LoginResponse {
  success: boolean;
  data?: {
    accessToken: string;
    refreshToken: string;
    admin: { username: string };
  };
  error?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export const adminService = {
  // Get stored access token
  getAccessToken(): string | null {
    return localStorage.getItem("adminAccessToken");
  },

  // Get stored refresh token
  getRefreshToken(): string | null {
    return localStorage.getItem("adminRefreshToken");
  },

  // Set tokens
  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem("adminAccessToken", accessToken);
    localStorage.setItem("adminRefreshToken", refreshToken);
  },

  // Clear tokens
  clearTokens(): void {
    localStorage.removeItem("adminAccessToken");
    localStorage.removeItem("adminRefreshToken");
  },

  // Check if token is about to expire (within 5 minutes)
  isTokenExpiringSoon(): boolean {
    // Since we're using JWT with 1h expiration, we check if more than 55 minutes have passed
    const tokenTime = localStorage.getItem("adminTokenTime");
    if (!tokenTime) return true;
    
    const elapsed = Date.now() - parseInt(tokenTime);
    return elapsed > 55 * 60 * 1000; // 55 minutes
  },

  // Refresh access token
  async refreshAccessToken(): Promise<boolean> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) return false;

      const response = await fetch(`${API_BASE_URL}/admin/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      const result: ApiResponse<{ accessToken: string }> = await response.json();

      if (result.success && result.data?.accessToken) {
        localStorage.setItem("adminAccessToken", result.data.accessToken);
        localStorage.setItem("adminTokenTime", Date.now().toString());
        return true;
      }

      return false;
    } catch (error) {
      console.error("Token refresh error:", error);
      return false;
    }
  },

  // Ensure valid token before making requests
  async ensureValidToken(): Promise<boolean> {
    const token = this.getAccessToken();
    if (!token) return false;

    if (this.isTokenExpiringSoon()) {
      return await this.refreshAccessToken();
    }

    return true;
  },

  // Login
  async login(username: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const result: LoginResponse = await response.json();

      if (result.success && result.data?.accessToken && result.data?.refreshToken) {
        this.setTokens(result.data.accessToken, result.data.refreshToken);
        localStorage.setItem("adminTokenTime", Date.now().toString());
      }

      return result;
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Login failed" };
    }
  },

  // Verify token
  async verifyToken(): Promise<boolean> {
    try {
      if (!await this.ensureValidToken()) return false;

      const token = this.getAccessToken();
      const response = await fetch(`${API_BASE_URL}/admin/verify`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result: ApiResponse<{ authenticated: boolean }> = await response.json();
      return result.success;
    } catch {
      return false;
    }
  },

  // Create article
  async createArticle(article: Omit<Article, "id" | "views">): Promise<ApiResponse<Article>> {
    try {
      if (!await this.ensureValidToken()) {
        return { success: false, error: "Authentication required" };
      }

      const token = this.getAccessToken();
      const response = await fetch(`${API_BASE_URL}/admin/articles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(article),
      });
      return await response.json();
    } catch (error) {
      console.error("Error creating article:", error);
      return { success: false, error: "Failed to create article" };
    }
  },

  // Get all articles (admin view)
  async getAllArticles(): Promise<ApiResponse<Article[]>> {
    try {
      if (!await this.ensureValidToken()) {
        return { success: false, error: "Authentication required" };
      }

      const token = this.getAccessToken();
      const response = await fetch(`${API_BASE_URL}/admin/articles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return await response.json();
    } catch (error) {
      console.error("Error fetching articles:", error);
      return { success: false, error: "Failed to fetch articles" };
    }
  },

  // Get single article (admin view)
  async getArticle(id: string): Promise<ApiResponse<Article>> {
    try {
      if (!await this.ensureValidToken()) {
        return { success: false, error: "Authentication required" };
      }

      const token = this.getAccessToken();
      const response = await fetch(`${API_BASE_URL}/admin/articles/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return await response.json();
    } catch (error) {
      console.error("Error fetching article:", error);
      return { success: false, error: "Failed to fetch article" };
    }
  },

  // Update article
  async updateArticle(id: string, article: Partial<Article>): Promise<ApiResponse<Article>> {
    try {
      if (!await this.ensureValidToken()) {
        return { success: false, error: "Authentication required" };
      }

      const token = this.getAccessToken();
      const response = await fetch(`${API_BASE_URL}/admin/articles/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(article),
      });
      return await response.json();
    } catch (error) {
      console.error("Error updating article:", error);
      return { success: false, error: "Failed to update article" };
    }
  },

  // Delete article
  async deleteArticle(id: string): Promise<ApiResponse<null>> {
    try {
      if (!await this.ensureValidToken()) {
        return { success: false, error: "Authentication required" };
      }

      const token = this.getAccessToken();
      const response = await fetch(`${API_BASE_URL}/admin/articles/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      return await response.json();
    } catch (error) {
      console.error("Error deleting article:", error);
      return { success: false, error: "Failed to delete article" };
    }
  },

  // Upload image
  async uploadImage(base64Data: string): Promise<ApiResponse<{ url: string; name: string }>> {
    try {
      if (!await this.ensureValidToken()) {
        return { success: false, error: "Authentication required" };
      }

      const token = this.getAccessToken();
      const response = await fetch(`${API_BASE_URL}/admin/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ image: base64Data }),
      });
      return await response.json();
    } catch (error) {
      console.error("Error uploading image:", error);
      return { success: false, error: "Failed to upload image" };
    }
  },

  // Get all categories
  async getCategories(): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching categories:", error);
      return { success: false, error: "Failed to fetch categories" };
    }
  },

  // Create category
  async createCategory(name: string, slug: string, description: string): Promise<ApiResponse<any>> {
    try {
      if (!await this.ensureValidToken()) {
        return { success: false, error: "Authentication required" };
      }

      const token = this.getAccessToken();
      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, slug, description }),
      });
      return await response.json();
    } catch (error) {
      console.error("Error creating category:", error);
      return { success: false, error: "Failed to create category" };
    }
  },

  // Update category
  async updateCategory(id: string, name: string, slug: string, description: string): Promise<ApiResponse<any>> {
    try {
      if (!await this.ensureValidToken()) {
        return { success: false, error: "Authentication required" };
      }

      const token = this.getAccessToken();
      const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, slug, description }),
      });
      return await response.json();
    } catch (error) {
      console.error("Error updating category:", error);
      return { success: false, error: "Failed to update category" };
    }
  },

  // Delete category
  async deleteCategory(id: string): Promise<ApiResponse<null>> {
    try {
      if (!await this.ensureValidToken()) {
        return { success: false, error: "Authentication required" };
      }

      const token = this.getAccessToken();
      const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      return await response.json();
    } catch (error) {
      console.error("Error deleting category:", error);
      return { success: false, error: "Failed to delete category" };
    }
  },

  // Logout
  async logout(): Promise<void> {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      try {
        await fetch(`${API_BASE_URL}/admin/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
    this.clearTokens();
  },

  // Change password
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse<null>> {
    try {
      if (!await this.ensureValidToken()) {
        return { success: false, error: "Authentication required" };
      }

      const token = this.getAccessToken();
      const response = await fetch(`${API_BASE_URL}/admin/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      return await response.json();
    } catch (error) {
      console.error("Error changing password:", error);
      return { success: false, error: "Failed to change password" };
    }
  },

  // Get site settings (public)
  async getSettings(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/settings`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching settings:", error);
      return { success: false, error: "Failed to fetch settings" };
    }
  },

  // Update site settings (admin only)
  async updateSettings(settings: any): Promise<ApiResponse<any>> {
    try {
      if (!await this.ensureValidToken()) {
        return { success: false, error: "Authentication required" };
      }

      const token = this.getAccessToken();
      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      return await response.json();
    } catch (error) {
      console.error("Error updating settings:", error);
      return { success: false, error: "Failed to update settings" };
    }
  },
};

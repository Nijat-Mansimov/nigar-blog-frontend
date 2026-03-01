import { useEffect } from "react";
import { adminService } from "@/services/adminService";

/**
 * Hook to manage authentication and auto-refresh tokens
 * Call this in your root layout or App component to ensure tokens stay fresh
 */
export const useAuth = () => {
  useEffect(() => {
    // Check and refresh token on component mount
    const checkToken = async () => {
      if (adminService.getAccessToken()) {
        await adminService.ensureValidToken();
      }
    };

    checkToken();

    // Set up a timer to refresh token every 50 minutes (before the 1h expiration)
    const refreshInterval = setInterval(async () => {
      const hasToken = adminService.getAccessToken();
      if (hasToken) {
        await adminService.refreshAccessToken();
      }
    }, 50 * 60 * 1000); // 50 minutes

    return () => clearInterval(refreshInterval);
  }, []);

  return {
    getToken: () => adminService.getAccessToken(),
    logout: () => adminService.logout(),
  };
};

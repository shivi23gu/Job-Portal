import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Safely extracts user-friendly error messages from API responses.
 */
export const getErrorMessage = (
  error,
  fallback = "An unexpected error occurred.",
) => {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  if (error.response?.data?.message) return error.response.data.message;
  if (
    error.response?.data?.errors &&
    Array.isArray(error.response.data.errors) &&
    error.response.data.errors.length > 0
  ) {
    return error.response.data.errors.join(", ");
  }
  if (error.message) return error.message;
  return fallback;
};

// Response Interceptor for Centralized Authentication & Error Handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || "";

    // Handle 401 Unauthorized
    if (status === 401) {
      // Exclude /api/auth/me (initial verification) and /api/auth/logout from triggering global redirect
      const isAuthCheck =
        requestUrl.includes("/api/auth/me") ||
        requestUrl.includes("/api/auth/logout");

      if (!isAuthCheck) {
        // Dispatch unauthorized event so AuthContext resets user state
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));

        // Only redirect to /login if currently on a protected route
        const currentPath = window.location.pathname;
        const publicPaths = ["/login", "/register", "/", "/jobs"];
        const isPublicPath =
          publicPaths.includes(currentPath) || currentPath.startsWith("/jobs/");

        if (!isPublicPath) {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  },
);

export default api;

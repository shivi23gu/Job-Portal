import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api, { getErrorMessage } from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const { data } = await api.get("/api/auth/me");
      setUser(data.user || data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();

    // Listen for unauthorized 401 events dispatched by Axios response interceptor
    const handleUnauthorized = () => {
      setUser(null);
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [fetchUser]);

  const login = async (email, password) => {
    const { data } = await api.post("/api/auth/login", { email, password });
    const userData = data.user || data;
    setUser(userData);
    return data;
  };

  const register = async (userData) => {
    const { data } = await api.post("/api/auth/register", userData);
    const registeredUser = data.user || data;
    setUser(registeredUser);
    return data;
  };

  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (err) {
      console.error("Logout request error:", getErrorMessage(err));
    } finally {
      setUser(null);
    }
  };

  const updateUser = (updatedUser) => setUser(updatedUser);

  return (
    <AuthContext.Provider
      value={{
        user,
        token: Boolean(user),
        loading,
        login,
        register,
        logout,
        updateUser,
        fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

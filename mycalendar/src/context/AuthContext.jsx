import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { setToken as setApiToken, loginUser, registerUser } from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);   // { id, email, fullName }
  const [token, setToken] = useState(null); // jwt
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken) {
      setToken(savedToken);
      setApiToken(savedToken);
    }
    if (savedUser) {
      try { setUser(JSON.parse(savedUser)); } catch {}
    }
    setLoading(false);
  }, []);

  const login = async ({ email, password }) => {
    const data = await loginUser({ email, password });
    if (!data || data.error) return { error: data?.error || "Login failed" };
    if (!data.token || !data.user) return { error: "Invalid response" };

    setToken(data.token);
    setUser(data.user);
    setApiToken(data.token);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    return { ok: true };
  };

  const register = async ({ fullName, email, password }) => {
    const data = await registerUser({ fullName, email, password });
    if (data?.error) return { error: data.error };

    if (data?.token && data?.user) {
      setToken(data.token);
      setUser(data.user);
      setApiToken(data.token);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }
    return { ok: true };
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setApiToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const value = useMemo(() => ({ user, token, loading, login, register, logout }), [user, token, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

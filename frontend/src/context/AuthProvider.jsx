import { useCallback, useEffect, useMemo, useState } from "react";
import client, {
  clearToken,
  getToken,
  setToken,
  setUnauthorizedHandler,
} from "../api/client";
import { AuthContext } from "./auth-context";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // If a token exists we must ask the server who it belongs to before
  // deciding whether the user is logged in, so we start in the "loading" state.
  const [isLoading, setIsLoading] = useState(() => Boolean(getToken()));

  // Log out locally: forget the token and the user
  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  // Restore the session after a page refresh
  useEffect(() => {
    if (!getToken()) return;

    let cancelled = false;
    client
      .get("/api/auth/me")
      .then(({ data }) => {
        if (!cancelled) setUser(data.user);
      })
      .catch(() => {
        // Invalid or expired token (or server down): treat as logged out
        if (!cancelled) {
          clearToken();
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // If any protected request later returns 401, log out automatically
  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const login = useCallback(async (email, password) => {
    const { data } = await client.post("/api/auth/login", { email, password });
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (values) => {
    const { data } = await client.post("/api/auth/register", values);
    return data;
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, login, register, logout }),
    [user, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

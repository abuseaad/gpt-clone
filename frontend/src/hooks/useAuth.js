import { useContext } from "react";
import { AuthContext } from "../context/auth-context";

// Usage: const { user, login, register, logout, isLoading } = useAuth();
export default function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}

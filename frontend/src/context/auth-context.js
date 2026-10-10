import { createContext } from "react";

// Holds: user, isLoading, login, register, logout (see AuthProvider.jsx)
export const AuthContext = createContext(null);

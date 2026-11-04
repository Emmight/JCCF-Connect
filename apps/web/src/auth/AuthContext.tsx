
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { apiRequest } from "../api/client";

export type AdminRole = "super_admin" | "admin" | "media_team";

export type AdminUser = {
  id: number;
  fullName: string;
  email: string;
  role: AdminRole;
};

type AuthContextType = {
  user: AdminUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data: T;
};

type LoginResponse = ApiEnvelope<{
  token: string;
  user: AdminUser;
}>;

type MeResponse = ApiEnvelope<AdminUser>;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "jccf_admin_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    sessionStorage.getItem(TOKEN_KEY)
  );
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

 const login = useCallback(async (email: string, password: string) => {
  const response = await apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  const { token, user } = response.data ?? {};

  if (!token || !user) {
    throw new Error("The server returned an invalid login response.");
  }

  sessionStorage.setItem(TOKEN_KEY, token);
  setToken(token);
  setUser(user);
}, []);

  useEffect(() => {
    let cancelled = false;

    async function validateSession() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
       const response = await apiRequest<MeResponse>("/auth/me", { token });

if (!cancelled) {
  setUser(response.data);
}
      } catch {
        if (!cancelled) {
          logout();
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    validateSession();

    return () => {
      cancelled = true;
    };
  }, [token, logout]);

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}

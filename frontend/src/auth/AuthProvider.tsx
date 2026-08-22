import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getCurrentUser,
  loginUser,
  logoutUser,
  type AuthUser,
} from "../api/auth";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    void getCurrentUser()
      .then((currentUser) => {
        if (isActive) {
          setUser(currentUser);
        }
      })
      .catch(() => {
        if (isActive) {
          setSessionError("Session status could not be checked. Public pages are still available.");
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await loginUser({ email, password });
    setUser(response.user);
    setSessionError(null);
    return response.user;
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, sessionError, login, logout }),
    [user, isLoading, sessionError, login, logout],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

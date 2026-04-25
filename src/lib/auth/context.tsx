"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface User {
  email: string;
  loggedInAt: number;
}

interface UserContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string) => User;
  logout: () => void;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  loading: true,
  login: () => ({ email: "", loggedInAt: 0 }),
  logout: () => {},
});

const STORAGE_KEY = "adaalatai.user";

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as User;
        if (parsed?.email) setUser(parsed);
      }
    } catch {
      // ignore corrupted storage
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback((email: string) => {
    const u: User = { email: email.trim().toLowerCase(), loggedInAt: Date.now() };
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    }
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setUser(null);
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  return useContext(UserContext);
}

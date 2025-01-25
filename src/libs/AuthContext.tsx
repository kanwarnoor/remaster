"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { jwtDecode } from "jwt-decode";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";

interface User {
  username: string;
  email: string;
  id: string;
}

interface AuthContextType {
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      const decodedUser = jwtDecode<User>(token);
      setUser(decodedUser);
    }
  }, [pathname]);

  const login = (token: string) => {
    Cookies.set("token", token);
    const decodedUser = jwtDecode<User>(token);
    setUser(decodedUser);
    router.push("/");
  };

  const logout = () => {
    Cookies.remove("token");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

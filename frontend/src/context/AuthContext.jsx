/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "../api/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [user, setUser] = useState(() => {

    const savedUser = localStorage.getItem("user");

    return savedUser ? JSON.parse(savedUser) : null;

  });

  const [token, setToken] = useState(() => {

    return localStorage.getItem("token");

  });

  // ==========================================
  // Restore Session
  // ==========================================

  useEffect(() => {

    if (token) {

      api.defaults.headers.common.Authorization =
        `Bearer ${token}`;

    } else {

      delete api.defaults.headers.common.Authorization;

    }

  }, [token]);

  // ==========================================
  // Login
  // ==========================================

  const login = (userData, jwtToken) => {

    setUser(userData);

    setToken(jwtToken);

    localStorage.setItem(
      "user",
      JSON.stringify(userData)
    );

    localStorage.setItem(
      "token",
      jwtToken
    );

    api.defaults.headers.common.Authorization =
      `Bearer ${jwtToken}`;

  };

  // ==========================================
  // Logout
  // ==========================================

  const logout = () => {

    setUser(null);

    setToken(null);

    localStorage.removeItem("user");

    localStorage.removeItem("token");

    delete api.defaults.headers.common.Authorization;

  };

  // ==========================================
  // Context Value
  // ==========================================

  const value = useMemo(() => ({

    user,

    token,

    login,

    logout,

    isAuthenticated: !!token,

    isHR: user?.role === "HR",

    isManager: user?.role === "MANAGER",

    isEmployee: user?.role === "EMPLOYEE",

  }), [user, token]);

  return (

    <AuthContext.Provider value={value}>

      {children}

    </AuthContext.Provider>

  );

}

export function useAuth() {

  return useContext(AuthContext);

}
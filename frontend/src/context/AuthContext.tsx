import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

interface AuthContextType {
  token: string | null;
  username: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  username: null,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('clipvault_token'));
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem('clipvault_user'));

  const logout = () => {
    localStorage.removeItem('clipvault_token');
    localStorage.removeItem('clipvault_user');
    setToken(null);
    setUsername(null);
  };

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('clipvault:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('clipvault:unauthorized', handleUnauthorized);
  }, []);

  const login = async (user: string, pass: string) => {
    const res = await api.signin(user, pass);
    localStorage.setItem('clipvault_token', res.token);
    localStorage.setItem('clipvault_user', user);
    setToken(res.token);
    setUsername(user);
  };

  const register = async (user: string, pass: string) => {
    await api.signup(user, pass);
    // Automatically sign in upon registration
    await login(user, pass);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        username,
        isAuthenticated: !!token,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

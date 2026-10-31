import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types/index.ts';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStudent: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role?: 'student' | 'admin';
    enrollmentNo?: string;
    department?: string;
    semester?: number;
  }) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('campus360_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Authenticated fetch wrapper
  const authFetch = useCallback(async (url: string, options: RequestInit = {}): Promise<Response> => {
    const currentToken = localStorage.getItem('campus360_token');
    const headers = new Headers(options.headers || {});
    
    if (currentToken) {
      headers.set('Authorization', `Bearer ${currentToken}`);
    }
    headers.set('Content-Type', 'application/json');

    const res = await fetch(url, {
      ...options,
      headers
    });

    if (res.status === 401) {
      // If token is invalid or expired, clear user state
      localStorage.removeItem('campus360_token');
      setToken(null);
      setUser(null);
    }

    return res;
  }, []);

  // Check current session on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('campus360_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setUser(data.user);
            setToken(storedToken);
          } else {
            localStorage.removeItem('campus360_token');
            setToken(null);
            setUser(null);
          }
        } else {
          localStorage.removeItem('campus360_token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Session initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.message || 'Login failed. Please verify your credentials.'
        };
      }

      localStorage.setItem('campus360_token', data.token);
      setToken(data.token);
      setUser(data.user);

      return {
        success: true,
        message: data.message || 'Login successful!'
      };
    } catch (err: any) {
      return {
        success: false,
        message: 'Network error or server unreachable. Please try again.'
      };
    }
  };

  const register = async (userData: {
    name: string;
    email: string;
    password: string;
    role?: 'student' | 'admin';
    enrollmentNo?: string;
    department?: string;
    semester?: number;
  }): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.message || 'Registration failed.'
        };
      }

      localStorage.setItem('campus360_token', data.token);
      setToken(data.token);
      setUser(data.user);

      return {
        success: true,
        message: data.message || 'Account registered successfully!'
      };
    } catch (err: any) {
      return {
        success: false,
        message: 'Network error during registration. Please try again.'
      };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      // ignore
    } finally {
      localStorage.removeItem('campus360_token');
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isStudent: user?.role === 'student',
        login,
        register,
        logout,
        authFetch
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

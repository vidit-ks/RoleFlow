import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('roleflow_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('roleflow_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('roleflow_token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          if (res?.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('roleflow_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('[Auth Initialization]: Session expired or invalid.');
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    const { user: loggedInUser, token: authToken } = res.data;
    setUser(loggedInUser);
    setToken(authToken);
    localStorage.setItem('roleflow_token', authToken);
    localStorage.setItem('roleflow_user', JSON.stringify(loggedInUser));
    return loggedInUser;
  };

  const register = async (name, email, password) => {
    const res = await authService.register(name, email, password);
    return res;
  };

  const demoLogin = async (targetRole) => {
    let email = 'employee@roleflow.demo';
    if (targetRole === 'admin') email = 'admin@roleflow.demo';
    if (targetRole === 'manager') email = 'manager@roleflow.demo';

    return await login(email, 'RoleflowDemo123!');
  };

  const logout = () => {
    authService.logout().catch(() => {});
    setUser(null);
    setToken(null);
    localStorage.removeItem('roleflow_token');
    localStorage.removeItem('roleflow_user');
  };

  const updateUserState = (updatedUser) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedUser };
      localStorage.setItem('roleflow_user', JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        token,
        isAuthenticated: !!user && !!token,
        loading,
        login,
        register,
        demoLogin,
        logout,
        updateUserState
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

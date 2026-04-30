import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/axiosConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On startup, verify the stored token is still valid against the backend.
  // This catches expired JWTs that localStorage would otherwise accept blindly.
  useEffect(() => {
    const token = localStorage.getItem('jobflow_token');
    const storedUser = localStorage.getItem('jobflow_user');

    if (!token || !storedUser) {
      setLoading(false);
      return;
    }

    // Optimistically set user from storage for instant UI, then verify
    try {
      setUser(JSON.parse(storedUser));
    } catch {
      localStorage.removeItem('jobflow_token');
      localStorage.removeItem('jobflow_user');
      setLoading(false);
      return;
    }

    // Silently verify token is still valid — if not, the 401 interceptor
    // in axiosConfig.js will clear storage and redirect to /login automatically.
    authAPI.getMe()
      .then(({ data }) => {
        // Refresh user data from server in case it changed
        if (data?.user) {
          setUser(data.user);
          localStorage.setItem('jobflow_user', JSON.stringify(data.user));
        }
      })
      .catch(() => {
        // 401 interceptor handles cleanup & redirect — nothing to do here
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('jobflow_token', token);
    localStorage.setItem('jobflow_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('jobflow_token');
    localStorage.removeItem('jobflow_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

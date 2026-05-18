import { useState } from 'react';
import { AuthContext } from './AuthContextObject';
import { loginDemoUser } from '../api';
import { API_BASE_URL } from '../config';

const demoCredentials = {
  'seeker@test.com': { password: '123456', type: 'seeker' },
  'employer@test.com': { password: '123456', type: 'employer' },
  'admin@test.com': { password: '123456', type: 'admin' },
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const setSession = (sessionToken, sessionUser) => {
    setToken(sessionToken);
    setUser(sessionUser);
    localStorage.setItem('token', sessionToken);
    localStorage.setItem('user', JSON.stringify(sessionUser));
  };

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      const demoAccount = demoCredentials[email.trim().toLowerCase()];
      if (demoAccount && demoAccount.password === password) {
        const demoUser = loginDemoUser(demoAccount.type);
        setSession(`demo-${demoAccount.type}-token`, demoUser);
        return { success: true, user: demoUser };
      }

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.msg || 'Login failed');
      }

      setSession(data.token, data.user);
      return { success: true, user: data.user };
    } catch (err) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role) => {
    try {
      setError(null);
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.msg || 'Registration failed');
      }

      setSession(data.token, data.user);
      return { success: true, user: data.user };
    } catch (err) {
      const errorMessage = err.message || 'Registration failed. Use the demo accounts if the backend is off.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: Boolean(token),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

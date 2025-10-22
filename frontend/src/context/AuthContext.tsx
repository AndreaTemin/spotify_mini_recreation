import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

// Define the shape of our auth state and context
interface AuthContextType {
  token: string | null;
  user: { email: string; id: number } | null;
  login: (token: string, user: { email: string; id: number }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the props for the provider
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<{ email: string; id: number } | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    // This effect runs when the component mounts or token/user changes.
    // It syncs the state with localStorage and our API client.
    
    if (token && user) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Configure the API client to use this token for all future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token, user]);

  const login = (newToken: string, newUser: { email: string; id: number }) => {
    setToken(newToken);
    setUser(newUser);
    navigate('/'); // Redirect to home page on login
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    navigate('/login'); // Redirect to login page on logout
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a custom hook for easy access to the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import authService from '@/services/auth';
import toast from 'react-hot-toast';

interface User {
  id?: string;
  username: string;
  email: string;
  name: string;
  role: string;
  credits: number;
  profile_picture?: string;
  plan?: string;
  member_since?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  register: (user: { username: string; email: string; name: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUserInContext: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      console.log('Refreshing user data...');
      const userData: any = await authService.getCurrentUser();
      
      const userWithId: User = {
        id: userData.id || userData.username,
        username: userData.username,
        email: userData.email,
        name: userData.name,
        role: userData.role || 'user',
        credits: userData.credits,
        profile_picture: userData.profile_picture,
        plan: userData.plan,
        member_since: userData.member_since
      };

      setUser(userWithId);
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('User data refreshed:', userWithId);
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  }, []);

  const updateUserInContext = useCallback((updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      console.log('User updated in context:', updates);
    }
  }, [user]);

  const login = useCallback(async (credentials: { username: string; password: string }) => {
    try {
      console.log('Logging in user:', credentials.username);
      const response: any = await authService.login(credentials as any);
      
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      const userWithId: User = {
        id: response.user.id || response.user.username,
        ...response.user
      };
      
      setUser(userWithId);
      console.log('User logged in with role:', response.user.role);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, []);

  const register = useCallback(async (payload: { username: string; email: string; name: string; password: string }) => {
    try {
      console.log('Registering user:', payload.username);
      const response: any = await authService.register(payload as any);
      
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      const userWithId: User = {
        id: response.user.id || response.user.username,
        ...response.user
      };
      
      setUser(userWithId);
      console.log('User registered with role:', response.user.role);
    } catch (error) {
      console.error('Register failed:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  }, []);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        console.log('Checking auth status...');
        const token = localStorage.getItem('access_token');
        
        if (!token) {
          console.log('No token found');
          setIsLoading(false);
          return;
        }

        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData: any = JSON.parse(storedUser);
          console.log('Found stored user data:', userData);
          
          const userWithId: User = {
            id: userData.id || userData.username,
            username: userData.username,
            email: userData.email,
            name: userData.name,
            role: userData.role || 'user',
            credits: userData.credits,
            profile_picture: userData.profile_picture,
            plan: userData.plan,
            member_since: userData.member_since
          };
          
          setUser(userWithId);
          setIsLoading(false);
          return;
        }

        console.log('Fetching user from API...');
        const userData: any = await authService.getCurrentUser();
        console.log('Fetched user data:', userData);
        
        const userWithId: User = {
          id: userData.id || userData.username,
          username: userData.username,
          email: userData.email,
          name: userData.name,
          role: userData.role || 'user',
          credits: userData.credits,
          profile_picture: userData.profile_picture,
          plan: userData.plan,
          member_since: userData.member_since
        };
        
        setUser(userWithId);
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const contextValue = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
    updateUserInContext
  }), [user, isLoading, login, register, logout, refreshUser, updateUserInContext]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import { useState, useEffect } from 'react';
import { authService } from '../modules/auth/application/authService';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const initAuth = async () => {
      const currentUser = await authService.checkAuth();
      if (currentUser) {
        setIsAuthenticated(true);
        setUser(currentUser);
      }
    };
    initAuth();
  }, []);

  const login = async (e: any, onSuccess: () => void) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    try {
      const loggedUser = await authService.login(email, password);
      setIsAuthenticated(true);
      setUser(loggedUser);
      onSuccess();
    } catch (err) {
      alert('Ошибка входа');
    }
  };

  const register = async (e: any, onSuccess: () => void) => {
    e.preventDefault();
    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    try {
      const registeredUser = await authService.register(name, email, password);
      setIsAuthenticated(true);
      setUser(registeredUser);
      onSuccess();
    } catch (err: any) {
      alert(err.message || 'Ошибка регистрации');
    }
  };

  const logout = async (onSuccess: () => void) => {
    await authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    onSuccess();
  };

  return { isAuthenticated, user, login, register, logout };
};

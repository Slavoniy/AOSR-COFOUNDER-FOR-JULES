/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'engineer' | 'manager';
  email: string;
}

export class AuthService {
  private currentUser: User | null = null;

  async register(name: string, email: string, password: string): Promise<User> {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }
    
    const user = await response.json();
    this.currentUser = user;
    return user;
  }

  async login(email: string, password: string): Promise<User> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) throw new Error('Login failed');
    
    const user = await response.json();
    this.currentUser = user;
    return user;
  }

  async checkAuth(): Promise<User | null> {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        this.currentUser = await response.json();
        return this.currentUser;
      }
    } catch (e) {
      console.error('Auth check failed', e);
    }
    this.currentUser = null;
    return null;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  async logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    this.currentUser = null;
  }
}

export const authService = new AuthService();

import { Injectable } from '@angular/core';

import { UserProfile } from '../models/auth.model';

const TOKEN_KEY = 'mb_token';
const USER_KEY = 'mb_user';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  setUser(user: UserProfile): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  getUser(): UserProfile | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  }

  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}
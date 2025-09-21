import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize, take, tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { AuthResponse, UserProfile } from '../models/auth.model';
import { AuthStore } from '../state/auth.store';
import { TokenStorageService } from './token-storage.service';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = environment.apiUrl;

  constructor(
    private readonly http: HttpClient,
    private readonly authStore: AuthStore,
    private readonly tokenStorage: TokenStorageService
  ) {}

  initFromStorage(): void {
    const token = this.tokenStorage.getToken();
    const user = this.tokenStorage.getUser();
    if (token && user) {
      this.authStore.setAuth(user, token);
      this.loadProfile().pipe(take(1)).subscribe({
        error: () => this.logout()
      });
    }
  }

  login(payload: LoginPayload): Observable<ApiResponse<AuthResponse>> {
    this.authStore.setLoading(true);
    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.baseUrl}/api/auth/login`, payload)
      .pipe(
        tap(response => this.persistAuth(response.data ?? (response as any).Data)),
        finalize(() => this.authStore.setLoading(false))
      );
  }

  register(payload: RegisterPayload): Observable<ApiResponse<AuthResponse>> {
    this.authStore.setLoading(true);
    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.baseUrl}/api/auth/register`, payload)
      .pipe(
        tap(response => this.persistAuth(response.data ?? (response as any).Data)),
        finalize(() => this.authStore.setLoading(false))
      );
  }

  loadProfile(): Observable<ApiResponse<UserProfile>> {
    return this.http
      .get<ApiResponse<UserProfile>>(`${this.baseUrl}/api/auth/me`)
      .pipe(
        tap(response => {
          if (response?.data) {
            const user: UserProfile = {
              id: (response.data as any).id ?? (response.data as any).Id,
              email: (response.data as any).email ?? (response.data as any).Email,
              name: (response.data as any).name ?? (response.data as any).Name,
              role: (response.data as any).role ?? (response.data as any).Role
            };
            const token = this.tokenStorage.getToken();
            if (token) {
              this.tokenStorage.setUser(user);
              this.authStore.setAuth(user, token);
            }
          }
        })
      );
  }

  logout(): void {
    this.tokenStorage.clear();
    this.authStore.clear();
  }

  private persistAuth(data: AuthResponse): void {
    if (!data?.token) {
      this.authStore.clear();
      return;
    }
    const user: UserProfile = {
      email: data.email,
      name: data.name,
      role: data.role
    };

    this.tokenStorage.setToken(data.token);
    this.tokenStorage.setUser(user);
    this.authStore.setAuth(user, data.token);
  }
}


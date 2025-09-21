import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AuthState, UserProfile } from '../models/auth.model';

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false
};

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly state$ = new BehaviorSubject<AuthState>(initialState);

  readonly authState$: Observable<AuthState> = this.state$.asObservable();
  readonly user$: Observable<UserProfile | null> = this.authState$.pipe(map(state => state.user));
  readonly token$: Observable<string | null> = this.authState$.pipe(map(state => state.token));
  readonly isAuthenticated$: Observable<boolean> = this.authState$.pipe(map(state => !!state.token));

  get snapshot(): AuthState {
    return this.state$.value;
  }

  setLoading(loading: boolean): void {
    this.patch({ loading });
  }

  setAuth(user: UserProfile, token: string): void {
    this.state$.next({ user, token, loading: false });
  }

  clear(): void {
    this.state$.next({ user: null, token: null, loading: false });
  }

  private patch(partial: Partial<AuthState>): void {
    this.state$.next({ ...this.state$.value, ...partial });
  }
}
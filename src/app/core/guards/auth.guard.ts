import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanLoad,
  CanActivateChild,
  Route,
  Router,
  RouterStateSnapshot,
  UrlSegment,
  GuardResult,
  MaybeAsync
} from '@angular/router';

import { AuthStore } from '../state/auth.store';
import { TokenStorageService } from '../services/token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanLoad, CanActivateChild {
  constructor(
    private readonly router: Router,
    private readonly authStore: AuthStore,
    private readonly tokenStorage: TokenStorageService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.check(state.url);
  }

  canLoad(route: Route, segments: UrlSegment[]): boolean {
    const url = '/' + segments.map(s => s.path).join('/');
    return this.check(url);
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean{
      return this.canActivate(route, state);
  }

  private check(returnUrl: string): boolean {
    const token = this.tokenStorage.getToken();
    if (token) {
      return true;
    }

    this.router.navigate(['/auth/login'], { queryParams: { returnUrl } });
    return false;
  }
}
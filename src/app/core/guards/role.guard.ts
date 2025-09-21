import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanLoad,
  CanActivateChild,
  Route,
  Router,
  RouterStateSnapshot,
  UrlSegment
} from '@angular/router';

import { AuthStore } from '../state/auth.store';
import { TokenStorageService } from '../services/token-storage.service';
import { NotificationService } from '../services/notification.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate, CanLoad, CanActivateChild {
  constructor(
    private readonly router: Router,
    private readonly authStore: AuthStore,
    private readonly tokenStorage: TokenStorageService,
    private readonly notification: NotificationService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.check(route.data?.['roles'] ?? [], state.url);
  }

  canLoad(route: Route, segments: UrlSegment[]): boolean {
    const url = '/' + segments.map(s => s.path).join('/');
    return this.check(route.data?.['roles'] ?? [], url);
  }
  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean{
      return this.canActivate(route, state);
  }

  private check(roles: string[], url: string): boolean {
    const user = this.authStore.snapshot.user ?? this.tokenStorage.getUser();
    if (!user) {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: url } });
      return false;
    }

    if (!roles.length || roles.includes(user.role)) {
      return true;
    }

    this.notification.error('You do not have access to this area.');
    this.router.navigate(['/']);
    return false;
  }
}

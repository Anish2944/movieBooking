import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { AuthStore } from '../../../core/state/auth.store';
import { UserProfile } from '../../../core/models/auth.model';

@Component({
  selector: 'app-main-layout',
  standalone: false,
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  readonly isAuthenticated$: Observable<boolean>;
  readonly user$: Observable<UserProfile | null>;
  readonly currentYear = new Date().getFullYear();

  constructor(
    private readonly authStore: AuthStore,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    this.isAuthenticated$ = this.authStore.isAuthenticated$;
    this.user$ = this.authStore.user$;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}

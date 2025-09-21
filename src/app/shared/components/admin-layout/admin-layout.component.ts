import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { AuthStore } from '../../../core/state/auth.store';
import { UserProfile } from '../../../core/models/auth.model';

interface AdminNavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-admin-layout',
  standalone: false,
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent {
  readonly user$: Observable<UserProfile | null>;
  readonly navItems: AdminNavItem[] = [
    { label: 'Overview', icon: 'dashboard', route: '/admin' },
    { label: 'Movies', icon: 'movie_filter', route: '/admin/movies' },
    { label: 'Theaters', icon: 'storefront', route: '/admin/theaters' },
    { label: 'Screens & Seats', icon: 'event_seat', route: '/admin/theaters' },
    { label: 'Shows', icon: 'schedule', route: '/admin/shows' },
    { label: 'Bookings', icon: 'receipt_long', route: '/admin/bookings' }
  ];

  sidenavOpened = true;

  constructor(
    private readonly authStore: AuthStore,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    this.user$ = this.authStore.user$;
  }

  toggleSidenav(): void {
    this.sidenavOpened = !this.sidenavOpened;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}

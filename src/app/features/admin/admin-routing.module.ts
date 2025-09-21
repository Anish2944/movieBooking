import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';
import { AdminLayoutComponent } from '../../shared/components/admin-layout/admin-layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { MoviesComponent } from './pages/movies/movies.component';
import { TheatersComponent } from './pages/theaters/theaters.component';
import { ShowsComponent } from './pages/shows/shows.component';
import { BookingsComponent } from './pages/bookings/bookings.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivateChild: [AuthGuard, RoleGuard],
    data: { roles: ['Admin'] },
    children: [
      { path: '', component: DashboardComponent },
      { path: 'movies', component: MoviesComponent },
      { path: 'theaters', component: TheatersComponent },
      { path: 'shows', component: ShowsComponent },
      { path: 'bookings', component: BookingsComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}

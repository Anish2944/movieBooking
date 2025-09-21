import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { MoviesComponent } from './pages/movies/movies.component';
import { TheatersComponent } from './pages/theaters/theaters.component';
import { ShowsComponent } from './pages/shows/shows.component';
import { BookingsComponent } from './pages/bookings/bookings.component';

@NgModule({
  declarations: [AdminComponent, DashboardComponent, MoviesComponent, TheatersComponent, ShowsComponent, BookingsComponent],
  imports: [SharedModule, AdminRoutingModule]
})
export class AdminModule {}
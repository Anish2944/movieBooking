import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../../core/guards/auth.guard';
import { MainLayoutComponent } from '../../shared/components/main-layout/main-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { MovieDetailComponent } from './pages/movie-detail/movie-detail.component';
import { SeatSelectionComponent } from './pages/seat-selection/seat-selection.component';
import { MyBookingsComponent } from './pages/my-bookings/my-bookings.component';

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'movies/:id', component: MovieDetailComponent },
      {
        path: 'shows/:showId/book',
        component: SeatSelectionComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'bookings',
        component: MyBookingsComponent,
        canActivate: [AuthGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerRoutingModule {}

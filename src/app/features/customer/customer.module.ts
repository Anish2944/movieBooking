import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';
import { CustomerRoutingModule } from './customer-routing.module';
import { CustomerComponent } from './customer.component';
import { HomeComponent } from './pages/home/home.component';
import { MovieDetailComponent } from './pages/movie-detail/movie-detail.component';
import { SeatSelectionComponent } from './pages/seat-selection/seat-selection.component';
import { MyBookingsComponent } from './pages/my-bookings/my-bookings.component';

@NgModule({
  declarations: [CustomerComponent, HomeComponent, MovieDetailComponent, SeatSelectionComponent, MyBookingsComponent],
  imports: [SharedModule, CustomerRoutingModule]
})
export class CustomerModule {}
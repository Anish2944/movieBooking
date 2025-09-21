import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MaterialModule } from './material/material.module';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';

@NgModule({
  declarations: [MainLayoutComponent, AdminLayoutComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, MaterialModule],
  exports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, MaterialModule, MainLayoutComponent, AdminLayoutComponent]
})
export class SharedModule {}
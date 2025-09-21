import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { AuthService } from '../../../core/services/auth.service';
import { AuthStore } from '../../../core/state/auth.store';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  form: FormGroup;
  hidePassword = true;
  hideConfirm = true;
  readonly loading$: Observable<boolean>;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly authStore: AuthStore,
    private readonly notification: NotificationService,
    private readonly router: Router
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });

    this.loading$ = this.authStore.authState$.pipe(map(state => state.loading));
  }

  submit(): void {
    if (this.form.invalid || this.passwordMismatch) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, email, password } = this.form.value;
    this.authService
      .register({ name, email, password })
      .pipe(take(1))
      .subscribe(response => {
        this.notification.success(`Welcome to MovieSphere, ${response.data?.name || name}!`);
        this.router.navigateByUrl('/');
      });
  }

  get passwordMismatch(): boolean {
    const password = this.form.get('password')?.value;
    const confirm = this.form.get('confirmPassword')?.value;
    return password && confirm && password !== confirm;
  }
}

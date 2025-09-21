import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private readonly notification: NotificationService,
    private readonly authService: AuthService
  ) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let message = 'Something went wrong. Please try again.';

        if (error.error) {
          if (typeof error.error === 'string') {
            message = error.error;
          } else if (error.error?.message) {
            message = error.error.message;
          } else if (error.error?.Message) {
            message = error.error.Message;
          }
        }

        if (error.status === 0) {
          message = 'Unable to reach the server. Please check your connection.';
        } else if (error.status === 401) {
          message = 'Your session expired. Please login again.';
          this.authService.logout();
        }

        this.notification.error(message);
        return throwError(() => error);
      })
    );
  }
}
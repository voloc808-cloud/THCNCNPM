import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import type { ApiError } from '../../../core/auth/auth.models';
@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: '../auth.scss',
})
export class ForgotPassword {
  private readonly http = inject(HttpClient);
  readonly email = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.email],
  });
  readonly submitting = signal(false);
  readonly message = signal('');
  readonly error = signal('');
  submit() {
    if (this.email.invalid) {
      this.email.markAsTouched();
      return;
    }
    this.submitting.set(true);
    this.error.set('');
    this.http
      .post<{ message: string }>('/api/v1/auth/forgot-password', { email: this.email.value })
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: (response) => this.message.set(response.message),
        error: (error: HttpErrorResponse) =>
          this.error.set((error.error as ApiError)?.message ?? 'Không thể gửi yêu cầu.'),
      });
  }
}

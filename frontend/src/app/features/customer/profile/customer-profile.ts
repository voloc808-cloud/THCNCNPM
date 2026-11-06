import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import type { ApiError } from '../../../core/auth/auth.models';
import { AuthService } from '../../../core/auth/auth.service';
import { CustomerApiService } from '../services/customer-api.service';
@Component({
  selector: 'app-customer-profile',
  imports: [ReactiveFormsModule],
  templateUrl: './customer-profile.html',
  styleUrl: './customer-profile.scss',
})
export class CustomerProfile implements OnInit {
  private readonly api = inject(CustomerApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly tab = signal<'profile' | 'security'>('profile');
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly notice = signal('');
  readonly avatar = signal<string | null>(null);
  readonly profileForm = new FormGroup({
    fullName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2), Validators.maxLength(120)],
    }),
    phone: new FormControl('', {
      nonNullable: true,
      validators: [Validators.pattern(/^[0-9+]{9,15}$/)],
    }),
    avatarUrl: new FormControl('', {
      nonNullable: true,
      validators: [Validators.pattern(/^https?:\/\/.+/)],
    }),
    dateOfBirth: new FormControl('', { nonNullable: true }),
  });
  readonly passwordForm = new FormGroup({
    currentPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    newPassword: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/),
      ],
    }),
  });
  ngOnInit() {
    this.api
      .getProfile()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ data }) => {
          this.avatar.set(data.avatarUrl);
          this.profileForm.patchValue({
            fullName: data.fullName,
            phone: data.phone ?? '',
            avatarUrl: data.avatarUrl ?? '',
            dateOfBirth: data.customerProfile?.dateOfBirth?.slice(0, 10) ?? '',
          });
        },
        error: (e) => this.setError(e),
      });
  }
  saveProfile() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.clearMessages();
    const value = this.profileForm.getRawValue();
    this.api
      .updateProfile({
        fullName: value.fullName,
        phone: value.phone || null,
        avatarUrl: value.avatarUrl || null,
        dateOfBirth: value.dateOfBirth || null,
      })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: ({ data }) => {
          this.avatar.set(data.avatarUrl);
          this.notice.set('Thông tin cá nhân đã được cập nhật.');
          this.auth.loadProfile().subscribe();
        },
        error: (e) => this.setError(e),
      });
  }
  changePassword() {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.clearMessages();
    const value = this.passwordForm.getRawValue();
    this.api
      .changePassword(value.currentPassword, value.newPassword)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.auth.logout();
          void this.router.navigate(['/login'], { queryParams: { passwordChanged: true } });
        },
        error: (e) => this.setError(e),
      });
  }
  previewAvatar() {
    const url = this.profileForm.controls.avatarUrl.value;
    this.avatar.set(/^https?:\/\//.test(url) ? url : null);
  }
  private clearMessages() {
    this.error.set('');
    this.notice.set('');
  }
  private setError(error: HttpErrorResponse) {
    this.error.set((error.error as ApiError)?.message ?? 'Không thể cập nhật thông tin.');
  }
}

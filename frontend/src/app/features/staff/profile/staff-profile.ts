import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import type { ApiError } from '../../../core/auth/auth.models';
import { AuthService } from '../../../core/auth/auth.service';
import { StaffApiService } from '../services/staff-api.service';
@Component({
  selector: 'app-staff-profile',
  imports: [FormsModule],
  templateUrl: './staff-profile.html',
  styleUrl: './staff-profile.scss',
})
export class StaffProfile implements OnInit {
  private readonly api = inject(StaffApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly notice = signal('');
  fullName = '';
  phone = '';
  avatarUrl = '';
  bio = '';
  specialties = '';
  yearsOfExperience = 0;
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  email = '';
  ngOnInit() {
    this.api.getProfile().subscribe({
      next: (r) => {
        const u = r.data;
        this.email = u.email;
        this.fullName = u.fullName;
        this.phone = u.phone ?? '';
        this.avatarUrl = u.avatarUrl ?? '';
        this.bio = u.staffProfile?.bio ?? '';
        this.specialties = u.staffProfile?.specialties ?? '';
        this.yearsOfExperience = u.staffProfile?.yearsOfExperience ?? 0;
        this.loading.set(false);
      },
      error: (e) => {
        this.fail(e);
        this.loading.set(false);
      },
    });
  }
  save() {
    this.saving.set(true);
    this.api
      .updateProfile({
        fullName: this.fullName.trim(),
        phone: this.phone.trim() || null,
        avatarUrl: this.avatarUrl.trim() || null,
        bio: this.bio.trim() || null,
        specialties: this.specialties.trim() || null,
        yearsOfExperience: this.yearsOfExperience,
      })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.notice.set('Đã cập nhật hồ sơ.');
          this.auth.loadProfile().subscribe();
        },
        error: (e) => this.fail(e),
      });
  }
  changePassword() {
    if (this.newPassword !== this.confirmPassword) {
      this.error.set('Mật khẩu xác nhận không khớp.');
      return;
    }
    this.saving.set(true);
    this.api
      .changePassword(this.currentPassword, this.newPassword)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.auth.logout();
          void this.router.navigateByUrl('/login');
        },
        error: (e) => this.fail(e),
      });
  }
  private fail(e: HttpErrorResponse) {
    this.error.set((e.error as ApiError)?.message ?? 'Không thể thực hiện thao tác.');
  }
}

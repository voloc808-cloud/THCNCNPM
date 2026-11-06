import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import type { ApiError } from '../../../core/auth/auth.models';
import type { AdminStaff, PageMeta, UserStatus } from '../models/admin.models';
import { AdminApiService } from '../services/admin-api.service';
type Form = {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  avatarUrl: string;
  bio: string;
  specialties: string;
  yearsOfExperience: number;
  isBookable: boolean;
  status: UserStatus;
};
const blank = (): Form => ({
  email: '',
  password: '',
  fullName: '',
  phone: '',
  avatarUrl: '',
  bio: '',
  specialties: '',
  yearsOfExperience: 0,
  isBookable: true,
  status: 'ACTIVE',
});
@Component({
  selector: 'app-staff-management',
  imports: [FormsModule],
  templateUrl: './staff-management.html',
  styleUrl: './staff-management.scss',
})
export class StaffManagement implements OnInit {
  private readonly api = inject(AdminApiService);
  readonly items = signal<AdminStaff[]>([]);
  readonly meta = signal<PageMeta | null>(null);
  readonly editing = signal<AdminStaff | null | undefined>(undefined);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly notice = signal('');
  search = '';
  form = blank();
  ngOnInit() {
    this.load();
  }
  load(page = 1) {
    this.loading.set(true);
    this.api
      .getStaff(page, this.search.trim())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (r) => {
          this.items.set(r.data.items);
          this.meta.set(r.data.meta);
        },
        error: (e) => this.fail(e),
      });
  }
  open(item?: AdminStaff) {
    this.editing.set(item ?? null);
    this.form = item
      ? {
          email: item.user.email,
          password: '',
          fullName: item.user.fullName,
          phone: item.user.phone ?? '',
          avatarUrl: item.user.avatarUrl ?? '',
          bio: item.bio ?? '',
          specialties: item.specialties ?? '',
          yearsOfExperience: item.yearsOfExperience,
          isBookable: item.isBookable,
          status: item.user.status,
        }
      : blank();
  }
  close() {
    this.editing.set(undefined);
  }
  save() {
    const item = this.editing();
    const body: Record<string, unknown> = {
      email: this.form.email.trim(),
      fullName: this.form.fullName.trim(),
      phone: this.form.phone.trim() || undefined,
      avatarUrl: this.form.avatarUrl.trim() || null,
      bio: this.form.bio.trim() || null,
      specialties: this.form.specialties.trim() || null,
      yearsOfExperience: this.form.yearsOfExperience,
      isBookable: this.form.isBookable,
      serviceIds: item ? item.services.map((x) => x.service.id) : [],
    };
    if (item) {
      body['status'] = this.form.status;
      if (this.form.password) body['password'] = this.form.password;
    } else body['password'] = this.form.password;
    this.saving.set(true);
    (item ? this.api.updateStaff(item.id, body) : this.api.createStaff(body))
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.notice.set(item ? 'Đã cập nhật nhân viên.' : 'Đã cấp tài khoản cho thợ.');
          this.close();
          this.load(this.meta()?.page);
        },
        error: (e) => this.fail(e),
      });
  }
  upload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.api.uploadImage(file).subscribe({
      next: (r) => {
        this.form.avatarUrl = r.data.imageUrl;
        this.notice.set('Đã tải ảnh nhân viên.');
      },
      error: (e) => this.fail(e),
    });
  }
  resetPassword(item: AdminStaff) {
    const password = prompt(`Nhập mật khẩu mới cho ${item.user.fullName}:`);
    if (password === null) return;
    if (
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/\d/.test(password)
    ) {
      this.error.set('Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số.');
      return;
    }
    if (!confirm(`Đặt lại mật khẩu đăng nhập cho “${item.user.fullName}”?`)) return;
    this.api
      .updateStaff(item.id, { password })
      .subscribe({
        next: () => this.notice.set(`Đã đặt lại mật khẩu cho ${item.user.fullName}.`),
        error: (e) => this.fail(e),
      });
  }
  remove(item: AdminStaff) {
    if (!confirm(`Xóa nhân viên “${item.user.fullName}”?`)) return;
    this.api.deleteStaff(item.id).subscribe({
      next: () => {
        this.notice.set('Đã xóa nhân viên.');
        this.load(this.meta()?.page);
      },
      error: (e) => this.fail(e),
    });
  }
  private fail(e: HttpErrorResponse) {
    this.error.set((e.error as ApiError)?.message ?? 'Không thể thực hiện thao tác.');
  }
}

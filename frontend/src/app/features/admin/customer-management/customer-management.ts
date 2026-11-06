import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import type { ApiError } from '../../../core/auth/auth.models';
import type { AdminCustomer, PageMeta, UserStatus } from '../models/admin.models';
import { AdminApiService } from '../services/admin-api.service';
type Form = {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  dateOfBirth: string;
  notes: string;
  loyaltyPoint: number;
  status: UserStatus;
};
const blank = (): Form => ({
  email: '',
  password: 'Password@123',
  fullName: '',
  phone: '',
  dateOfBirth: '',
  notes: '',
  loyaltyPoint: 0,
  status: 'ACTIVE',
});
@Component({
  selector: 'app-customer-management',
  imports: [FormsModule, DatePipe],
  templateUrl: './customer-management.html',
  styleUrl: './customer-management.scss',
})
export class CustomerManagement implements OnInit {
  private readonly api = inject(AdminApiService);
  readonly items = signal<AdminCustomer[]>([]);
  readonly meta = signal<PageMeta | null>(null);
  readonly editing = signal<AdminCustomer | null | undefined>(undefined);
  readonly passwordTarget = signal<AdminCustomer | null>(null);
  readonly passwordError = signal('');
  readonly changingPassword = signal(false);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly notice = signal('');
  search = '';
  form = blank();
  newPassword = '';
  confirmPassword = '';
  ngOnInit() {
    this.load();
  }
  load(page = 1) {
    this.loading.set(true);
    this.api
      .getCustomers(page, this.search.trim())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (r) => {
          this.items.set(r.data.items);
          this.meta.set(r.data.meta);
        },
        error: (e) => this.fail(e),
      });
  }
  open(item?: AdminCustomer) {
    this.editing.set(item ?? null);
    this.form = item
      ? {
          email: item.user.email,
          password: '',
          fullName: item.user.fullName,
          phone: item.user.phone ?? '',
          dateOfBirth: item.dateOfBirth?.slice(0, 10) ?? '',
          notes: item.notes ?? '',
          loyaltyPoint: item.loyaltyPoint,
          status: item.user.status,
        }
      : blank();
  }
  close() {
    this.editing.set(undefined);
  }
  openPassword(item: AdminCustomer) {
    this.passwordTarget.set(item);
    this.newPassword = '';
    this.confirmPassword = '';
    this.passwordError.set('');
  }
  closePassword() {
    this.passwordTarget.set(null);
    this.newPassword = '';
    this.confirmPassword = '';
    this.passwordError.set('');
  }
  setPassword() {
    const item = this.passwordTarget();
    if (!item) return;
    if (!/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,72}$/.test(this.newPassword)) {
      this.passwordError.set('Mật khẩu cần 8–72 ký tự, có chữ hoa, chữ thường và số.');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.passwordError.set('Mật khẩu xác nhận không khớp.');
      return;
    }
    this.passwordError.set('');
    this.changingPassword.set(true);
    this.api.setCustomerPassword(item.id, this.newPassword)
      .pipe(finalize(() => this.changingPassword.set(false)))
      .subscribe({
        next: () => {
          this.closePassword();
          this.notice.set(`Đã đổi mật khẩu cho ${item.user.fullName}. Khách cần dùng mật khẩu mới ở lần đăng nhập tiếp theo.`);
        },
        error: (e: HttpErrorResponse) => this.passwordError.set(
          (e.error as ApiError)?.message ?? 'Không thể đổi mật khẩu khách hàng.',
        ),
      });
  }
  save() {
    const item = this.editing();
    const body: Record<string, unknown> = {
      fullName: this.form.fullName.trim(),
      phone: this.form.phone.trim() || null,
      dateOfBirth: this.form.dateOfBirth || null,
      notes: this.form.notes.trim() || null,
    };
    if (item) {
      body['status'] = this.form.status;
      body['loyaltyPoint'] = this.form.loyaltyPoint;
    } else {
      body['email'] = this.form.email.trim();
      body['password'] = this.form.password;
    }
    this.saving.set(true);
    (item ? this.api.updateCustomer(item.id, body) : this.api.createCustomer(body))
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.notice.set(item ? 'Đã cập nhật khách hàng.' : 'Đã thêm khách hàng.');
          this.close();
          this.load(this.meta()?.page);
        },
        error: (e) => this.fail(e),
      });
  }
  remove(item: AdminCustomer) {
    if (!confirm(`Xóa khách hàng “${item.user.fullName}”?`)) return;
    this.api.deleteCustomer(item.id).subscribe({
      next: () => {
        this.notice.set('Đã xóa khách hàng.');
        this.load(this.meta()?.page);
      },
      error: (e) => this.fail(e),
    });
  }
  private fail(e: HttpErrorResponse) {
    this.error.set((e.error as ApiError)?.message ?? 'Không thể thực hiện thao tác.');
  }
}

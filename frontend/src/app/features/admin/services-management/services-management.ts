import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import type { ApiError } from '../../../core/auth/auth.models';
import type { AdminService, PageMeta } from '../models/admin.models';
import { AdminApiService } from '../services/admin-api.service';
type ServiceForm = {
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  imageUrl: string;
  isActive: boolean;
  sortOrder: number;
};
const blank = (): ServiceForm => ({
  name: '',
  description: '',
  price: 100000,
  durationMinutes: 30,
  imageUrl: '',
  isActive: true,
  sortOrder: 0,
});
@Component({
  selector: 'app-services-management',
  imports: [FormsModule, CurrencyPipe],
  templateUrl: './services-management.html',
  styleUrl: './services-management.scss',
})
export class ServicesManagement implements OnInit {
  private readonly api = inject(AdminApiService);
  readonly items = signal<AdminService[]>([]);
  readonly meta = signal<PageMeta | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly notice = signal('');
  readonly editing = signal<AdminService | null | undefined>(undefined);
  search = '';
  form = blank();
  ngOnInit() {
    this.load();
  }
  load(page = 1) {
    this.loading.set(true);
    this.api
      .getServices(page, this.search.trim())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (r) => {
          this.items.set(r.data.items);
          this.meta.set(r.data.meta);
        },
        error: (e) => this.fail(e),
      });
  }
  open(item?: AdminService) {
    this.editing.set(item ?? null);
    this.form = item
      ? {
          name: item.name,
          description: item.description,
          price: Number(item.price),
          durationMinutes: item.durationMinutes,
          imageUrl: item.imageUrl ?? '',
          isActive: item.isActive,
          sortOrder: item.sortOrder,
        }
      : blank();
  }
  close() {
    this.editing.set(undefined);
  }
  save() {
    if (!this.form.name.trim() || this.form.description.trim().length < 10) return;
    this.saving.set(true);
    const body = {
      ...this.form,
      name: this.form.name.trim(),
      description: this.form.description.trim(),
      imageUrl: this.form.imageUrl.trim() || null,
    };
    const item = this.editing();
    const req = item ? this.api.updateService(item.id, body) : this.api.createService(body);
    req.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: () => {
        this.notice.set(item ? 'Đã cập nhật dịch vụ.' : 'Đã thêm dịch vụ.');
        this.close();
        this.load(this.meta()?.page);
      },
      error: (e) => this.fail(e),
    });
  }
  remove(item: AdminService) {
    if (!confirm(`Xóa dịch vụ “${item.name}”?`)) return;
    this.api.deleteService(item.id).subscribe({
      next: () => {
        this.notice.set('Đã xóa dịch vụ.');
        this.load(this.meta()?.page);
      },
      error: (e) => this.fail(e),
    });
  }
  private fail(e: HttpErrorResponse) {
    this.error.set((e.error as ApiError)?.message ?? 'Không thể thực hiện thao tác.');
  }
}

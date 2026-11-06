import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { ApiError } from '../../../core/auth/auth.models';
import { AdminApiService } from '../services/admin-api.service';
export interface LookbookItem {
  id: string;
  title: string;
  imageUrl: string;
  isActive: boolean;
  sortOrder: number;
  updatedAt: string;
}
type Form = { title: string; imageUrl: string; isActive: boolean; sortOrder: number };
const blank = (): Form => ({ title: '', imageUrl: '', isActive: true, sortOrder: 0 });
@Component({
  selector: 'app-lookbook-management',
  imports: [FormsModule],
  templateUrl: './lookbook-management.html',
  styleUrl: './lookbook-management.scss',
})
export class LookbookManagement implements OnInit {
  private readonly api = inject(AdminApiService);
  readonly items = signal<LookbookItem[]>([]);
  readonly editing = signal<LookbookItem | null | undefined>(undefined);
  readonly uploading = signal(false);
  readonly error = signal('');
  readonly notice = signal('');
  form = blank();
  ngOnInit() {
    this.refresh();
  }
  refresh() {
    this.api
      .getLookbook()
      .subscribe({ next: (r) => this.items.set(r.data), error: (e) => this.fail(e) });
  }
  open(item?: LookbookItem) {
    this.editing.set(item ?? null);
    this.form = item
      ? {
          title: item.title,
          imageUrl: item.imageUrl,
          isActive: item.isActive,
          sortOrder: item.sortOrder,
        }
      : blank();
  }
  close() {
    this.editing.set(undefined);
  }
  upload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploading.set(true);
    this.api.uploadImage(file).subscribe({
      next: (r) => {
        this.form.imageUrl = r.data.imageUrl;
        this.uploading.set(false);
        this.notice.set('Đã tải ảnh lên.');
      },
      error: (e) => {
        this.uploading.set(false);
        this.fail(e);
      },
    });
  }
  save() {
    if (!this.form.title.trim() || !this.form.imageUrl) {
      this.error.set('Vui lòng nhập tên và tải ảnh.');
      return;
    }
    const item = this.editing();
    const body = { ...this.form, title: this.form.title.trim() };
    (item ? this.api.updateLookbook(item.id, body) : this.api.createLookbook(body)).subscribe({
      next: () => {
        this.notice.set(item ? 'Đã cập nhật kiểu tóc.' : 'Đã thêm kiểu tóc.');
        this.close();
        this.refresh();
      },
      error: (e) => this.fail(e),
    });
  }
  remove(item: LookbookItem) {
    if (!confirm(`Xóa kiểu tóc “${item.title}”?`)) return;
    this.api.deleteLookbook(item.id).subscribe({
      next: () => {
        this.notice.set('Đã xóa kiểu tóc.');
        this.refresh();
      },
      error: (e) => this.fail(e),
    });
  }
  private fail(e: HttpErrorResponse) {
    this.error.set((e.error as ApiError)?.message ?? 'Không thể thực hiện thao tác.');
  }
}

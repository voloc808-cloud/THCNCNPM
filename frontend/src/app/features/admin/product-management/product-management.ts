import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import type { ApiError } from '../../../core/auth/auth.models';
import type { PageMeta, Product, ProductCategory } from '../../products/models/product.models';
import { AdminCommerceApiService } from '../services/admin-commerce-api.service';
type Form = {
  categoryId: string;
  name: string;
  sku: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  isActive: boolean;
  sortOrder: number;
};
const blank = (): Form => ({
  categoryId: '',
  name: '',
  sku: '',
  description: '',
  price: 200000,
  stock: 0,
  imageUrl: '',
  isActive: true,
  sortOrder: 0,
});
@Component({
  selector: 'app-product-management',
  imports: [FormsModule, CurrencyPipe],
  templateUrl: './product-management.html',
  styleUrl: './product-management.scss',
})
export class ProductManagement implements OnInit {
  private readonly api = inject(AdminCommerceApiService);
  readonly items = signal<Product[]>([]);
  readonly categories = signal<(ProductCategory & { _count?: { products: number } })[]>([]);
  readonly meta = signal<PageMeta | null>(null);
  readonly editing = signal<Product | null | undefined>(undefined);
  readonly error = signal('');
  readonly notice = signal('');
  search = '';
  form = blank();
  ngOnInit() {
    this.refresh();
  }
  refresh(page = 1) {
    forkJoin({
      products: this.api.products(page, this.search.trim()),
      categories: this.api.categories(),
    }).subscribe({
      next: (r) => {
        this.items.set(r.products.data.items);
        this.meta.set(r.products.data.meta);
        this.categories.set(r.categories.data);
      },
      error: (e) => this.fail(e),
    });
  }
  open(item?: Product) {
    this.editing.set(item ?? null);
    this.form = item
      ? {
          categoryId: item.categoryId ?? '',
          name: item.name,
          sku: item.sku,
          description: item.description,
          price: Number(item.price),
          stock: item.stock,
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
    const item = this.editing();
    const body = {
      ...this.form,
      categoryId: this.form.categoryId || null,
      imageUrl: this.form.imageUrl.trim() || null,
    };
    (item ? this.api.updateProduct(item.id, body) : this.api.createProduct(body)).subscribe({
      next: () => {
        this.notice.set(item ? 'Đã cập nhật sản phẩm.' : 'Đã thêm sản phẩm.');
        this.close();
        this.refresh(this.meta()?.page);
      },
      error: (e) => this.fail(e),
    });
  }
  upload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.api.uploadImage(file).subscribe({
      next: (r) => {
        this.form.imageUrl = r.data.imageUrl;
        this.notice.set('Đã tải ảnh sản phẩm.');
      },
      error: (e) => this.fail(e),
    });
  }
  remove(item: Product) {
    if (!confirm(`Xóa sản phẩm “${item.name}”?`)) return;
    this.api
      .deleteProduct(item.id)
      .subscribe({ next: () => this.refresh(this.meta()?.page), error: (e) => this.fail(e) });
  }
  addCategory() {
    const name = prompt('Tên danh mục mới:')?.trim();
    if (!name) return;
    this.api.createCategory({ name }).subscribe({
      next: () => {
        this.notice.set('Đã thêm danh mục.');
        this.refresh();
      },
      error: (e) => this.fail(e),
    });
  }
  removeCategory(item: ProductCategory & { _count?: { products: number } }) {
    if (item._count?.products) {
      this.error.set('Hãy chuyển hoặc xóa sản phẩm trong danh mục trước.');
      return;
    }
    if (!confirm(`Xóa danh mục “${item.name}”?`)) return;
    this.api
      .deleteCategory(item.id)
      .subscribe({ next: () => this.refresh(), error: (e) => this.fail(e) });
  }
  private fail(e: HttpErrorResponse) {
    this.error.set((e.error as ApiError)?.message ?? 'Không thể thực hiện thao tác.');
  }
}

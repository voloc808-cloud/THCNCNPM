import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import type { PageMeta, Product, ProductCategory } from '../models/product.models';
import { ProductApiService } from '../services/product-api.service';
import { CartService } from '../../cart/services/cart.service';
@Component({
  selector: 'app-products-page',
  imports: [CurrencyPipe, FormsModule, RouterLink],
  templateUrl: './products-page.html',
  styleUrl: './products-page.scss',
})
export class ProductsPage implements OnInit {
  private readonly api = inject(ProductApiService);
  readonly cart = inject(CartService);
  readonly items = signal<Product[]>([]);
  readonly categories = signal<ProductCategory[]>([]);
  readonly meta = signal<PageMeta | null>(null);
  readonly loading = signal(true);
  readonly notice = signal('');
  search = '';
  categoryId = '';
  ngOnInit() {
    forkJoin({ products: this.api.list(), categories: this.api.categories() }).subscribe({
      next: (r) => {
        this.items.set(r.products.data.items);
        this.meta.set(r.products.data.meta);
        this.categories.set(r.categories.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
  load(page = 1) {
    this.loading.set(true);
    this.api.list(page, this.search.trim(), this.categoryId).subscribe({
      next: (r) => {
        this.items.set(r.data.items);
        this.meta.set(r.data.meta);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
  add(item: Product) {
    this.cart.add(item);
    this.notice.set(`Đã thêm ${item.name} vào giỏ.`);
    setTimeout(() => this.notice.set(''), 1800);
  }
}

import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import type { Product } from '../../models/product.models';
import { ProductApiService } from '../../services/product-api.service';
import { CartService } from '../../../cart/services/cart.service';
@Component({
  selector: 'app-product-detail',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ProductApiService);
  readonly cart = inject(CartService);
  readonly item = signal<Product | null>(null);
  readonly error = signal('');
  ngOnInit() {
    this.api
      .detail(this.route.snapshot.paramMap.get('slug')!)
      .subscribe({
        next: (r) => this.item.set(r.data),
        error: () => this.error.set('Không tìm thấy sản phẩm.'),
      });
  }
  add(item: Product) {
    this.cart.add(item);
  }
}

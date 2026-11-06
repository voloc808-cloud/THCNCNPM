import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { ApiResponse } from '../../../core/auth/auth.models';
import type { PageResult, Product, ProductCategory } from '../models/product.models';
@Injectable({ providedIn: 'root' })
export class ProductApiService {
  private readonly http = inject(HttpClient);
  categories() {
    return this.http.get<ApiResponse<ProductCategory[]>>('/api/v1/products/categories');
  }
  list(page = 1, search = '', categoryId = '') {
    let p = new HttpParams().set('page', page).set('limit', 12);
    if (search) p = p.set('search', search);
    if (categoryId) p = p.set('categoryId', categoryId);
    return this.http.get<ApiResponse<PageResult<Product>>>('/api/v1/products', { params: p });
  }
  detail(slug: string) {
    return this.http.get<ApiResponse<Product>>(`/api/v1/products/${slug}`);
  }
}

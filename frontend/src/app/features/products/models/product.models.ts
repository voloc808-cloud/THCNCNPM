export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
export interface PageResult<T> {
  items: T[];
  meta: PageMeta;
}
export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
}
export interface Product {
  id: string;
  categoryId: string | null;
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: string | number;
  stock: number;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  category: ProductCategory | null;
}
export interface CartItem {
  product: Product;
  quantity: number;
}

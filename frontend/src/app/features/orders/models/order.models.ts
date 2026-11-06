import type { PageMeta } from '../../products/models/product.models';
export type OrderStatus =
  'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED';
export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  unitPrice: string | number;
  quantity: number;
  lineTotal: string | number;
  product: { slug: string; imageUrl: string | null };
}
export interface Order {
  id: string;
  code: string;
  status: OrderStatus;
  subtotal: string | number;
  shippingFee: string | number;
  total: string | number;
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  customerNote: string | null;
  createdAt: string;
  items: OrderItem[];
  user?: { fullName: string; email: string; phone: string | null };
}
export interface OrderPage {
  items: Order[];
  meta: PageMeta;
}

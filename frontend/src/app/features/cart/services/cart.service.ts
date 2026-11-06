import { computed, Injectable, signal } from '@angular/core';
import type { CartItem, Product } from '../../products/models/product.models';
const KEY = 'royal_barber_cart';
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly state = signal<CartItem[]>(this.read());
  readonly items = this.state.asReadonly();
  readonly count = computed(() => this.state().reduce((n, x) => n + x.quantity, 0));
  readonly subtotal = computed(() =>
    this.state().reduce((n, x) => n + Number(x.product.price) * x.quantity, 0),
  );
  add(product: Product, quantity = 1) {
    if (product.stock < 1) return;
    const items = [...this.state()];
    const found = items.find((x) => x.product.id === product.id);
    if (found) found.quantity = Math.min(product.stock, found.quantity + quantity);
    else items.push({ product, quantity: Math.min(product.stock, quantity) });
    this.save(items);
  }
  setQuantity(id: string, quantity: number) {
    const items = this.state().map((x) =>
      x.product.id === id
        ? { ...x, quantity: Math.max(1, Math.min(x.product.stock, quantity)) }
        : x,
    );
    this.save(items);
  }
  remove(id: string) {
    this.save(this.state().filter((x) => x.product.id !== id));
  }
  clear() {
    this.save([]);
  }
  private save(items: CartItem[]) {
    this.state.set(items);
    localStorage.setItem(KEY, JSON.stringify(items));
  }
  private read(): CartItem[] {
    try {
      return JSON.parse(localStorage.getItem(KEY) ?? '[]');
    } catch {
      return [];
    }
  }
}

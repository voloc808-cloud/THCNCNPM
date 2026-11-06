import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import type { ApiError } from '../../../../core/auth/auth.models';
import { AuthService } from '../../../../core/auth/auth.service';
import { CartService } from '../../services/cart.service';
import { OrderApiService } from '../../../orders/services/order-api.service';
@Component({
  selector: 'app-checkout-page',
  imports: [FormsModule, CurrencyPipe, RouterLink],
  templateUrl: './checkout-page.html',
  styleUrl: './checkout-page.scss',
})
export class CheckoutPage implements OnInit {
  readonly cart = inject(CartService);
  private readonly auth = inject(AuthService);
  private readonly api = inject(OrderApiService);
  private readonly router = inject(Router);
  readonly saving = signal(false);
  readonly error = signal('');
  recipientName = '';
  recipientPhone = '';
  shippingAddress = '';
  customerNote = '';
  ngOnInit() {
    const u = this.auth.user();
    this.recipientName = u?.fullName ?? '';
    this.recipientPhone = u?.phone ?? '';
  }
  submit() {
    if (!this.cart.items().length) return;
    this.saving.set(true);
    this.api
      .create({
        items: this.cart.items().map((x) => ({ productId: x.product.id, quantity: x.quantity })),
        recipientName: this.recipientName.trim(),
        recipientPhone: this.recipientPhone.trim(),
        shippingAddress: this.shippingAddress.trim(),
        customerNote: this.customerNote.trim() || undefined,
      })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (r) => {
          this.cart.clear();
          void this.router.navigate(['/don-hang'], { queryParams: { created: r.data.code } });
        },
        error: (e) =>
          this.error.set((e as HttpErrorResponse).error?.message ?? 'Không thể tạo đơn hàng.'),
      });
  }
}

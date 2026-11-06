import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
@Component({
  selector: 'app-customer-dashboard',
  imports: [RouterLink],
  templateUrl: './customer-dashboard.html',
  styleUrl: './customer-dashboard.scss',
})
export class CustomerDashboard {
  readonly auth = inject(AuthService);
}

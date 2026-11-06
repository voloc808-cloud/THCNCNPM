import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import type { ApiResponse } from '../../core/auth/auth.models';
import { AuthService } from '../../core/auth/auth.service';

interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  appointment: { code: string; startAt: string };
  customer: { user: { fullName: string } };
  staff: { user: { fullName: string } };
}

@Component({
  selector: 'app-reviews-page',
  imports: [DatePipe],
  templateUrl: './reviews-page.html',
  styleUrl: './reviews-page.scss',
})
export class ReviewsPage implements OnInit {
  private readonly http = inject(HttpClient);
  readonly auth = inject(AuthService);
  readonly reviews = signal<ReviewItem[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  ngOnInit() {
    this.http.get<ApiResponse<ReviewItem[]>>('/api/v1/reviews/management').subscribe({
      next: ({ data }) => {
        this.reviews.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Không thể tải đánh giá. Vui lòng thử lại.');
        this.loading.set(false);
      },
    });
  }
}

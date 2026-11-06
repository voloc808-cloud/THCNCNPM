import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import type { ApiError } from '../../../core/auth/auth.models';
import type { Appointment, Availability, ServiceItem, StaffItem } from '../models/customer.models';
import { CustomerApiService } from '../services/customer-api.service';
const localDate = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};
@Component({
  selector: 'app-booking-wizard',
  imports: [FormsModule, CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './booking-wizard.html',
  styleUrl: './booking-wizard.scss',
})
export class BookingWizard implements OnInit {
  private readonly api = inject(CustomerApiService);
  readonly step = signal(1);
  readonly services = signal<ServiceItem[]>([]);
  readonly staff = signal<StaffItem[]>([]);
  readonly selectedServiceIds = signal<string[]>([]);
  readonly selectedStaffId = signal<string | null>(null);
  readonly selectedDate = signal('');
  readonly availability = signal<Availability | null>(null);
  readonly selectedSlot = signal<Availability['slots'][number] | null>(null);
  readonly loading = signal(true);
  readonly loadingSlots = signal(false);
  readonly submitting = signal(false);
  readonly error = signal('');
  readonly created = signal<Appointment | null>(null);
  note = '';
  readonly minDate = localDate(new Date());
  readonly maxDate = localDate(new Date(Date.now() + 30 * 86400000));
  readonly selectedServices = computed(() =>
    this.services().filter((item) => this.selectedServiceIds().includes(item.id)),
  );
  readonly totalDuration = computed(() =>
    this.selectedServices().reduce((sum, item) => sum + item.durationMinutes, 0),
  );
  readonly totalPrice = computed(() =>
    this.selectedServices().reduce((sum, item) => sum + Number(item.price), 0),
  );
  readonly selectedStaff = computed(
    () => this.staff().find((item) => item.id === this.selectedStaffId()) ?? null,
  );
  ngOnInit() {
    forkJoin([this.api.getServices(), this.api.getStaff()])
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ([services, staff]) => {
          this.services.set(services.data.items);
          this.staff.set(staff.data.items);
        },
        error: (error: HttpErrorResponse) => this.setError(error),
      });
  }
  toggleService(id: string) {
    this.selectedServiceIds.update((ids) =>
      ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id],
    );
    this.resetSlot();
  }
  chooseStaff(id: string | null) {
    this.selectedStaffId.set(id);
    this.resetSlot();
  }
  next() {
    if (this.step() === 1 && !this.selectedServiceIds().length) return;
    if (this.step() < 4) this.step.update((value) => value + 1);
    if (this.step() === 3 && this.selectedDate()) this.loadSlots();
  }
  back() {
    if (this.step() > 1) this.step.update((value) => value - 1);
  }
  setDate(value: string) {
    this.selectedDate.set(value);
    this.loadSlots();
  }
  loadSlots() {
    if (!this.selectedDate() || !this.selectedServiceIds().length) return;
    this.loadingSlots.set(true);
    this.error.set('');
    this.selectedSlot.set(null);
    this.api
      .getAvailability(
        this.selectedDate(),
        this.selectedServiceIds(),
        this.selectedStaffId() ?? undefined,
      )
      .pipe(finalize(() => this.loadingSlots.set(false)))
      .subscribe({
        next: (response) => this.availability.set(response.data),
        error: (error: HttpErrorResponse) => {
          this.availability.set(null);
          this.setError(error);
        },
      });
  }
  selectSlot(slot: Availability['slots'][number]) {
    this.selectedSlot.set(slot);
  }
  confirm() {
    const slot = this.selectedSlot();
    if (!slot) return;
    this.submitting.set(true);
    this.error.set('');
    this.api
      .createAppointment({
        serviceIds: this.selectedServiceIds(),
        ...(this.selectedStaffId() ? { staffId: this.selectedStaffId()! } : {}),
        startAt: slot.startAt,
        ...(this.note.trim() ? { customerNote: this.note.trim() } : {}),
      })
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: (response) => this.created.set(response.data),
        error: (error: HttpErrorResponse) => {
          this.setError(error);
          this.step.set(3);
          this.loadSlots();
        },
      });
  }
  private resetSlot() {
    this.availability.set(null);
    this.selectedSlot.set(null);
  }
  private setError(error: HttpErrorResponse) {
    this.error.set(
      (error.error as ApiError)?.message ?? 'Không thể kết nối máy chủ. Vui lòng thử lại.',
    );
  }
}

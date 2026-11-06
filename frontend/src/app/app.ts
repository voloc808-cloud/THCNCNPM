import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './core/layouts/header/header';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private dragStartY = 0;
  private activePointerId: number | null = null;

  readonly lightMode = signal(false);
  readonly pullDistance = signal(0);

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;
    const savedTheme = localStorage.getItem('royal-barber-theme');
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    this.setTheme(savedTheme ? savedTheme === 'light' : prefersLight, false);
  }

  startPull(event: PointerEvent) {
    this.activePointerId = event.pointerId;
    this.dragStartY = event.clientY;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  movePull(event: PointerEvent) {
    if (this.activePointerId !== event.pointerId) return;
    this.pullDistance.set(Math.min(82, Math.max(0, event.clientY - this.dragStartY)));
  }

  endPull(event: PointerEvent) {
    if (this.activePointerId !== event.pointerId) return;
    const shouldToggle = this.pullDistance() > 18 || Math.abs(event.clientY - this.dragStartY) < 6;
    this.activePointerId = null;
    this.pullDistance.set(0);
    if (shouldToggle) this.setTheme(!this.lightMode());
  }

  private setTheme(light: boolean, persist = true) {
    this.lightMode.set(light);
    this.document.body.classList.toggle('light-theme', light);
    if (persist) localStorage.setItem('royal-barber-theme', light ? 'light' : 'dark');
  }
}
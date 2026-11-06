import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, OnDestroy, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import type { ApiError } from '../../../core/auth/auth.models';
import { AuthService } from '../../../core/auth/auth.service';

type GoogleCredentialResponse = { credential: string };
type GoogleIdentity = {
  accounts: {
    id: {
      initialize(options: {
        client_id: string;
        callback: (response: GoogleCredentialResponse) => void;
      }): void;
      renderButton(element: HTMLElement, options: Record<string, unknown>): void;
    };
  };
};
declare global {
  interface Window {
    google?: GoogleIdentity;
  }
}

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: '../auth.scss',
})
export class Login implements AfterViewInit, OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private googleScript?: HTMLScriptElement;
  readonly submitting = signal(false);
  readonly googleSubmitting = signal(false);
  readonly googleConfigured = signal(true);
  readonly showPassword = signal(false);
  readonly serverError = signal('');
  readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });
  ngAfterViewInit() {
    this.auth.googleConfig().subscribe({
      next: ({ data }) => {
        if (!data.clientId) {
          this.googleConfigured.set(false);
          return;
        }
        this.loadGoogle(data.clientId);
      },
      error: () => this.googleConfigured.set(false),
    });
  }
  ngOnDestroy() {
    if (this.googleScript?.parentNode) this.googleScript.parentNode.removeChild(this.googleScript);
  }
  invalid(name: 'email' | 'password') {
    const control = this.form.controls[name];
    return control.invalid && control.touched;
  }
  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.serverError.set('');
    this.auth
      .login(this.form.getRawValue())
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => this.finishLogin(),
        error: (error: HttpErrorResponse) => this.showError(error),
      });
  }
  private loadGoogle(clientId: string) {
    const start = () => {
      const target = document.getElementById('google-signin-button');
      if (!target || !window.google) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => this.handleGoogle(response.credential),
      });
      window.google.accounts.id.renderButton(target, {
        theme: 'outline',
        size: 'large',
        shape: 'rectangular',
        text: 'signin_with',
        locale: 'vi',
        width: 360,
      });
    };
    if (window.google) {
      start();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = start;
    script.onerror = () => this.googleConfigured.set(false);
    document.head.appendChild(script);
    this.googleScript = script;
  }
  private handleGoogle(credential: string) {
    this.googleSubmitting.set(true);
    this.serverError.set('');
    this.auth
      .loginWithGoogle(credential)
      .pipe(finalize(() => this.googleSubmitting.set(false)))
      .subscribe({
        next: () => this.finishLogin(),
        error: (error: HttpErrorResponse) => this.showError(error),
      });
  }
  private finishLogin() {
    const requested = this.route.snapshot.queryParamMap.get('returnUrl');
    const target = requested?.startsWith('/') ? requested : this.auth.homeForRole();
    void this.router.navigateByUrl(target);
  }
  private showError(error: HttpErrorResponse) {
    this.serverError.set(
      (error.error as ApiError)?.message ?? 'Không thể kết nối máy chủ. Vui lòng thử lại.',
    );
  }
}

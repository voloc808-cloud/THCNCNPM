import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
@Component({
  selector: 'app-status-page',
  imports: [RouterLink],
  template: `<section>
    <p class="code">{{ route.snapshot.data['code'] }}</p>
    <p class="eyebrow">Royal Barber</p>
    <h1>{{ route.snapshot.data['title'] }}</h1>
    <p>{{ route.snapshot.data['message'] }}</p>
    <a class="button button-outline" routerLink="/">Về trang chủ</a>
  </section>`,
  styles: [
    `
      section {
        min-height: calc(100dvh - 76px);
        display: grid;
        place-content: center;
        text-align: center;
        padding: 30px;
        background: radial-gradient(circle, #21190f, #090909 55%);
      }
      .code {
        margin: 0;
        color: #292118;
        font:
          400 clamp(100px, 20vw, 250px)/0.7 Georgia,
          serif;
      }
      .eyebrow {
        justify-content: center;
        margin-top: -10px;
      }
      .eyebrow::before {
        display: none;
      }
      h1 {
        font:
          400 clamp(36px, 5vw, 64px) Georgia,
          serif;
        margin: 5px;
      }
      section > p:not(.code, .eyebrow) {
        color: #928a7f;
        margin: 12px 0 28px;
      }
      .button {
        justify-self: center;
      }
    `,
  ],
})
export class StatusPage {
  readonly route = inject(ActivatedRoute);
}

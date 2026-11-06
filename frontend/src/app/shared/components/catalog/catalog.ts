import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface CatalogItem {
  index: string;
  title: string;
  text: string;
  imageUrl?: string | null;
}

@Component({
  selector: 'app-catalog',
  imports: [RouterLink],
  template: `<section class="catalog page-container">
    <p class="eyebrow">Royal Barber Studio</p>
    <h1>{{ title() }}</h1>
    <p class="lead">{{ description() }}</p>
    <div class="grid">
      @for (item of items(); track item.title) {
        <article [class.has-image]="item.imageUrl">
          @if (item.imageUrl) {
            <img [src]="item.imageUrl" [alt]="item.title" loading="lazy" />
          }
          <div class="card-copy">
            <span>{{ item.index }}</span>
            <h2>{{ item.title }}</h2>
            <p>{{ item.text }}</p>
          </div>
        </article>
      }
    </div>
    <a class="button" routerLink="/customer">Đặt lịch ngay</a>
  </section>`,
  styles: [
    `
      .catalog {
        min-height: calc(100dvh - 76px);
        padding-block: clamp(60px, 9vw, 120px);
      }
      h1 {
        margin: 0;
        font: 400 clamp(48px, 7vw, 90px) / 1 Georgia, serif;
      }
      .lead {
        max-width: 620px;
        color: #91897e;
        line-height: 1.8;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
        margin: 55px 0 40px;
      }
      article {
        position: relative;
        min-height: 226px;
        overflow: hidden;
        border: 1px solid #302a22;
        background: #111;
      }
      .card-copy {
        position: relative;
        z-index: 2;
        min-height: 226px;
        padding: 28px;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
      }
      article span {
        color: #d5a653;
        font-size: 10px;
      }
      article h2 {
        margin: 28px 0 12px;
        color: #f5eee4;
        font: 400 24px Georgia, serif;
      }
      article p {
        margin: 0;
        color: #c8bcae;
        line-height: 1.7;
        font-size: 13px;
      }
      article img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center 25%;
        filter: saturate(0.82) contrast(1.04);
        transition: transform 0.5s ease, filter 0.5s ease;
      }
      article.has-image::after {
        content: '';
        position: absolute;
        z-index: 1;
        inset: 0;
        background: linear-gradient(180deg, rgba(8, 8, 8, 0.08), rgba(8, 8, 8, 0.9));
      }
      article.has-image:hover img {
        transform: scale(1.04);
        filter: saturate(1) contrast(1.02);
      }
      article.has-image h2,
      article.has-image p {
        text-shadow: 0 2px 12px rgba(0, 0, 0, 0.75);
      }
      @media (max-width: 700px) {
        .grid { grid-template-columns: 1fr; }
      }
    `,
  ],
})
export class Catalog {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly items = input.required<CatalogItem[]>();
}
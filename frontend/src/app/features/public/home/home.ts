import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { CurrencyPipe, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { BarberScene } from './barber-scene/barber-scene';
import { CustomerApiService } from '../../customer/services/customer-api.service';
import { ChatWidget } from './chat-widget/chat-widget';

interface HomeService {
  no: string;
  name: string;
  description: string;
  price: number;
  time: string;
  imageUrl: string | null;
}
interface HomeTeam {
  id: string;
  initial: string;
  name: string;
  role: string;
  skill: string;
  imageUrl: string | null;
}
interface HomeLook {
  id: string;
  title: string;
  imageUrl: string | null;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink, BarberScene, CurrencyPipe, ChatWidget],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit, AfterViewInit, OnDestroy {
  private readonly api = inject(CustomerApiService);
  private readonly zone = inject(NgZone);
  private readonly platformId = inject(PLATFORM_ID);
  private numberObserver?: IntersectionObserver;
  private storyObserver?: IntersectionObserver;
  private quoteObserver?: IntersectionObserver;
  private servicesHeadingObserver?: IntersectionObserver;
  private teamHeadingObserver?: IntersectionObserver;
  private collectionHeadingObserver?: IntersectionObserver;
  private pricingHeadingObserver?: IntersectionObserver;
  private contactHeadingObserver?: IntersectionObserver;
  private finalCtaObserver?: IntersectionObserver;
  private counterFrame = 0;

  @ViewChild('numbers') private numbersRef?: ElementRef<HTMLElement>;
  @ViewChild('storyCopy') private storyRef?: ElementRef<HTMLElement>;
  @ViewChild('quote') private quoteRef?: ElementRef<HTMLElement>;
  @ViewChild('servicesHeading') private servicesHeadingRef?: ElementRef<HTMLElement>;
  @ViewChild('teamHeading') private teamHeadingRef?: ElementRef<HTMLElement>;
  @ViewChild('collectionHeading') private collectionHeadingRef?: ElementRef<HTMLElement>;
  @ViewChild('pricingHeading') private pricingHeadingRef?: ElementRef<HTMLElement>;
  @ViewChild('contactHeading') private contactHeadingRef?: ElementRef<HTMLElement>;
  @ViewChild('finalCta') private finalCtaRef?: ElementRef<HTMLElement>;
  readonly quoteLines = [
    'Một trong số ít nơi tôi có thể ngồi',
    'xuống, không cần nói quá nhiều, và',
    'biết mình sẽ bước ra với phiên bản',
    'tốt hơn.',
  ].map((line) => Array.from(line, (character) => (character === ' ' ? '\u00a0' : character)));
  readonly services = signal<HomeService[]>([
    {
      no: '01',
      name: 'Classic Cut',
      description: 'Tư vấn và tạo kiểu cân đối với khuôn mặt.',
      price: 150000,
      time: '45 phút',
      imageUrl: null,
    },
    {
      no: '02',
      name: 'Premium Fade',
      description: 'Chuyển tầng sắc nét, hoàn thiện từng chi tiết.',
      price: 200000,
      time: '60 phút',
      imageUrl: null,
    },
    {
      no: '03',
      name: 'Beard Ritual',
      description: 'Khăn nóng, cạo và tạo hình râu thủ công.',
      price: 120000,
      time: '30 phút',
      imageUrl: null,
    },
  ]);
  readonly looks = signal<HomeLook[]>([
    { id: 'fallback-1', title: 'Textured Crop', imageUrl: null },
    { id: 'fallback-2', title: 'Classic Pompadour', imageUrl: null },
    { id: 'fallback-3', title: 'Skin Fade', imageUrl: null },
    { id: 'fallback-4', title: 'Modern Slick Back', imageUrl: null },
  ]);
  readonly team = signal<HomeTeam[]>([
    {
      id: 'fallback-minh',
      initial: 'M',
      name: 'Hoàng Minh',
      role: 'Master Barber · 8 năm',
      skill: 'Fade / Pompadour',
      imageUrl: null,
    },
    {
      id: 'fallback-khoa',
      initial: 'K',
      name: 'Anh Khoa',
      role: 'Senior Barber · 6 năm',
      skill: 'Modern / Beard',
      imageUrl: null,
    },
  ]);

  ngOnInit() {
    forkJoin({
      services: this.api.getServices(),
      staff: this.api.getStaff(),
      lookbook: this.api.getLookbook(),
    }).subscribe({
      next: ({ services, staff, lookbook }) => {
        const serviceItems = services.data.items.slice(0, 5).map((item, index) => ({
          no: String(index + 1).padStart(2, '0'),
          name: item.name,
          description: item.description,
          price: Number(item.price),
          time: `${item.durationMinutes} phút`,
          imageUrl: item.imageUrl,
        }));
        const staffItems = staff.data.items.slice(0, 6).map((item) => ({
          id: item.id,
          initial: item.user.fullName.trim().charAt(0).toUpperCase(),
          name: item.user.fullName,
          role: `${item.yearsOfExperience >= 7 ? 'Master Barber' : 'Senior Barber'} · ${item.yearsOfExperience} năm`,
          skill:
            item.specialties ||
            item.services
              .map((entry) => entry.service.name)
              .slice(0, 3)
              .join(' / ') ||
            'Royal Barber',
          imageUrl: item.user.avatarUrl,
        }));
        if (serviceItems.length) this.services.set(serviceItems);
        if (staffItems.length) this.team.set(staffItems);
        if (lookbook.data.length)
          this.looks.set(
            lookbook.data.map((item) => ({
              id: item.id,
              title: item.title,
              imageUrl: item.imageUrl,
            })),
          );
      },
      error: () => undefined,
    });
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.setupStoryAnimation();
    this.setupQuoteAnimation();
    this.setupServicesHeadingAnimation();
    this.setupTeamHeadingAnimation();
    this.setupCollectionHeadingAnimation();
    this.setupPricingHeadingAnimation();
    this.setupContactHeadingAnimation();
    this.setupFinalCtaAnimation();
    if (!this.numbersRef) return;

    const numbers = this.numbersRef.nativeElement;
    const counters = Array.from(numbers.querySelectorAll<HTMLElement>('[data-count]'));
    const initialTop = numbers.getBoundingClientRect().top;

    // Chuẩn bị số 0 khi khối vẫn còn ở dưới màn hình.
    counters.forEach((counter) => {
      const decimals = Number(counter.dataset['decimals'] ?? 0);
      const suffix = counter.dataset['suffix'] ?? '';
      counter.textContent = `${decimals ? '0.0' : '0'}${suffix}`;
    });

    this.zone.runOutsideAngular(() => {
      this.numberObserver = new IntersectionObserver(
        ([entry]) => {
          const isScrollingDownIntoView =
            entry.isIntersecting && entry.boundingClientRect.top < initialTop;
          if (!isScrollingDownIntoView) return;

          this.numberObserver?.disconnect();
          this.animateNumbers(numbers);
        },
        {
          threshold: 0.1,
          rootMargin: '0px 0px -15% 0px',
        },
      );
      this.numberObserver.observe(numbers);
    });
  }

  private setupStoryAnimation() {
    if (!this.storyRef) return;

    const story = this.storyRef.nativeElement;
    const items = Array.from(story.querySelectorAll<HTMLElement>('[data-story-reveal]'));
    items.forEach((item) => {
      item.style.opacity = '0';
      item.style.transform = 'translateX(-120px) scale(0.96)';
      item.style.filter = 'blur(5px)';
    });

    this.storyObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        this.storyObserver?.disconnect();

        items.forEach((item, index) => {
          item.animate(
            [
              { opacity: 0, transform: 'translateX(-120px) scale(0.96)', filter: 'blur(5px)' },
              { opacity: 1, transform: 'translateX(12px) scale(1.01)', filter: 'blur(0)' },
              { opacity: 1, transform: 'translateX(0) scale(1)', filter: 'blur(0)' },
            ],
            {
              duration: 820,
              delay: index * 230,
              easing: 'cubic-bezier(0.2, 0.9, 0.25, 1.15)',
              fill: 'forwards',
            },
          );
        });
      },
      { threshold: 0.28 },
    );
    this.storyObserver.observe(story);
  }
  private setupServicesHeadingAnimation() {
    if (!this.servicesHeadingRef) return;

    const heading = this.servicesHeadingRef.nativeElement;
    const items = Array.from(heading.querySelectorAll<HTMLElement>('[data-service-reveal]'));
    items.forEach((item) => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(85px) scale(0.96)';
      item.style.filter = 'blur(5px)';
    });

    this.servicesHeadingObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        this.servicesHeadingObserver?.disconnect();

        items.forEach((item, index) => {
          item.animate(
            [
              { opacity: 0, transform: 'translateY(85px) scale(0.96)', filter: 'blur(5px)' },
              { opacity: 1, transform: 'translateY(-8px) scale(1.01)', filter: 'blur(0)' },
              { opacity: 1, transform: 'translateY(0) scale(1)', filter: 'blur(0)' },
            ],
            {
              duration: 720,
              delay: index * 210,
              easing: 'cubic-bezier(0.2, 0.9, 0.25, 1.15)',
              fill: 'forwards',
            },
          );
        });
      },
      { threshold: 0.25 },
    );
    this.servicesHeadingObserver.observe(heading);
  }
  private setupTeamHeadingAnimation() {
    if (!this.teamHeadingRef) return;
    const heading = this.teamHeadingRef.nativeElement;
    const items = Array.from(heading.querySelectorAll<HTMLElement>('[data-team-reveal]'));
    this.prepareDirectionalReveal(items, 110);
    this.teamHeadingObserver = this.observeDirectionalReveal(heading, items, 110);
  }

  private setupCollectionHeadingAnimation() {
    if (!this.collectionHeadingRef) return;
    const heading = this.collectionHeadingRef.nativeElement;
    const items = Array.from(heading.querySelectorAll<HTMLElement>('[data-collection-reveal]'));
    this.prepareDirectionalReveal(items, -110);
    this.collectionHeadingObserver = this.observeDirectionalReveal(heading, items, -110);
  }

  private setupPricingHeadingAnimation() {
    if (!this.pricingHeadingRef) return;
    const heading = this.pricingHeadingRef.nativeElement;
    const items = Array.from(heading.querySelectorAll<HTMLElement>('[data-pricing-reveal]'));
    this.prepareDirectionalReveal(items, -105);
    this.pricingHeadingObserver = this.observeDirectionalReveal(heading, items, -105);
  }

  private setupContactHeadingAnimation() {
    if (!this.contactHeadingRef) return;
    const heading = this.contactHeadingRef.nativeElement;
    const items = Array.from(heading.querySelectorAll<HTMLElement>('[data-contact-reveal]'));
    this.prepareDirectionalReveal(items, 105);
    this.contactHeadingObserver = this.observeDirectionalReveal(heading, items, 105);
  }
  private setupFinalCtaAnimation() {
    if (!this.finalCtaRef) return;
    const section = this.finalCtaRef.nativeElement;
    const items = Array.from(section.querySelectorAll<HTMLElement>('[data-final-reveal]'));
    items.forEach((item) => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(72px)';
      item.style.filter = 'blur(5px)';
    });

    this.finalCtaObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        this.finalCtaObserver?.disconnect();
        section.classList.add('is-animated');
        items.forEach((item, index) => {
          item.animate(
            [
              { opacity: 0, transform: 'translateY(72px)', filter: 'blur(5px)' },
              { opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' },
            ],
            {
              duration: 760,
              delay: index * 180,
              easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
              fill: 'forwards',
            },
          );
        });
      },
      { threshold: 0.22 },
    );
    this.finalCtaObserver.observe(section);
  }
  private prepareDirectionalReveal(items: HTMLElement[], offsetX: number) {
    items.forEach((item) => {
      item.style.opacity = '0';
      item.style.transform = `translateX(${offsetX}px)`;
      item.style.filter = 'blur(5px)';
    });
  }

  private observeDirectionalReveal(
    heading: HTMLElement,
    items: HTMLElement[],
    offsetX: number,
  ) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        items.forEach((item, index) => {
          item.animate(
            [
              { opacity: 0, transform: `translateX(${offsetX}px)`, filter: 'blur(5px)' },
              { opacity: 1, transform: 'translateX(0)', filter: 'blur(0)' },
            ],
            {
              duration: 720,
              delay: index * 190,
              easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
              fill: 'forwards',
            },
          );
        });
      },
      { threshold: 0.24 },
    );
    observer.observe(heading);
    return observer;
  }
  private setupQuoteAnimation() {
    if (!this.quoteRef) return;

    const quote = this.quoteRef.nativeElement;
    const lines = Array.from(quote.querySelectorAll<HTMLElement>('.quote-line'));
    const characters = Array.from(quote.querySelectorAll<HTMLElement>('.quote-char'));
    const reviewer = quote.parentElement?.querySelector<HTMLElement>('.reviewer');

    characters.forEach((character) => {
      character.style.opacity = '0';
      character.style.transform = 'translate(-24px, 14px) rotate(-5deg)';
      character.style.filter = 'blur(4px)';
    });
    if (reviewer) reviewer.style.opacity = '0';

    this.quoteObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        this.quoteObserver?.disconnect();

        let delay = 0;
        lines.forEach((line) => {
          const lineCharacters = Array.from(line.querySelectorAll<HTMLElement>('.quote-char'));
          lineCharacters.forEach((character, characterIndex) => {
            character.animate(
              [
                { opacity: 0, transform: 'translate(-24px, 14px) rotate(-5deg)', filter: 'blur(4px)' },
                { opacity: 1, transform: 'translate(3px, -2px) rotate(1deg)', filter: 'blur(0)' },
                { opacity: 1, transform: 'translate(0, 0) rotate(0)', filter: 'blur(0)' },
              ],
              {
                duration: 390,
                delay: delay + characterIndex * 25,
                easing: 'cubic-bezier(0.2, 0.85, 0.3, 1.2)',
                fill: 'forwards',
              },
            );
          });
          delay += lineCharacters.length * 25 + 90;
        });

        reviewer?.animate(
          [
            { opacity: 0, transform: 'translateY(18px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ],
          { duration: 480, delay: delay + 80, easing: 'ease-out', fill: 'forwards' },
        );
      },
      { threshold: 0.08, rootMargin: '0px 0px -8% 0px' },
    );
    this.quoteObserver.observe(quote.closest('.testimonial') ?? quote);
  }
  private animateNumbers(container: HTMLElement) {
    const counters = Array.from(container.querySelectorAll<HTMLElement>('[data-count]'));
    const duration = 1600;
    const startedAt = performance.now();

    const draw = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      counters.forEach((counter) => {
        const target = Number(counter.dataset['count']);
        const decimals = Number(counter.dataset['decimals'] ?? 0);
        const suffix = counter.dataset['suffix'] ?? '';
        const value = decimals
          ? (target * eased).toFixed(decimals)
          : Math.floor(target * eased).toString();
        counter.textContent = `${value}${suffix}`;
      });

      if (progress < 1) this.counterFrame = requestAnimationFrame(draw);
    };

    this.counterFrame = requestAnimationFrame(draw);
  }

  ngOnDestroy() {
    this.numberObserver?.disconnect();
    this.storyObserver?.disconnect();
    this.quoteObserver?.disconnect();
    this.servicesHeadingObserver?.disconnect();
    this.teamHeadingObserver?.disconnect();
    this.collectionHeadingObserver?.disconnect();
    this.pricingHeadingObserver?.disconnect();
    this.contactHeadingObserver?.disconnect();
    this.finalCtaObserver?.disconnect();
    cancelAnimationFrame(this.counterFrame);
  }
}

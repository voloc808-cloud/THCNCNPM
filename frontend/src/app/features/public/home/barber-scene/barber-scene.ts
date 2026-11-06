import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import type * as ThreeNamespace from 'three';
type NavigatorMemory = Navigator & { deviceMemory?: number };
@Component({
  selector: 'app-barber-scene',
  templateUrl: './barber-scene.html',
  styleUrl: './barber-scene.scss',
  host: { '[class.ready]': 'loaded()', '[class.failed]': 'failed()' },
})
export class BarberScene implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) private canvasRef!: ElementRef<HTMLCanvasElement>;
  private readonly zone = inject(NgZone);
  readonly loaded = signal(false);
  readonly failed = signal(false);
  readonly progress = signal(0);
  private frame = 0;
  private resizeObserver?: ResizeObserver;
  private cleanupScroll?: () => void;
  private cleanupPointer?: () => void;
  private renderer?: ThreeNamespace.WebGLRenderer;
  private scene?: ThreeNamespace.Scene;
  ngAfterViewInit() {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          void this.init();
        }
      },
      { rootMargin: '300px' },
    );
    observer.observe(this.canvasRef.nativeElement);
  }
  private async init() {
    try {
      this.progress.set(18);
      const THREE = await import('three');
      this.progress.set(40);
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const nav = navigator as NavigatorMemory;
      const lowPower =
        innerWidth < 720 || (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4;
      const canvas = this.canvasRef.nativeElement;
      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: !lowPower,
        powerPreference: lowPower ? 'low-power' : 'high-performance',
      });
      this.renderer = renderer;
      renderer.setPixelRatio(Math.min(devicePixelRatio, lowPower ? 1 : 1.6));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      const scene = new THREE.Scene();
      this.scene = scene;
      scene.fog = new THREE.FogExp2(0x090909, 0.055);
      const camera = new THREE.PerspectiveCamera(34, innerWidth / innerHeight, 0.1, 100);
      camera.position.set(6, 2.8, 10);
      scene.add(camera);
      scene.add(new THREE.AmbientLight(0xd6b479, 1.05));
      const key = new THREE.SpotLight(0xffd691, 65, 28, 0.55, 0.65, 1);
      key.position.set(4, 8, 5);
      scene.add(key);
      const rim = new THREE.PointLight(0x9c5d22, 35, 18);
      rim.position.set(-5, 2, -3);
      scene.add(rim);
      const world = new THREE.Group();
      scene.add(world);
      this.buildScene(THREE, world, lowPower);
      this.progress.set(72);
      const resize = () => {
        const width = innerWidth,
          height = innerHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
      };
      resize();
      this.resizeObserver = new ResizeObserver(resize);
      this.resizeObserver.observe(document.body);
      let pointerX = 0,
        pointerY = 0;
      const onPointer = (event: PointerEvent) => {
        pointerX = (event.clientX / innerWidth - 0.5) * 0.45;
        pointerY = (event.clientY / innerHeight - 0.5) * 0.25;
      };
      if (!reduced && !lowPower) {
        addEventListener('pointermove', onPointer, { passive: true });
        this.cleanupPointer = () => removeEventListener('pointermove', onPointer);
      }
      const clock = new THREE.Clock();
      const render = () => {
        const elapsed = clock.getElapsedTime();
        if (!reduced) {
          world.rotation.y += (pointerX - world.rotation.y) * 0.025;
          world.rotation.x += (pointerY - world.rotation.x) * 0.025;
          world.position.y = Math.sin(elapsed * 0.55) * 0.08;
        }
        renderer.render(scene, camera);
        if (!reduced) this.frame = requestAnimationFrame(render);
      };
      this.zone.runOutsideAngular(() => render());
      if (!reduced) await this.setupScroll(camera, world);
      this.progress.set(100);
      setTimeout(() => this.loaded.set(true), 220);
    } catch (error) {
      console.error('Không thể khởi tạo cảnh 3D', error);
      this.failed.set(true);
      this.loaded.set(true);
    }
  }
  private buildScene(
    THREE: typeof import('three'),
    world: ThreeNamespace.Group,
    lowPower: boolean,
  ) {
    const gold = new THREE.MeshStandardMaterial({
      color: 0xc19046,
      metalness: 0.88,
      roughness: 0.24,
    });
    const darkMetal = new THREE.MeshStandardMaterial({
      color: 0x282521,
      metalness: 0.8,
      roughness: 0.32,
    });
    const leather = new THREE.MeshStandardMaterial({
      color: 0x171513,
      metalness: 0.12,
      roughness: 0.62,
    });
    const copper = new THREE.MeshStandardMaterial({
      color: 0x8b542b,
      metalness: 0.76,
      roughness: 0.3,
    });
    const chair = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.9, 0.28, 48), darkMetal);
    base.position.y = -2.45;
    chair.add(base);
    const column = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.42, 2, 32), gold);
    column.position.y = -1.4;
    chair.add(column);
    const seat = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.52, 3.05), leather);
    seat.position.y = -0.25;
    seat.rotation.x = -0.05;
    chair.add(seat);
    const back = new THREE.Mesh(new THREE.BoxGeometry(3.25, 3.8, 0.58), leather);
    back.position.set(0, 1.75, 1.2);
    back.rotation.x = -0.18;
    chair.add(back);
    for (const side of [-1, 1]) {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.28, 2.4), darkMetal);
      arm.position.set(side * 1.72, 0.78, 0.02);
      chair.add(arm);
      const support = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 1.25, 16), gold);
      support.position.set(side * 1.72, 0.18, 0.35);
      chair.add(support);
    }
    chair.rotation.y = -0.35;
    world.add(chair);
    const scissors = new THREE.Group();
    for (const side of [-1, 1]) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.1, 12, 32), gold);
      ring.position.set(side * 0.5, -1.2, 0);
      scissors.add(ring);
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.13, 2.9, 0.08), darkMetal);
      blade.position.set(side * 0.16, 0.42, 0);
      blade.rotation.z = side * 0.13;
      scissors.add(blade);
    }
    scissors.position.set(-4.1, 1.5, -1.2);
    scissors.rotation.set(0.3, 0.35, -0.55);
    world.add(scissors);
    const clipper = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.35, 2.7, 0.75), copper);
    body.rotation.z = -0.12;
    clipper.add(body);
    for (let i = 0; i < 7; i++) {
      const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.5, 0.5), darkMetal);
      tooth.position.set(-0.42 + i * 0.14, 1.55, 0);
      clipper.add(tooth);
    }
    clipper.position.set(4.3, 0.1, -1.5);
    clipper.rotation.set(0.15, -0.5, 0.42);
    world.add(clipper);
    const comb = new THREE.Group();
    const spine = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.28, 0.15), gold);
    comb.add(spine);
    for (let i = 0; i < 18; i++) {
      const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.72, 0.1), gold);
      tooth.position.set(-1.78 + i * 0.21, -0.46, 0);
      comb.add(tooth);
    }
    comb.position.set(3.6, 3.5, -3);
    comb.rotation.z = -0.35;
    world.add(comb);
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(7, 64),
      new THREE.MeshStandardMaterial({ color: 0x15120e, metalness: 0.2, roughness: 0.85 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2.6;
    world.add(floor);
    if (!lowPower) {
      const points = [];
      for (let i = 0; i < 110; i++)
        points.push((Math.random() - 0.5) * 16, Math.random() * 10 - 3, (Math.random() - 0.5) * 10);
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
      world.add(
        new THREE.Points(
          geometry,
          new THREE.PointsMaterial({
            color: 0xc79b56,
            size: 0.025,
            transparent: true,
            opacity: 0.5,
          }),
        ),
      );
    }
  }
  private async setupScroll(camera: ThreeNamespace.PerspectiveCamera, world: ThreeNamespace.Group) {
    const [{ gsap }, { ScrollTrigger }] = await Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ]);
    gsap.registerPlugin(ScrollTrigger);
    const root = document.querySelector('.home-story');
    if (!root) return;
    const context = gsap.context(() => {
      const timeline = gsap.timeline({
        scrollTrigger: { trigger: root, start: 'top top', end: '75% bottom', scrub: 1.1 },
      });
      timeline
        .to(camera.position, { x: -5, y: 3.8, z: 8, ease: 'none' }, 0)
        .to(world.rotation, { y: 1.15, ease: 'none' }, 0)
        .to(camera.position, { x: 4.5, y: 1, z: 7, ease: 'none' }, 0.35)
        .to(world.rotation, { y: 2.6, x: 0.12, ease: 'none' }, 0.35)
        .to(camera.position, { x: 0, y: 5.5, z: 9, ease: 'none' }, 0.7)
        .to(world.rotation, { y: 4.1, x: -0.1, ease: 'none' }, 0.7);
      gsap.utils
        .toArray<HTMLElement>('.reveal', root)
        .forEach((element) =>
          gsap.from(element, {
            opacity: 0,
            y: 55,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: element,
              start: 'top 86%',
              toggleActions: 'play none none reverse',
            },
          }),
        );
      gsap.utils
        .toArray<HTMLElement>('[data-parallax]', root)
        .forEach((element) =>
          gsap.to(element, {
            y: -70,
            ease: 'none',
            scrollTrigger: {
              trigger: element,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }),
        );
    }, root);
    this.cleanupScroll = () => context.revert();
  }
  ngOnDestroy() {
    cancelAnimationFrame(this.frame);
    this.resizeObserver?.disconnect();
    this.cleanupScroll?.();
    this.cleanupPointer?.();
    this.scene?.traverse((object) => {
      if ('geometry' in object) (object as ThreeNamespace.Mesh).geometry?.dispose();
      if ('material' in object) {
        const material = (object as ThreeNamespace.Mesh).material;
        for (const item of Array.isArray(material) ? material : [material]) item?.dispose();
      }
    });
    this.renderer?.dispose();
  }
}

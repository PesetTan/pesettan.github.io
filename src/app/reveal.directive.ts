import { afterNextRender, Directive, ElementRef, inject, NgZone, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appReveal]',
  standalone: true,
})
export class RevealDirective implements OnDestroy {
  private readonly element = inject(ElementRef<HTMLElement>).nativeElement;
  private readonly zone = inject(NgZone);
  private observer?: IntersectionObserver;
  private motionPreference?: MediaQueryList;

  private readonly reveal = () => {
    this.element.classList.add('is-revealed');
    this.observer?.disconnect();
  };

  private readonly onMotionChange = () => {
    if (this.motionPreference?.matches) this.reveal();
  };

  constructor() {
    afterNextRender(() => this.zone.runOutsideAngular(() => {
      this.motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (this.motionPreference.matches || !('IntersectionObserver' in window)) return;

      // Keep content visible unless the browser can reveal it as it enters view.
      this.observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) this.reveal();
      }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });
      this.element.classList.add('reveal-ready');
      this.observer.observe(this.element);
      this.motionPreference.addEventListener('change', this.onMotionChange);
    }));
  }

  ngOnDestroy() {
    this.observer?.disconnect();
    this.motionPreference?.removeEventListener('change', this.onMotionChange);
  }
}

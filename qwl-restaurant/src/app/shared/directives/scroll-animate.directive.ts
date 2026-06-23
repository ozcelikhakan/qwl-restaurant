import { Directive, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';

/**
 * Adds scroll-based entrance animations to HTML elements.
 * The animation starts when the element becomes visible in the viewport.
 */
@Directive({
  selector: '[owlAnimate]',
  standalone: true
})
export class ScrollAnimateDirective implements OnInit, OnDestroy {
  /**
   * Defines the animation type.
   * Supported values: fadeInUp, fadeInLeft, fadeInRight.
   */
  @Input() owlAnimate: string = 'fadeInUp';

  /**
   * Defines the animation delay in milliseconds.
   */
  @Input() animateDelay: number = 0;

  /**
   * Observes when the element enters the viewport.
   */
  private observer!: IntersectionObserver;

  /**
   * Injects the host HTML element where the directive is used.
   */
  constructor(private el: ElementRef<HTMLElement>) {}

  /**
   * Initializes the animation styles and starts observing the element.
   */
  ngOnInit(): void {
    const el = this.el.nativeElement;

    /**
     * Sets the initial hidden state before the element becomes visible.
     */
    el.style.opacity = '0';

    /**
     * Adds transition rules for opacity and transform animations.
     */
    el.style.transition = `opacity 0.6s ease ${this.animateDelay}ms, transform 0.6s ease ${this.animateDelay}ms`;

    /**
     * Applies the initial transform based on the selected animation type.
     */
    if (this.owlAnimate === 'fadeInUp') {
      el.style.transform = 'translateY(30px)';
    } else if (this.owlAnimate === 'fadeInLeft') {
      el.style.transform = 'translateX(-30px)';
    } else if (this.owlAnimate === 'fadeInRight') {
      el.style.transform = 'translateX(30px)';
    }

    /**
     * Creates an IntersectionObserver to detect when the element enters the viewport.
     */
    this.observer = new IntersectionObserver(
      ([entry]) => {
        /**
         * If the element is visible, animate it into its final position.
         */
        if (entry.isIntersecting) {
          el.style.opacity = '1';
          el.style.transform = 'translate(0)';

          /**
           * Stops observing after the animation runs once.
           */
          this.observer.unobserve(el);
        }
      },
      {
        /**
         * Animation starts when 15% of the element is visible.
         */
        threshold: 0.15
      }
    );

    /**
     * Starts observing the host element.
     */
    this.observer.observe(el);
  }

  /**
   * Cleans up the observer when the directive is destroyed.
   */
  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
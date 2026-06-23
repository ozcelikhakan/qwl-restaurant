import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

@Component({
  selector: 'app-page-banner',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="page-banner" [style.background-image]="'url(' + bgImage + ')' ">
      <div class="banner-content">
        <h1>{{title}}</h1>
        <nav class="breadcrumb">
        @for (item of breadcrumbs; track item.label; let last = $last) {
          @if (!last) {
            <a [routerLink]="item.path">{{ item.label }}</a>
            <span>/</span>
          } @else {
            <span>{{ item.label }}</span>
          }
        }
      </nav>
      </div>
    </section>
  `,
})
export class PageBannerComponent {
  @Input() title = '';
  @Input() bgImage = '/assets/images/page-banner.jpg';
  @Input() breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home Page', path: '/' }
  ];
}

import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="pt-20 min-h-screen flex flex-col items-center justify-center text-center px-6">
    <span class="font-cursive text-8xl text-owl-primary">404</span>
    <h1 class="font-heading text-4xl text-owl-dark mt-2 mb-4">Page not found</h1>
    <p class="text-owl-text mb-8 max-w-md">The page you are looking for does not exist or may have been moved</p>
    <a routerLink="/" class="btn-owl btn-filled">Return to homepage</a>
    </div>
    `

})
export class NotFoundComponent {}
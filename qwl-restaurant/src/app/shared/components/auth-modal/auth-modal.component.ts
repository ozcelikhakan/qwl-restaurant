import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoginDto, RegisterDto } from '../../../core/models/auth.models';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-modal.component.html',
  styleUrl: './auth-modal.component.scss'
})
export class AuthModalComponent {
  auth = inject(AuthService);
  router = inject(Router);

  activeTab = signal<'login' | 'register'>('login');
  loading = signal(false);
  error = signal('');

  loginDto: LoginDto = { email: '', password: '' };
  registerDto: RegisterDto = { firstName: '', lastName: '', email: '', password: '' };

  switchTab(tab: 'login' | 'register'): void {
    this.activeTab.set(tab);
    this.error.set('');
  }

  onLogin(): void {
    this.loading.set(true);
    this.error.set('');
    this.auth.login(this.loginDto).subscribe({
      next: () => {
        this.loading.set(false);
        this.auth.closeAuthModal();
        if (this.auth.isAdmin()) {
          this.router.navigate(['/admin']);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'Giriş başarısız.');
      }
    });
  }

  onRegister(): void {
    this.loading.set(true);
    this.error.set('');
    this.auth.register(this.registerDto).subscribe({
      next: () => {
        this.loading.set(false);
        this.auth.closeAuthModal();
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'Kayıt başarısız.');
      }
    });
  }

  closeOnBackdrop(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.auth.closeAuthModal();
    }
  }
}  
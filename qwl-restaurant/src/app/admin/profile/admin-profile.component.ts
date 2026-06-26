import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-profile.component.html',
})
export class AdminProfileComponent {
  // Inject authentication service to access and update admin account data
  auth = inject(AuthService);

  // Profile information feedback states
  infoSaved     = signal(false);
  infoError     = signal('');

  // Password update feedback states
  passwordSaved = signal(false);
  passwordError = signal('');

  // Admin profile information form data
  info = {
    firstName: this.auth.user()?.firstName ?? 'Admin',
    lastName:  this.auth.user()?.lastName  ?? '',
    email:     this.auth.user()?.email     ?? 'admin@qwlrestaurant.com',
    phone:     '',
    avatarUrl: this.auth.user()?.avatarUrl ?? '',
  };

  // Password change form data
  passwords = {
    current:  '',
    next:     '',
    confirm:  '',
  };

  // Saves updated admin profile information
  saveInfo(): void {
    this.infoError.set('');
    this.auth.updateProfile({
      firstName: this.info.firstName,
      lastName:  this.info.lastName,
      phone:     this.info.phone || undefined,
      avatarUrl: this.info.avatarUrl || undefined,
    }).subscribe({
      next: () => {
        this.infoSaved.set(true);

        // Hide success message after 3 seconds
        setTimeout(() => this.infoSaved.set(false), 3000);
      },
      error: () => this.infoError.set('Information could not be updated.'),
    });
  }

  // Saves the new admin password after validation
  savePassword(): void {
    this.passwordError.set('');
    if (!this.passwords.current) {
      this.passwordError.set('Please enter your current password.');
      return;
    }
    if (this.passwords.next.length < 6) {
      this.passwordError.set('New password must be at least 6 characters.');
      return;
    }
    if (this.passwords.next !== this.passwords.confirm) {
      this.passwordError.set('New passwords do not match.');
      return;
    }
    this.auth.changePassword(this.passwords.current, this.passwords.next).subscribe({
      next: () => {
        this.passwords = { current: '', next: '', confirm: '' };
        this.passwordSaved.set(true);

        // Hide success message after 3 seconds
        setTimeout(() => this.passwordSaved.set(false), 3000);
      },
      error: (err) => {
        this.passwordError.set(err.error?.message ?? 'Password could not be changed.');
      },
    });
  }
}
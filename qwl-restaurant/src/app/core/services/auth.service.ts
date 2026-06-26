import { Injectable, signal, computed } from "@angular/core";
import { AuthResponse, AuthUser, RegisterDto, LoginDto, UpdateProfileDto } from "../models/auth.models";
import { HttpClient } from "@angular/common/http";
import { tap } from "rxjs";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";


@Injectable({ providedIn: 'root'})
export class AuthService {
  private readonly _user = signal<AuthUser | null>(this.loadUser());
  private readonly _showAuthModal = signal(false);

  readonly user = this._user.asReadonly();
  readonly showAuthModal = this._showAuthModal.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);
  readonly isAdmin = computed(() => this._user()?.roles?.includes('Admin') ?? false);

  constructor(private http: HttpClient) {}

  register(dto: RegisterDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, dto)
    .pipe(tap(res => this.saveSession(res)));
  }

  login(dto: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, dto)
    .pipe(tap(res => this.saveSession(res)));
  }

  logout(): void {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('auth_user');
    this._user.set(null);
  }

  openAuthModal(): void {
    this._showAuthModal.set(true);
  }

  closeAuthModal(): void {
    this._showAuthModal.set(false);
  }

  getAccessToken(): string | null {
    return sessionStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return sessionStorage.getItem('refresh_token');
  }
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/refresh`, {refreshToken})
    .pipe(tap(res => this.saveSession(res)));
  }

  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/auth/change-password`, {currentPassword, newPassword});
  } 

  updateProfile(dto: UpdateProfileDto): Observable<{ firstName: string; lastName: string; phone: string; avatarUrl?: string }> {
    return this.http.put<{ firstName: string; lastName: string; phone: string; avatarUrl?: string }>(
      `${environment.apiUrl}/auth/profile`, dto
    ).pipe(tap(res => {
      const current = this._user();
      if (!current) return;
      const updated: AuthUser = { ...current, firstName: res.firstName, lastName: res.lastName, avatarUrl: res.avatarUrl };
      sessionStorage.setItem('auth_user', JSON.stringify(updated));
      this._user.set(updated);
    }));
  }  

  private saveSession(res: AuthResponse): void {
    sessionStorage.setItem('access_token', res.accessToken);
    sessionStorage.setItem('refreshToken', res.refreshToken);
    const user: AuthUser = {
      userId: res.userId,
      email: res.email,
      firstName: res.firstName,
      lastName: res.lastName,
      avatarUrl: res.avatarUrl,
      roles: res.roles
    };
    sessionStorage.setItem('auth_user', JSON.stringify(user));
    this._user.set(user);
  }  

  private loadUser(): AuthUser | null {
    const raw = sessionStorage.getItem('auth_user');
    return raw ? JSON.parse(raw) : null;
  }

}
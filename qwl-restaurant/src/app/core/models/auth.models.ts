export interface RegisterDto {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface LoginDto {
    email: string;
    password: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    accessTokenExpirt: string;
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    roles: string[];
}

export interface AuthUser {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    roles: string[];
}

export interface UpdateProfileDto {
    firstName: string;
    lastName: string;
    phone?: string;
    avatarUrl?: string;
}
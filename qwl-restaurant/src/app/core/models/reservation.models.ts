export interface CreateReservationDto {
    fullName: string;
    email: string;
    phone: string;
    reservationDate: string;
    reservationTime: string;
    personCount: number;
    message: string | null;
    tableNumber?: string | null;
}

export interface ReservationDto {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    reservationDate: string;
    reservationTime: string;
    personCount: number;
    message: string | null;
    tableNumber: string | null;
    createdAt: string;
}

export enum ReservationStatus {
    Pending = 0,
    Confirmed = 1,
    Cancelled = 2
}
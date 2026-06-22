export interface CreateContactMessageDto {
    fullName: string;
    email: string;
    phone: string | null;
    subject: string;
    message: string;
}

export interface ContactMessageDto {
    id: number;
    fullName: string;
    email: string;
    subject: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}
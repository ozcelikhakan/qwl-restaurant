export interface EventDto {
    id: number;
    title: string;
    description: string;
    imageUrl: string | null;
    eventDate: string;
    startTime: string;
    endTime: string;
    location: string | null;
    ticketPrice: number;
    totalSlots: number;
    bookedSlots: number;
    avaibleSlots: number;
    isActive: boolean;
    status: 'Happening' | 'Upcoming' | 'Expired';
}

export interface CreateEventDto {
    title: string;
    description: string;
    imageUrl: string | null;
    eventDate: string;
    startTime: string;
    endTime: string;
    location: string | null;
    ticketPrice: number;
    totalSlots: number;

}

export interface BuyTicketDto {
    eventId: number;
    quantity: number;
}

export interface EventTicketDto {
    id: number;
    eventId: number;
    eventTitle: number;
    eventDate: string;
    quantity: number;
    totalPrice: number;
    status: string;
    purchasedAt: string;
}

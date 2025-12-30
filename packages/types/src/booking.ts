export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  userId: string;
  staffId: string;
  serviceId: string;
  scheduledAt: Date;
  durationMinutes: number;
  status: BookingStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingWithDetails extends Booking {
  user: {
    firstName: string;
    lastName: string;
    phone?: string;
  };
  staff: {
    name: string;
  };
  service: {
    name: string;
    price: number;
  };
}
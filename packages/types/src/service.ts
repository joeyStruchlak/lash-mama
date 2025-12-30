export type ServiceCategory = 
  | 'mega-volume' 
  | 'volume' 
  | 'natural-hybrid' 
  | 'makeup' 
  | 'hair-styling' 
  | 'bridal' 
  | 'packages' 
  | 'courses';

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  description?: string;
  durationMinutes: number;
  basePrice: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceOption extends Service {
  subServices?: Service[];
}
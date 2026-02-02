
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  photoUrl: string;
  instagram?: string;
  facebook?: string;
  whatsapp?: string;
  notes: string;
  history: Appointment[];
  createdAt: string;
  status?: 'active' | 'vip' | 'inactive';
  tags?: string[];
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  date: string; // ISO string
  time: string; // HH:mm
  service: string;
  status: 'scheduled' | 'completed' | 'canceled';
  notes?: string;
  servicePhotos?: string[]; // Array of base64 strings
  serviceNotes?: string;   // Professional observations
}

export type ViewType = 'daily' | 'weekly' | 'monthly';

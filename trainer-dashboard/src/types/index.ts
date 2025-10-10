// Types for the Pet Trainer Dashboard

export interface Pet {
  id: string;
  name: string;
  breed: string;
  age: number;
  weight: number;
  gender: 'male' | 'female';
  medicalHistory: string[];
  behaviorNotes: string;
  photoUrl?: string;
  ownerId: string;
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  joinDate: Date;
  pets: Pet[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface TrainingSession {
  id: string;
  clientId: string;
  petId: string;
  date: Date;
  duration: number; // in minutes
  type: 'individual' | 'group' | 'behavioral' | 'puppy' | 'advanced';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes: string;
  goals: string[];
  achievements: string[];
  homework: string[];
  nextSteps: string[];
  trainerId: string;
}

export interface Invoice {
  id: string;
  clientId: string;
  sessionIds: string[];
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  dueDate: Date;
  paidDate?: Date;
  services: {
    description: string;
    quantity: number;
    rate: number;
  }[];
}

export interface Trainer {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialties: string[];
  certifications: string[];
  avatar?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  read: boolean;
  type: 'text' | 'image' | 'file';
}

export interface BusinessMetrics {
  totalClients: number;
  activeClients: number;
  totalSessions: number;
  completedSessions: number;
  monthlyRevenue: number;
  averageSessionRating: number;
  clientRetentionRate: number;
}

export interface Appointment {
  id: string;
  title: string;
  clientId: string;
  petId: string;
  date: Date;
  duration: number;
  type: TrainingSession['type'];
  status: TrainingSession['status'];
  notes?: string;
}
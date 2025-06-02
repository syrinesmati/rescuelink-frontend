// src/types/rescue.d.ts

export enum MissionStatus {
  PENDING = "PENDING",
  EN_ROUTE = "EN_ROUTE",
  ON_SITE = "ON_SITE",
  COMPLETED = "COMPLETED"
}

export enum EmergencyStatus {
  RECEIVED = "RECEIVED",
  DISPATCHED = "DISPATCHED",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED"
}

export type EmergencyUrgency = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";


export type Location = {
  id?: number;
  latitude: number;
  longitude: number;
  address?: string;
  timestamp?: string;
};

export type EmergencyReport = {
  id: number;
  description: string;
  location: Location;
  status: EmergencyStatus;
  reportedAt: string;
  urgencyLevel: number;
  citizenId: number;
  assignedResponders?: Responder[]; 
};



export interface Emergency {
  id: number;
  description: string;
  location: string;
  status: EmergencyStatus;
  urgency: EmergencyUrgency;
  assignedTo?: number[];
  submittedAt: Date;
}

export type CreateEmergencyReportInput = {
  description: string;
  location: Omit<Location, 'id' | 'timestamp'>;
  urgencyLevel: number;
  citizenId: number;
  status?: EmergencyStatus;
};

// In your types file (e.g., types/rescue.ts)
export type Responder = {
  id: number;
  name: string;
  status: "AVAILABLE" | "ASSIGNED" | "ON_MISSION";
  location?: string;
  // Add other responder properties as needed
};
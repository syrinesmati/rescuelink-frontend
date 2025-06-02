export interface Location {
  address: string;
  latitude: number;
  longitude: number;
}

export type MissionStatus = "ASSIGNED" | "EN_ROUTE" | "ON_SITE" | "COMPLETED";

export interface Mission {
  id: number;
  description: string;
  location: Location;
  status: MissionStatus;
  assignedAt: string; // ISO date string
}

export type MessageSender = "COORDINATOR" | "RESPONDER";

export interface MissionMessage {
  id: number;
  sender: MessageSender;
  content: string;
  timestamp: string; // ISO date string
}
export enum EmergencyStatus {
  RECEIVED = 'RECEIVED',
  DISPATCHED = 'DISPATCHED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
}

export enum MissionStatus {
  EN_ROUTE = 'EN_ROUTE',
  ON_SITE = 'ON_SITE',
  COMPLETED = 'COMPLETED',
  ASSIGNED = 'ASSIGNED'
}

export enum ResponderRoleEnum {
  POLICE = "POLICE",
  FIREFIGHTER = "FIREFIGHTER",
  MEDICAL = "MEDICAL"
}

export enum ResponderStatusEnum {
  AVAILABLE = 'AVAILABLE',
  ON_DUTY = 'ON_DUTY',
  OFF_DUTY = 'OFF_DUTY',
}

export enum UserRoleEnum {
  CITIZEN='citizen',
  RESPONDER='responder',
  COORDINATOR='coordinator'
}
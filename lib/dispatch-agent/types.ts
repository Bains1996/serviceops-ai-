export type DriverStatus = "OFF_DUTY" | "AVAILABLE" | "EN_ROUTE" | "AT_PICKUP" | "AT_DROPOFF" | "DELAYED" | "BREAKDOWN";

export type EquipmentType = "DRY_VAN" | "REEFER";

export type LoadStatus = "OPEN" | "ASSIGNED" | "IN_PROGRESS" | "DELIVERED";

export type ApprovalDecision = "APPROVE" | "REJECT";

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export type Driver = {
  id: string;
  name: string;
  phone: string;
  equipment: EquipmentType;
  status: DriverStatus;
  city: string;
  lat?: number;
  lng?: number;
  currentLoadId?: string;
  lastUpdateAt: string;
};

export type Load = {
  id: string;
  customer: string;
  origin: string;
  destination: string;
  pickupAt: string;
  deliveryAt: string;
  equipment: EquipmentType;
  rateCad: number;
  loadedMiles: number;
  deadheadMiles: number;
  status: LoadStatus;
  assignedDriverId?: string;
};

export type TimelineEvent = {
  id: string;
  at: string;
  actor: string;
  title: string;
  detail: string;
};

export type OutboundMessage = {
  id: string;
  at: string;
  to: string;
  body: string;
};

export type ApprovalItem = {
  id: string;
  at: string;
  status: ApprovalStatus;
  workflow: "NEXT_LOAD_ASSIGNMENT";
  reason: string;
  driverId: string;
  loadId: string;
  score: number;
  deadheadMiles: number;
  ratePerMile: number;
  recommendedMessage: string;
};

export type DispatchState = {
  updatedAt: string;
  drivers: Driver[];
  loads: Load[];
  approvals: ApprovalItem[];
  timeline: TimelineEvent[];
  outbound: OutboundMessage[];
};

export type DriverMessageInput = {
  driverId: string;
  text: string;
};

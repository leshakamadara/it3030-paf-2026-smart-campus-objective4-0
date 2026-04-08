export type ResourceType =
  | "LECTURE_HALL"
  | "LAB"
  | "MEETING_ROOM"
  | "PROJECTOR"
  | "CAMERA";

export type ResourceStatus = "ACTIVE" | "OUT_OF_SERVICE";

export type ResourceDisplayStatus =
  | "AVAILABLE"
  | "OUT_OF_SERVICE"
  | "UNDER_MAINTENANCE"
  | "NOT_AVAILABLE_NOW";

export interface Resource {
  id: number;
  resourceCode: string;
  name: string;
  type: ResourceType;
  building: string;
  status: ResourceStatus;
  availableFrom: string;
  availableTo: string;
  isBookable: boolean;
  isUnderMaintenance: boolean;
  description?: string | null;
  capacity?: number | null;
  imageUrl?: string | null;
  hasProjector: boolean;
  hasAc: boolean;
  hasWhiteboard: boolean;
  hasWifi: boolean;
  hasComputers: boolean;
  hasWindows: boolean;
  createdAt: string;
  updatedAt: string;
  displayStatus?: ResourceDisplayStatus | string;
}

export interface ResourceRequest {
  resourceCode: string;
  name: string;
  type: ResourceType;
  building: string;
  status: ResourceStatus;
  availableFrom: string;
  availableTo: string;
  isBookable: boolean;
  isUnderMaintenance: boolean;
  description?: string;
  capacity?: number | null;
  imageUrl?: string;
  hasProjector: boolean;
  hasAc: boolean;
  hasWhiteboard: boolean;
  hasWifi: boolean;
  hasComputers: boolean;
  hasWindows: boolean;
}

export interface ResourceStats {
  total: number;
  active: number;
  outOfService: number;
  underMaintenance: number;
  bookable: number;
  nonBookable: number;
  byType: Record<string, number>;
  byBuilding: Record<string, number>;
}

export interface ResourceFilters {
  name?: string;
  type?: ResourceType;
  building?: string;
  status?: ResourceStatus;
  isBookable?: boolean;
  isUnderMaintenance?: boolean;
  minCapacity?: number;
  maxCapacity?: number;
  hasProjector?: boolean;
  hasAc?: boolean;
  hasWhiteboard?: boolean;
  hasWifi?: boolean;
  hasComputers?: boolean;
  hasWindows?: boolean;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
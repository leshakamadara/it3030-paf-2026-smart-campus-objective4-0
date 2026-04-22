import type {
  PaginatedResponse,
  Resource,
  ResourceFilters,
  ResourceRequest,
  ResourceStats,
} from "../types/resource";
import { getStoredToken } from "./auth";

const API_BASE_URL = "http://localhost:8080/api/resources";
const USE_MOCK_DATA = false;

type BackendResourcePayload = {
  id: number;
  resourceCode: string;
  name: string;
  type: Resource["type"];
  building: string;
  status: Resource["status"];
  availableFrom: string;
  availableTo: string;
  bookable?: boolean;
  isBookable?: boolean;
  underMaintenance?: boolean;
  isUnderMaintenance?: boolean;
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
  displayStatus?: string;
};

const mockResources: Resource[] = [
  {
    id: 1,
    resourceCode: "LAB001",
    name: "Computer Lab 1",
    type: "LAB",
    building: "Engineering Building",
    status: "ACTIVE",
    availableFrom: "08:00:00",
    availableTo: "17:00:00",
    isBookable: true,
    isUnderMaintenance: false,
    description: "Primary computing lab with 40 high-performance workstations.",
    capacity: 40,
    imageUrl: null,
    hasProjector: true,
    hasAc: true,
    hasWhiteboard: true,
    hasWifi: true,
    hasComputers: true,
    hasWindows: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    displayStatus: "AVAILABLE",
  },
  {
    id: 2,
    resourceCode: "LH001",
    name: "Lecture Hall A",
    type: "LECTURE_HALL",
    building: "Main Building",
    status: "ACTIVE",
    availableFrom: "09:00:00",
    availableTo: "16:00:00",
    isBookable: true,
    isUnderMaintenance: false,
    description: "Large capacity lecture hall for main campus events.",
    capacity: 120,
    imageUrl: null,
    hasProjector: true,
    hasAc: true,
    hasWhiteboard: true,
    hasWifi: true,
    hasComputers: false,
    hasWindows: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    displayStatus: "AVAILABLE",
  },
];

const delay = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const normalizeResource = (payload: BackendResourcePayload): Resource => ({
  id: payload.id,
  resourceCode: payload.resourceCode,
  name: payload.name,
  type: payload.type,
  building: payload.building,
  status: payload.status,
  availableFrom: payload.availableFrom,
  availableTo: payload.availableTo,
  isBookable: payload.bookable ?? payload.isBookable ?? false,
  isUnderMaintenance:
    payload.underMaintenance ?? payload.isUnderMaintenance ?? false,
  description: payload.description ?? null,
  capacity: payload.capacity ?? null,
  imageUrl: payload.imageUrl ?? null,
  hasProjector: payload.hasProjector,
  hasAc: payload.hasAc,
  hasWhiteboard: payload.hasWhiteboard,
  hasWifi: payload.hasWifi,
  hasComputers: payload.hasComputers,
  hasWindows: payload.hasWindows,
  createdAt: payload.createdAt,
  updatedAt: payload.updatedAt,
  displayStatus: payload.displayStatus,
});

const toBackendRequest = (request: ResourceRequest) => ({
  resourceCode: request.resourceCode,
  name: request.name,
  type: request.type,
  building: request.building,
  status: request.status,
  availableFrom: request.availableFrom,
  availableTo: request.availableTo,

  // Send both forms to be safe with backend property naming
  bookable: request.isBookable,
  isBookable: request.isBookable,
  underMaintenance: request.isUnderMaintenance,
  isUnderMaintenance: request.isUnderMaintenance,

  description: request.description,
  capacity: request.capacity,
  imageUrl: request.imageUrl,
  hasProjector: request.hasProjector,
  hasAc: request.hasAc,
  hasWhiteboard: request.hasWhiteboard,
  hasWifi: request.hasWifi,
  hasComputers: request.hasComputers,
  hasWindows: request.hasWindows,
});

const buildQueryString = (filters?: ResourceFilters): string => {
  if (!filters) return "";

  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    params.append(key, String(value));
  });

  const query = params.toString();
  return query ? `?${query}` : "";
};

const buildDisplayStatus = (resource: Resource): string => {
  if (resource.isUnderMaintenance) return "UNDER_MAINTENANCE";
  if (resource.status === "OUT_OF_SERVICE") return "OUT_OF_SERVICE";

  const currentTime = new Date().toTimeString().slice(0, 8);

  if (
    resource.availableFrom &&
    resource.availableTo &&
    (currentTime < resource.availableFrom || currentTime > resource.availableTo)
  ) {
    return "NOT_AVAILABLE_NOW";
  }

  return "AVAILABLE";
};

const alphaCompare = (a: string, b: string): number => {
  const aLower = a.toLowerCase();
  const bLower = b.toLowerCase();

  for (let i = 0; i < Math.max(aLower.length, bLower.length); i += 1) {
    const aChar = aLower.charCodeAt(i) || 0;
    const bChar = bLower.charCodeAt(i) || 0;

    if (aChar !== bChar) {
      return aChar - bChar;
    }
  }

  return 0;
};

const applyMockFilters = (
  resources: Resource[],
  filters?: ResourceFilters,
): PaginatedResponse<Resource> => {
  let result = [...resources];

  if (filters?.name) {
    result = result.filter((r) =>
      r.name.toLowerCase().includes(filters.name!.toLowerCase()),
    );
  }

  if (filters?.type) {
    result = result.filter((r) => r.type === filters.type);
  }

  if (filters?.building) {
    result = result.filter((r) =>
      r.building.toLowerCase().includes(filters.building!.toLowerCase()),
    );
  }

  if (filters?.status) {
    result = result.filter((r) => r.status === filters.status);
  }

  if (filters?.isBookable !== undefined) {
    result = result.filter((r) => r.isBookable === filters.isBookable);
  }

  if (filters?.isUnderMaintenance !== undefined) {
    result = result.filter(
      (r) => r.isUnderMaintenance === filters.isUnderMaintenance,
    );
  }

  if (filters?.minCapacity !== undefined) {
    result = result.filter(
      (r) => r.capacity != null && r.capacity >= filters.minCapacity!,
    );
  }

  if (filters?.maxCapacity !== undefined) {
    result = result.filter(
      (r) => r.capacity != null && r.capacity <= filters.maxCapacity!,
    );
  }

  if (filters?.hasProjector !== undefined) {
    result = result.filter((r) => r.hasProjector === filters.hasProjector);
  }

  if (filters?.hasAc !== undefined) {
    result = result.filter((r) => r.hasAc === filters.hasAc);
  }

  if (filters?.hasWhiteboard !== undefined) {
    result = result.filter((r) => r.hasWhiteboard === filters.hasWhiteboard);
  }

  if (filters?.hasWifi !== undefined) {
    result = result.filter((r) => r.hasWifi === filters.hasWifi);
  }

  if (filters?.hasComputers !== undefined) {
    result = result.filter((r) => r.hasComputers === filters.hasComputers);
  }

  if (filters?.hasWindows !== undefined) {
    result = result.filter((r) => r.hasWindows === filters.hasWindows);
  }

  const sortBy = filters?.sortBy ?? "id";
  const direction = filters?.direction ?? "asc";

  result.sort((a, b) => {
    const aVal = String(a[sortBy as keyof Resource] ?? "");
    const bVal = String(b[sortBy as keyof Resource] ?? "");

    const cmp =
      sortBy === "name" ? alphaCompare(aVal, bVal) : aVal.localeCompare(bVal);

    return direction === "desc" ? -cmp : cmp;
  });

  const page = filters?.page ?? 0;
  const size = filters?.size ?? 10;
  const start = page * size;

  const content = result.slice(start, start + size).map((r) => ({
    ...r,
    displayStatus: buildDisplayStatus(r),
  }));

  return {
    content,
    totalElements: result.length,
    totalPages: Math.ceil(result.length / size) || 1,
    size,
    number: page,
    first: page === 0,
    last: start + size >= result.length,
  };
};

const buildMockStats = (resources: Resource[]): ResourceStats => {
  const total = resources.length;
  const active = resources.filter((r) => r.status === "ACTIVE").length;
  const outOfService = resources.filter(
    (r) => r.status === "OUT_OF_SERVICE",
  ).length;
  const underMaintenance = resources.filter(
    (r) => r.isUnderMaintenance,
  ).length;
  const bookable = resources.filter((r) => r.isBookable).length;

  const byType: Record<string, number> = {};
  const byBuilding: Record<string, number> = {};

  resources.forEach((r) => {
    byType[r.type] = (byType[r.type] || 0) + 1;
    byBuilding[r.building] = (byBuilding[r.building] || 0) + 1;
  });

  return {
    total,
    active,
    outOfService,
    underMaintenance,
    bookable,
    nonBookable: total - bookable,
    byType,
    byBuilding,
  };
};

const extractErrorMessage = async (response: Response): Promise<string> => {
  try {
    const body = await response.json();

    if (
      body.validationErrors &&
      typeof body.validationErrors === "object"
    ) {
      return Object.entries(body.validationErrors)
        .map(([field, message]) => `${field}: ${String(message)}`)
        .join(", ");
    }

    return body.message || `Request failed with status ${response.status}`;
  } catch {
    return `Request failed with status ${response.status}`;
  }
};

const requestJson = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const token = getStoredToken();
  const headers = new Headers(options?.headers);

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", token.startsWith("Bearer ") ? token : `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const message = await extractErrorMessage(response);
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
};

export const resourceService = {
  async getResources(
    filters?: ResourceFilters,
  ): Promise<PaginatedResponse<Resource>> {
    if (USE_MOCK_DATA) {
      await delay(200);
      return applyMockFilters(mockResources, filters);
    }

    const query = buildQueryString(filters);
    const pageData = await requestJson<PaginatedResponse<BackendResourcePayload>>(
      `${API_BASE_URL}${query}`,
    );

    return {
      ...pageData,
      content: pageData.content.map(normalizeResource),
    };
  },

  async getResourceById(id: number): Promise<Resource> {
    if (USE_MOCK_DATA) {
      await delay(150);
      const resource = mockResources.find((r) => r.id === id);

      if (!resource) {
        throw new Error("Resource not found");
      }

      return {
        ...resource,
        displayStatus: buildDisplayStatus(resource),
      };
    }

    const data = await requestJson<BackendResourcePayload>(
      `${API_BASE_URL}/${id}`,
    );

    return normalizeResource(data);
  },

  async createResource(request: ResourceRequest): Promise<Resource> {
    if (USE_MOCK_DATA) {
      await delay(200);

      const newResource: Resource = {
        id: Date.now(),
        ...request,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        displayStatus: buildDisplayStatus({
          id: 0,
          ...request,
          createdAt: "",
          updatedAt: "",
        }),
      };

      mockResources.push(newResource);
      return newResource;
    }

    const data = await requestJson<BackendResourcePayload>(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(toBackendRequest(request)),
    });

    return normalizeResource(data);
  },

  async updateResource(id: number, request: ResourceRequest): Promise<Resource> {
    if (USE_MOCK_DATA) {
      await delay(150);
      const index = mockResources.findIndex((r) => r.id === id);

      if (index === -1) {
        throw new Error("Resource not found");
      }

      const updated: Resource = {
        ...mockResources[index],
        ...request,
        updatedAt: new Date().toISOString(),
        displayStatus: buildDisplayStatus({
          ...mockResources[index],
          ...request,
        }),
      };

      mockResources[index] = updated;
      return updated;
    }

    const data = await requestJson<BackendResourcePayload>(
      `${API_BASE_URL}/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(toBackendRequest(request)),
      },
    );

    return normalizeResource(data);
  },

  async deleteResource(id: number): Promise<void> {
    if (USE_MOCK_DATA) {
      await delay(150);
      const index = mockResources.findIndex((r) => r.id === id);

      if (index === -1) {
        throw new Error("Resource not found");
      }

      mockResources.splice(index, 1);
      return;
    }

    await requestJson<void>(`${API_BASE_URL}/${id}`, {
      method: "DELETE",
    });
  },

  async getResourceStats(): Promise<ResourceStats> {
    if (USE_MOCK_DATA) {
      await delay(150);
      return buildMockStats(mockResources);
    }

    return requestJson<ResourceStats>(`${API_BASE_URL}/stats`);
  },
};

export default resourceService;
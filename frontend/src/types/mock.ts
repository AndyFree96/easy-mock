export type METHODS = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface MockApi {
  id: number;
  method: string;
  path: string;
  response: Record<string, unknown> | string;
  delay?: number;
  status?: number;
  headers?: Record<string, string>;
  enabled?: number;
  duration?: number;
  createdAt?: string;
}

export interface CreateMockDto {
  method: string;
  path: string;
  response: Record<string, unknown>;
  delay?: number;
  status?: number;
  headers?: Record<string, string>;
}

export interface UpdateMockDto extends CreateMockDto {
  enabled?: number;
}

export interface LogItem {
  id: number;
  path: string;
  method: string;
  status: number;
  time: number;
  ip: string;
  timestamp: string;
}

export interface LogResponse {
  data: LogItem[];
  total: number;
  page: number;
  limit: number;
}

export interface LogQuery {
  page?: number;
  limit?: number;
  method?: string;
}

export interface StatsResponse {
  totalRequests: number;
  avgResponseTime: number;
  requestsLastHour: number;
  methodDistribution: { method: string; count: number }[];
  topPaths: { path: string; method: string; count: number }[];
}

export interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
}

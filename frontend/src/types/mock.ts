export type METHODS = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface MockApi {
  id?: number;

  method: METHODS;

  response: Record<string, unknown>;

  path: string;

  createdAt?: string;

  duration?: number;
}

export interface CreateMockDto {
  method: METHODS;

  path: string;

  response: Record<string, unknown>;
}

export interface LogItem {
  id?: number;
  path: string;
  method: string;
  status: number;
  time: number;
  ip: string;
  timestamp: string;
}

export interface LogResponse {
  message: string;
  data: LogItem[];
}

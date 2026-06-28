export type METHODS = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface MockApi {
  id?: number;

  method: METHODS;

  response: Record<string, unknown>;

  path: string;

  createdAt?: string;
}

export interface CreateMockDto {
  method: METHODS;

  path: string;

  response: Record<string, unknown>;
}

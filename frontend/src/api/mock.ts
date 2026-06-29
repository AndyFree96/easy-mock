import axios from 'axios';
import type {
  MockApi,
  CreateMockDto,
  UpdateMockDto,
  LogResponse,
  LogQuery,
  StatsResponse,
  ImportResult,
} from '@/types/mock';

const http = axios.create({ baseURL: 'http://localhost:3000' });

export function getMocks(search?: string) {
  return http.get<MockApi[]>('/mock/list', { params: search ? { search } : {} });
}

export function createMock(data: CreateMockDto) {
  return http.post('/mock/create', data);
}

export function updateMock(id: number, data: UpdateMockDto) {
  return http.put(`/mock/${id}`, data);
}

export function toggleMock(id: number) {
  return http.put(`/mock/${id}/toggle`);
}

export function deleteMock(id: number) {
  return http.delete(`/mock/${id}`);
}

export function getMock(id: number) {
  return http.get<MockApi>(`/mock/${id}`);
}

export function testMock(path: string, method: string) {
  return http.get<MockApi>('/mock/test', { params: { path, method } });
}

export function getLogs(query?: LogQuery) {
  return http.get<LogResponse>('/mock/logs', { params: query });
}

export function getStats() {
  return http.get<StatsResponse>('/mock/stats');
}

export function exportMocks() {
  return http.get<MockApi[]>('/mock/export');
}

export function importMocks(mocks: MockApi[], overwrite = false) {
  return http.post<ImportResult>('/mock/import', { mocks, overwrite });
}

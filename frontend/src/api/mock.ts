import axios from 'axios';
import type { MockApi, CreateMockDto } from '@/types/mock';

const http = axios.create({
  baseURL: 'http://localhost:3000',
});

export function getMocks() {
  return http.get<MockApi[]>('/mock/list');
}

export function createMock(data: CreateMockDto) {
  return http.post('/mock/create', data);
}

export function deleteMock(id: number) {
  return http.delete(`/mock/${id}`);
}

export function getMock(id: number) {
  return http.get<MockApi>(`/mock/${id}`);
}

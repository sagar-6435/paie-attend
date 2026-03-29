import { API_BASE_URL } from './api-config';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

const getToken = () => localStorage.getItem('token');

const apiCall = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const headers: any = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'An error occurred' };
    }

    return { data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Network error' };
  }
};

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string, role: string, rollNumber?: string) =>
    apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role, rollNumber }),
    }),

  getMe: () => apiCall('/auth/me'),
};

// Users API
export const usersApi = {
  getAll: () => apiCall('/users'),
  getStudents: () => apiCall('/users/students'),
  getById: (id: string) => apiCall(`/users/${id}`),
  create: (data: any) =>
    apiCall('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiCall(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

// QR Sessions API
export const qrSessionApi = {
  create: (location: any, expiresIn?: number) =>
    apiCall('/qr-sessions', {
      method: 'POST',
      body: JSON.stringify({ location, expiresIn }),
    }),

  getAll: () => apiCall('/qr-sessions'),
  getById: (id: string) => apiCall(`/qr-sessions/${id}`),
  markUsed: (id: string) =>
    apiCall(`/qr-sessions/${id}/use`, {
      method: 'PATCH',
    }),
};

// Attendance API
export const attendanceApi = {
  record: (sessionId: string, workDone: string, location: any) =>
    apiCall('/attendance', {
      method: 'POST',
      body: JSON.stringify({ sessionId, workDone, location }),
    }),

  getAll: (studentId?: string, date?: string) => {
    const params = new URLSearchParams();
    if (studentId) params.append('studentId', studentId);
    if (date) params.append('date', date);
    return apiCall(`/attendance?${params.toString()}`);
  },

  getStudentRecords: (studentId: string) =>
    apiCall(`/attendance/student/${studentId}`),

  getStats: () => apiCall('/attendance/stats/all'),
};

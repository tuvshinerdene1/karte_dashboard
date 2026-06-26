import { readStoredSession } from './auth';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

// Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  token?: string;
}

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'hospital_director' | 'doctor' | 'staff' | 'nurse';
  hospitalId?: string;
  staffId?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// API Client Class
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = BACKEND_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Generic fetch method with auth headers
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const session = readStoredSession();
    const headers = new Headers(options.headers || {});

    // Add auth token if available
    if (session?.token) {
      headers.set('Authorization', `Bearer ${session.token}`);
    }

    headers.set('Content-Type', 'application/json');

    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      const data = contentType?.includes('application/json')
        ? await response.json()
        : { message: 'Non-JSON response' };

      if (!response.ok) {
        throw new Error(data.message || data.error || `HTTP ${response.status}`);
      }

      return data as T;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body?: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, body?: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // ============================================
  // AUTH ENDPOINTS
  // ============================================

  async register(username: string, password: string, role: string) {
    return this.post<AuthResponse>('/api/auth/register', {
      username,
      password,
      role,
    });
  }

  async login(username: string, password: string) {
    return this.post<AuthResponse>('/api/auth/login', {
      username,
      password,
    });
  }

  // ============================================
  // HOSPITAL ENDPOINTS
  // ============================================

  /**
   * Get all hospitals
   */
  async getHospitals() {
    return this.get<any>('/api/hospital');
  }

  /**
   * Get hospital by ID
   */
  async getHospital(hospitalId: string) {
    return this.get<any>(`/api/hospital/${hospitalId}`);
  }

  /**
   * Create new hospital
   */
  async createHospital(data: Record<string, any>) {
    return this.post<any>('/api/hospital', data);
  }

  /**
   * Update hospital
   */
  async updateHospital(hospitalId: string, data: Record<string, any>) {
    return this.put<any>(`/api/hospital/${hospitalId}`, data);
  }

  /**
   * Delete hospital
   */
  async deleteHospital(hospitalId: string) {
    return this.delete<any>(`/api/hospital/${hospitalId}`);
  }

  /**
   * Get hospital dashboard data
   */
  async getHospitalDashboard(hospitalId: string) {
    return this.get<any>(`/api/hospital/${hospitalId}/dashboard`);
  }

  /**
   * Get hospital patients
   */
  async getHospitalPatients(hospitalId: string) {
    return this.get<any>(`/api/hospital/${hospitalId}/patients`);
  }

  /**
   * Get hospital staff
   */
  async getHospitalStaff(hospitalId: string) {
    return this.get<any>(`/api/hospital/${hospitalId}/staff`);
  }

  /**
   * Add staff to hospital
   */
  async addStaffToHospital(hospitalId: string, staffData: Record<string, any>) {
    return this.post<any>(`/api/hospital/${hospitalId}/staff`, staffData);
  }

  // ============================================
  // MONITORING ENDPOINTS
  // ============================================

  /**
   * Get monitoring data
   */
  async getMonitoringData() {
    return this.get<any>('/api/monitoring');
  }

  /**
   * Get hospital monitoring data
   */
  async getHospitalMonitoring(hospitalId: string) {
    return this.get<any>(`/api/monitoring/${hospitalId}`);
  }

  /**
   * Update monitoring event
   */
  async updateMonitoringEvent(hospitalId: string, eventData: Record<string, any>) {
    return this.post<any>(`/api/monitoring/${hospitalId}/event`, eventData);
  }

  /**
   * Get metrics
   */
  async getMetrics(hospitalId: string) {
    return this.get<any>(`/api/monitoring/${hospitalId}/metrics`);
  }

  // ============================================
  // SUPPORT ENDPOINTS
  // ============================================

  /**
   * Get support tickets
   */
  async getSupportTickets() {
    return this.get<any>('/api/support');
  }

  /**
   * Get support ticket by ID
   */
  async getSupportTicket(ticketId: string) {
    return this.get<any>(`/api/support/${ticketId}`);
  }

  /**
   * Create support ticket
   */
  async createSupportTicket(data: Record<string, any>) {
    return this.post<any>('/api/support', data);
  }

  /**
   * Update support ticket
   */
  async updateSupportTicket(ticketId: string, data: Record<string, any>) {
    return this.put<any>(`/api/support/${ticketId}`, data);
  }

  /**
   * Close support ticket
   */
  async closeSupportTicket(ticketId: string) {
    return this.patch<any>(`/api/support/${ticketId}`, { status: 'closed' });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Also export the class for advanced usage
export default ApiClient;

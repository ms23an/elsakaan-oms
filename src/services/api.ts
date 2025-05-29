
const API_BASE_URL = 'http://localhost:5000/api';

// API utility functions
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('authToken');
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }
  
  return response.json();
};

// Auth API
export const authAPI = {
  login: async (credentials: { username: string; password: string }) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
  
  verify: async () => {
    return apiRequest('/auth/verify');
  },
};

// Customers API
export const customersAPI = {
  getAll: async (params?: { search?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    return apiRequest(`/customers?${searchParams.toString()}`);
  },
  
  getById: async (id: string) => {
    return apiRequest(`/customers/${id}`);
  },
  
  create: async (customer: any) => {
    return apiRequest('/customers', {
      method: 'POST',
      body: JSON.stringify(customer),
    });
  },
  
  update: async (id: string, customer: any) => {
    return apiRequest(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customer),
    });
  },
  
  delete: async (id: string) => {
    return apiRequest(`/customers/${id}`, {
      method: 'DELETE',
    });
  },
};

// Orders API
export const ordersAPI = {
  getAll: async (params?: { search?: string; status?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    return apiRequest(`/orders?${searchParams.toString()}`);
  },
  
  getById: async (id: string) => {
    return apiRequest(`/orders/${id}`);
  },
  
  create: async (order: any) => {
    return apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  },
  
  update: async (id: string, order: any) => {
    return apiRequest(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(order),
    });
  },
  
  delete: async (id: string) => {
    return apiRequest(`/orders/${id}`, {
      method: 'DELETE',
    });
  },
};

// Shipments API
export const shipmentsAPI = {
  getAll: async (params?: { search?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    return apiRequest(`/shipments?${searchParams.toString()}`);
  },
  
  getById: async (id: string) => {
    return apiRequest(`/shipments/${id}`);
  },
  
  updateStatus: async (id: string, status: string) => {
    return apiRequest(`/shipments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
};

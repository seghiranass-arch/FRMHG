// API configuration
const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.startsWith('/')
    ? process.env.NEXT_PUBLIC_API_URL
    : '/api';

// Common fetch options
const defaultOptions: RequestInit = {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
};

// API response type
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status: number;
}

function extractErrorMessage(data: unknown): string | null {
  if (!data) return null;
  if (typeof data === "string") return data;
  if (typeof data === "object") {
    const message = (data as any).message;
    if (typeof message === "string") return message;
  }
  return null;
}

// Generic fetch wrapper with error handling
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    });

    // Handle 401 unauthorized
    if (response.status === 401) {
      // Redirect to login if on client side
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
      return { status: 401, error: 'Unauthorized' };
    }

    // Handle no content
    if (response.status === 204) {
      return { status: 204 };
    }

    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const raw = await response.text();
    let data: unknown = raw;
    if (isJson && raw) {
      try {
        data = JSON.parse(raw);
      } catch {
        data = raw;
      }
    }

    if (!response.ok) {
      return {
        status: response.status,
        error: extractErrorMessage(data) || "An error occurred",
      };
    }

    return { status: response.status, data: data as T };
  } catch (error) {
    console.error('API Error:', error);
    return {
      status: 500,
      error: error instanceof Error ? error.message : 'API indisponible',
    };
  }
}

// HTTP method helpers
export const api = {
  get: <T>(endpoint: string) => fetchApi<T>(endpoint, { method: 'GET' }),
  
  post: <T>(endpoint: string, body?: unknown) =>
    fetchApi<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
  
  put: <T>(endpoint: string, body?: unknown) =>
    fetchApi<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),
  
  patch: <T>(endpoint: string, body?: unknown) =>
    fetchApi<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),
  
  delete: <T>(endpoint: string) => fetchApi<T>(endpoint, { method: 'DELETE' }),
};

export default api;

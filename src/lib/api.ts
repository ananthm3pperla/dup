
import { logger } from './logger';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Centralized API service with comprehensive error handling and logging
 */
class ApiService {
  private static instance: ApiService;
  private baseURL = '/api';

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    let data: any;
    try {
      data = isJson ? await response.json() : await response.text();
    } catch (error) {
      logger.error('Failed to parse response', error as Error, {
        status: response.status,
        url: response.url,
      });
      throw new ApiError('Invalid response format', response.status);
    }

    if (!response.ok) {
      const errorMessage = data?.error || data?.message || `HTTP ${response.status}`;
      logger.error('API request failed', undefined, {
        status: response.status,
        url: response.url,
        error: errorMessage,
      });
      throw new ApiError(errorMessage, response.status, data?.code);
    }

    return data;
  }

  async get<T>(endpoint: string): Promise<T> {
    logger.debug('API GET request', { endpoint });
    
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      
      logger.error('Network error during GET request', error as Error, { endpoint });
      throw new ApiError('Network error', 0);
    }
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    logger.debug('API POST request', { endpoint, hasData: !!data });
    
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      
      logger.error('Network error during POST request', error as Error, { endpoint });
      throw new ApiError('Network error', 0);
    }
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    logger.debug('API PUT request', { endpoint, hasData: !!data });
    
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      
      logger.error('Network error during PUT request', error as Error, { endpoint });
      throw new ApiError('Network error', 0);
    }
  }

  async delete<T>(endpoint: string): Promise<T> {
    logger.debug('API DELETE request', { endpoint });
    
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      
      logger.error('Network error during DELETE request', error as Error, { endpoint });
      throw new ApiError('Network error', 0);
    }
  }

  async uploadFile<T>(endpoint: string, file: File, additionalData?: Record<string, string>): Promise<T> {
    logger.debug('API file upload', { endpoint, fileName: file.name, fileSize: file.size });
    
    try {
      const formData = new FormData();
      formData.append('photo', file);
      
      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      
      logger.error('Network error during file upload', error as Error, { endpoint });
      throw new ApiError('Network error', 0);
    }
  }
}

export const apiService = ApiService.getInstance();


/**
 * API Client interface for live data integration
 * This will be implemented when connecting to a real API
 */
export interface ApiClient {
  get<T>(endpoint: string): Promise<T>;
  post<T, R>(endpoint: string, data: T): Promise<R>;
  put<T, R>(endpoint: string, data: T): Promise<R>;
  delete<T>(endpoint: string): Promise<T>;
}

/**
 * Placeholder for future API client implementation
 * This will be replaced with actual API client when ready for production
 */
export class LiveApiClient implements ApiClient {
  private baseUrl: string;
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }
  
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`);
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return await response.json();
  }
  
  async post<T, R>(endpoint: string, data: T): Promise<R> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return await response.json();
  }
  
  async put<T, R>(endpoint: string, data: T): Promise<R> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return await response.json();
  }
  
  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return await response.json();
  }
}

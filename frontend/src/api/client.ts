export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`GET ${path} failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export const apiClient = { get };

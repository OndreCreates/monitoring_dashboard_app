export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

/** Backend's GlobalExceptionHandler always returns { timestamp, status, message } on errors —
 * surface that message (e.g. a validation error) instead of a generic status-code string. */
async function extractErrorMessage(response: Response, method: string, path: string): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body?.message === "string") return body.message;
  } catch {
    // No JSON body (or not the expected shape) — fall back to the generic message below.
  }
  return `${method} ${path} failed with status ${response.status}`;
}

async function requestJson<T>(method: string, path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    throw new Error(await extractErrorMessage(response, method, path));
  }
  return response.json() as Promise<T>;
}

function get<T>(path: string) {
  return requestJson<T>("GET", path);
}

function post<T>(path: string, body: unknown) {
  return requestJson<T>("POST", path, body);
}

function put<T>(path: string, body: unknown) {
  return requestJson<T>("PUT", path, body);
}

async function del(path: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}${path}`, { method: "DELETE" });
  if (!response.ok) {
    throw new Error(await extractErrorMessage(response, "DELETE", path));
  }
}

export const apiClient = { get, post, put, del };

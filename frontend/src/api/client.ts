export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

// Optional — mirrors the backend's ApiKeyFilter. Unset by default (open API for
// local/demo use); only needed if the backend was started with API_KEY set.
const API_KEY: string | undefined = import.meta.env.VITE_API_KEY || undefined;
const MUTATING_METHODS = new Set(["POST", "PUT", "DELETE"]);

function buildHeaders(method: string, hasBody: boolean): HeadersInit | undefined {
  const headers: Record<string, string> = {};
  if (hasBody) headers["Content-Type"] = "application/json";
  if (API_KEY && MUTATING_METHODS.has(method)) headers["X-API-Key"] = API_KEY;
  return Object.keys(headers).length > 0 ? headers : undefined;
}

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
    headers: buildHeaders(method, body !== undefined),
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
  const response = await fetch(`${API_BASE_URL}${path}`, { method: "DELETE", headers: buildHeaders("DELETE", false) });
  if (!response.ok) {
    throw new Error(await extractErrorMessage(response, "DELETE", path));
  }
}

export const apiClient = { get, post, put, del };

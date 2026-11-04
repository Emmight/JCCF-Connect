
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

type ApiOptions = RequestInit & {
  token?: string | null;
};

export async function apiRequest<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { token, headers, ...requestOptions } = options;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...requestOptions,
    headers: {
      ...(requestOptions.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message || data?.error || `Request failed (${response.status})`
    );
  }

  return data as T;
}

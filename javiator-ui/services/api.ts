const DEFAULT_API_BASE = "http://127.0.0.1:8000";

function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

function deriveWsBase(apiBase: string): string {
  if (apiBase.startsWith("https://")) {
    return `wss://${apiBase.slice("https://".length)}`;
  }
  if (apiBase.startsWith("http://")) {
    return `ws://${apiBase.slice("http://".length)}`;
  }
  return apiBase;
}

// Static NEXT_PUBLIC_* references so Next.js inlines them at build time.
export const API_BASE = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_BASE
);

export const WS_BASE = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_WS_URL || deriveWsBase(API_BASE)
);

let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = (async () => {
    const refresh = localStorage.getItem("refresh");
    if (!refresh) {
      return null;
    }

    try {
      const response = await fetch(`${API_BASE}/api/token/refresh/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh }),
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      if (!data?.access) {
        return null;
      }

      localStorage.setItem("access", data.access);
      if (data.refresh) {
        localStorage.setItem("refresh", data.refresh);
      }
      return data.access as string;
    } catch {
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

function clearSessionAndRedirect(): void {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("username");
  window.location.href = "/login";
}

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {},
  allowRetry = true
) {
  const token = localStorage.getItem("access");

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    if (allowRetry) {
      const nextToken = await refreshAccessToken();
      if (nextToken) {
        return apiFetch(endpoint, options, false);
      }
    }

    clearSessionAndRedirect();
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    let errorMessage = `API Error ${response.status}`;

    try {
      const errorData = await response.json();

      if (typeof errorData?.detail === "string") {
        errorMessage = errorData.detail;
      } else if (typeof errorData?.error === "string") {
        errorMessage = errorData.error;
      } else if (errorData && typeof errorData === "object") {
        errorMessage = JSON.stringify(errorData);
      }
    } catch {
      // Fall back to HTTP status error message when response is non-JSON.
    }

    throw new Error(errorMessage);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : {};
}

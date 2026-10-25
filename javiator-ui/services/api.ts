const API_BASE = "http://127.0.0.1:8000";

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = localStorage.getItem("access");

  const response = await fetch(
    `${API_BASE}${endpoint}`,
    {
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
    }
  );

  // ============================================
  // 🔒 HANDLE UNAUTHORIZED
  // ============================================

  if (response.status === 401) {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

    window.location.href = "/login";

    throw new Error("Unauthorized");
  }

  // ============================================
  // ❌ HANDLE API ERRORS
  // ============================================

  if (!response.ok) {
    let errorMessage = `API Error ${response.status}`;

    try {
      const errorData = await response.json();

      if (errorData.detail) {
        errorMessage = errorData.detail;
      }
    } catch {}

    throw new Error(errorMessage);
  }

  // ============================================
  // ✅ HANDLE EMPTY RESPONSES
  // ============================================

  const text = await response.text();

  return text ? JSON.parse(text) : {};
}
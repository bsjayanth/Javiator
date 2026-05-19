const API_BASE =
  "http://127.0.0.1:8000";

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {

  const token =
    localStorage.getItem("access");

  const response = await fetch(
    `${API_BASE}${endpoint}`,
    {
      ...options,

      headers: {

        "Content-Type":
          "application/json",

        Authorization:
          `Bearer ${token}`,

        ...options.headers,
      },
    }
  );

  if (response.status === 401) {

    localStorage.removeItem(
      "access"
    );

    localStorage.removeItem(
      "refresh"
    );

    window.location.href =
      "/login";

    throw new Error(
      "Unauthorized"
    );
  }

  if (!response.ok) {

    throw new Error(
      `API Error ${response.status}`
    );
  }

  return response.json();
}
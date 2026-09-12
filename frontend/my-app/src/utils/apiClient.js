const REFRESH_URL = "http://localhost:5000/api/auth/refresh";

export async function apiFetch(url, options = {}) {
  const config = {
    ...options,
    credentials: "include",
    headers: {
      ...(options.headers || {}),
    },
  };

  let res = await fetch(url, config);

  // If unauthorized (401) and not already trying to refresh/login/signup, attempt refresh
  if (
    res.status === 401 &&
    !url.includes("/api/auth/refresh") &&
    !url.includes("/api/auth/login") &&
    !url.includes("/api/auth/signup")
  ) {
    try {
      const refreshRes = await fetch(REFRESH_URL, {
        method: "POST",
        credentials: "include",
      });

      if (refreshRes.ok) {
        // Retry the original request
        res = await fetch(url, config);
      }
    } catch (err) {
      console.error("Token refresh failed:", err);
    }
  }

  return res;
}

let token = null;

export function setAuthToken(newToken) {
  token = newToken;
}

async function fetchData(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}/${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
      ...options,
    });
    if (!res.ok) throw new Error(`Failed request: ${endpoint}`);
    return await res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function registerUser(userData) {
  return fetchData("register", { method: "POST", body: JSON.stringify(userData) });
}

export async function loginUser(credentials) {
  const data = await fetchData("login", { method: "POST", body: JSON.stringify(credentials) });
  if (data?.token) setAuthToken(data.token);
  return data;
}

export async function getCurrentUser() {
  return fetchData("me");
}

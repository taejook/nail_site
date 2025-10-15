const API_BASE = "http://localhost:3001/api"; 
// =====================
// Token management
// =====================

let token = null;

export function setToken(newToken) {
  token = newToken;
  if (newToken) localStorage.setItem("token", newToken);
  else localStorage.removeItem("token");
}

function getToken() {
  if (!token) token = localStorage.getItem("token");
  return token;
}

async function fetchData(endpoint, options = {}) {
  try {
    const headers = {
      "Content-Type": "application/json",
      ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
      ...(options.headers || {}),
    };

    const res = await fetch(`${API_BASE}/${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`${res.status} ${res.statusText}: ${errText}`);
    }

    return await res.json();
  } catch (err) {
    console.error("API Error:", err);
    return null;
  }
}

export async function registerUser({ fullName, email, password }) {
  return fetchData("auth/register", {
    method: "POST",
    body: JSON.stringify({ fullName, email, password }),
  });
}

export async function loginUser({ email, password }) {
  const data = await fetchData("auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (data?.token) setToken(data.token);
  return data;
}

export function logoutUser() {
  setToken(null);
}


export async function getMe() {
  return fetchData("auth/me", { method: "GET" });
}

// =====================
// Locations / Team / Services
// =====================
export async function getLocations() {
  const data = await fetchData("locations");
  return Array.isArray(data) ? data : [];
}

export async function getTeamMembers() {
  const data = await fetchData("team-members");
  return data?.team_members || [];
}

export async function getServices() {
  const data = await fetchData("services");
  return Array.isArray(data) ? data : [];
}

// =====================
// Bookings
// =====================
export async function getBookings() {
  const data = await fetchData("bookings");
  return Array.isArray(data) ? data : [];
}

export async function createBooking(payload) {
  return fetchData("bookings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function cancelBooking(bookingId) {
  return fetchData(`bookings/${bookingId}`, { method: "DELETE" });
}

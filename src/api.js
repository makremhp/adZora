// The browser talks only to the AdZora API. Keep DATABASE_URL server-side; it
// must never be exposed through a Vite variable or bundled into this file.
const API_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

const TOKEN_KEY = "adzora_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = body instanceof FormData ? {} : { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || "Something went wrong. Please try again.");
    error.status = response.status;
    throw error;
  }
  return data;
}

export const api = {
  signup: (email, password, role) => request("/auth/signup", { method: "POST", body: { email, password, role }, auth: false }),
  login: (email, password) => request("/auth/login", { method: "POST", body: { email, password }, auth: false }),
  logout: () => request("/auth/logout", { method: "POST" }),
  me: () => request("/auth/me"),
  updateProfile: (displayName) => request("/auth/me", { method: "PATCH", body: { displayName } }),
  changePassword: (currentPassword, newPassword) => request("/auth/change-password", { method: "POST", body: { currentPassword, newPassword } }),

  listWebsites: () => request("/websites"),
  createWebsite: (name, url) => request("/websites", { method: "POST", body: { name, url } }),
  deleteWebsite: (id) => request(`/websites/${id}`, { method: "DELETE" }),
  getWebsiteCode: (id) => request(`/websites/${id}/code`),
  getWebsiteAnalytics: (id) => request(`/websites/${id}/analytics`),

  listCampaigns: () => request("/campaigns"),
  createCampaign: (payload) => request("/campaigns", { method: "POST", body: payload }),
  updateCampaignStatus: (id, status) => request(`/campaigns/${id}`, { method: "PATCH", body: { status } }),

  walletSummary: () => request("/wallet/summary"),
  listTransactions: () => request("/wallet/transactions"),
  listWithdrawals: () => request("/wallet/withdrawals"),
  listDeposits: () => request("/wallet/deposits"),
  createWithdrawal: (payload) => request("/wallet/withdrawals", { method: "POST", body: payload }),
  createDeposit: (payload) => request("/wallet/deposits", { method: "POST", body: payload }),

  paymentDestinations: () => request("/config/payment-destinations"),
  uploadCreative: (formData) => request("/creatives", { method: "POST", body: formData }),
};

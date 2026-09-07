import apiClient from "./client";

export async function registerAccount(payload) {
  const { data } = await apiClient.post("/auth/register", payload);
  return data;
}

export async function loginAccount(payload) {
  const { data } = await apiClient.post("/auth/login", payload);
  return data;
}

export async function logoutAccount() {
  const { data } = await apiClient.post("/auth/logout");
  return data;
}

export async function forgotPassword(payload) {
  const { data } = await apiClient.post("/auth/forgot-password", payload);
  return data;
}

export async function resetPassword(payload) {
  const { data } = await apiClient.post("/auth/reset-password", payload);
  return data;
}

export async function getCurrentUser() {
  const { data } = await apiClient.get("/auth/me");
  return data;
}

export async function updateProfile(payload) {
  const { data } = await apiClient.put("/auth/profile", payload);
  return data;
}

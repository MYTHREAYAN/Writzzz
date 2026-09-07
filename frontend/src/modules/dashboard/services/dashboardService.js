import apiClient from "../../../api/client";

/**
 * Fetch authenticated user's dashboard overview data.
 */
export async function getDashboard() {
  const response = await apiClient.get("/dashboard");
  return response.data;
}

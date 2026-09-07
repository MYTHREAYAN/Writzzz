import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.code === "ECONNABORTED"
        ? "The server took too long to respond. Confirm MongoDB and the API are running."
        : error.response?.data?.message ||
          error.response?.data?.errors?.[0] ||
          (error.request && !error.response
            ? "Cannot reach the API. Start the backend on port 5000."
            : error.message) ||
          "Something went wrong";

    const wrapped = new Error(message);
    wrapped.status = error.response?.status;
    wrapped.payload = error.response?.data;
    throw wrapped;
  }
);

export default apiClient;

import apiClient from "../../../api/client";

/**
 * Fetch authenticated user's handwriting profile.
 */
export async function getHandwritingProfile() {
  const response = await apiClient.get("/handwriting");
  return response.data;
}

/**
 * Save/update handwriting profile style selection and settings.
 */
export async function saveHandwritingProfile(payload) {
  const response = await apiClient.put("/handwriting", payload);
  return response.data;
}

/**
 * Upload a handwriting sample file.
 */
export async function uploadHandwritingSample(file) {
  const formData = new FormData();
  formData.append("sample", file);

  const response = await apiClient.post("/handwriting/samples", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

/**
 * Replace an existing handwriting sample file.
 */
export async function replaceHandwritingSample(sampleId, file) {
  const formData = new FormData();
  formData.append("sample", file);

  const response = await apiClient.put(`/handwriting/samples/${sampleId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

/**
 * Delete a handwriting sample.
 */
export async function deleteHandwritingSample(sampleId) {
  const response = await apiClient.delete(`/handwriting/samples/${sampleId}`);
  return response.data;
}

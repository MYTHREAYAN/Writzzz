import { Assignment, AuthResponse, Feedback, GeminiAnalysisResult, HandwritingStyle, User } from '../types';

const API_BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('writzz_token');
}

export function setToken(token: string) {
  localStorage.setItem('writzz_token', token);
}

export function removeToken() {
  localStorage.removeItem('writzz_token');
}

async function fetchWithAuth<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      // Remove stale token if unauthorized
      removeToken();
    }
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetchWithAuth<AuthResponse>(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(res.token);
    return res;
  },

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const res = await fetchWithAuth<AuthResponse>(`${API_BASE}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    setToken(res.token);
    return res;
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string; resetToken?: string; resetUrl?: string }> {
    return fetchWithAuth(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return fetchWithAuth(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  },

  async getMe(): Promise<{ user: User }> {
    return fetchWithAuth<{ user: User }>(`${API_BASE}/auth/me`);
  },

  logout() {
    removeToken();
  },

  // Handwriting Profiles
  async getHandwritingProfiles(): Promise<{ profiles: HandwritingStyle[] }> {
    return fetchWithAuth<{ profiles: HandwritingStyle[] }>(`${API_BASE}/handwriting`);
  },

  async saveHandwritingProfile(profile: Partial<HandwritingStyle>): Promise<{ profile: HandwritingStyle }> {
    return fetchWithAuth<{ profile: HandwritingStyle }>(`${API_BASE}/handwriting`, {
      method: 'POST',
      body: JSON.stringify(profile),
    });
  },

  async analyzeHandwriting(imageBase64: string, mimeType?: string): Promise<{ success: boolean; analysis: GeminiAnalysisResult }> {
    return fetchWithAuth<{ success: boolean; analysis: GeminiAnalysisResult }>(`${API_BASE}/handwriting/analyze`, {
      method: 'POST',
      body: JSON.stringify({ imageBase64, mimeType }),
    });
  },

  // Assignments
  async getAssignments(): Promise<{ assignments: Assignment[] }> {
    return fetchWithAuth<{ assignments: Assignment[] }>(`${API_BASE}/assignments`);
  },

  async getAssignment(id: string): Promise<{ assignment: Assignment }> {
    return fetchWithAuth<{ assignment: Assignment }>(`${API_BASE}/assignments/${id}`);
  },

  async createAssignment(data: Partial<Assignment>): Promise<{ assignment: Assignment }> {
    return fetchWithAuth<{ assignment: Assignment }>(`${API_BASE}/assignments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateAssignment(id: string, data: Partial<Assignment>): Promise<{ assignment: Assignment }> {
    return fetchWithAuth<{ assignment: Assignment }>(`${API_BASE}/assignments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteAssignment(id: string): Promise<{ success: boolean }> {
    return fetchWithAuth<{ success: boolean }>(`${API_BASE}/assignments/${id}`, {
      method: 'DELETE',
    });
  },

  // AI Assistant
  async processQuestions(
    text?: string,
    imageBase64?: string,
    mimeType?: string,
    subject?: string
  ): Promise<{
    title: string;
    subject: string;
    estimatedPages?: number;
    questions: Array<{ questionNumber: string | number; questionText: string; marks?: number; requiredPages?: number }>;
  }> {
    return fetchWithAuth(`${API_BASE}/ai/process-questions`, {
      method: 'POST',
      body: JSON.stringify({ text, imageBase64, mimeType, subject }),
    });
  },

  async generateAnswers(
    questions: any[],
    subject?: string,
    academicLevel?: string,
    style?: any,
    headerSettings?: any
  ): Promise<{ answers: any[] }> {
    return fetchWithAuth(`${API_BASE}/ai/generate-answers`, {
      method: 'POST',
      body: JSON.stringify({ questions, subject, academicLevel, style, headerSettings }),
    });
  },

  // Feedback
  async submitFeedback(rating: number, comment?: string): Promise<{ success: boolean; feedback: Feedback }> {
    return fetchWithAuth<{ success: boolean; feedback: Feedback }>(`${API_BASE}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    });
  },

  async getFeedbacks(): Promise<{ feedbacks: Feedback[] }> {
    return fetchWithAuth<{ feedbacks: Feedback[] }>(`${API_BASE}/feedback`);
  },
};

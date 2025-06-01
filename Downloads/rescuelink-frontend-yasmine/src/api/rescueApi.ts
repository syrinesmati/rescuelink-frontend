import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// Existing APIs
export const fetchEmergencyReports = async () => {
  const response = await axios.get(`${API_BASE_URL}/emergency-report`);
  return response.data;
};

export const submitEmergencyReport = async (reportData: {
  description: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  urgencyLevel: number;
  citizenId: number;
}) => {
  const response = await axios.post(
    `${API_BASE_URL}/emergency-report`,
    reportData
  );
  return response.data;
};

export const fetchMissions = async () => {
  const response = await axios.get(`${API_BASE_URL}/mission`);
  return response.data;
};

// Auth APIs

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  cin: string;
  firstName: string;
  lastName: string;
  role: string; // restrict to known roles
}


export interface LoginPayload {
  email: string;
  password: string;
}

export const registerUser = async (data: RegisterPayload) => {
  const response = await axios.post(`${API_BASE_URL}/auth/register`, data);
  return response.data;
};

export const loginUser = async (data: LoginPayload) => {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, data);
  // Save token in localStorage
  if (response.data?.accessToken) {
    localStorage.setItem("accessToken", response.data.accessToken);
    localStorage.setItem("refreshToken", response.data.refreshToken);

  }
  return response.data;
};

export const logoutUser = async () => {
  // Call backend logout if needed
  const response = await axios.post(`${API_BASE_URL}/auth/logout`);
  // Clear token from localStorage
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");

  return response.data;
};

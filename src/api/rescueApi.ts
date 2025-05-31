import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

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

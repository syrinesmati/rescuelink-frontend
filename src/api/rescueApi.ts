import axios from "axios";
import { ApolloClient, InMemoryCache, gql, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { Mission, MissionMessage } from "@/types/mission";
import { User } from "@/pages/Responder";


const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";






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
  console.log(data);
  const response = await axios.post(`${API_BASE_URL}/user`, data, {
    withCredentials: true, 
});
  return response.data;
};

export const loginUser = async (data: LoginPayload) => {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, data, {
    withCredentials: true, 
});
  // Save token in localStorage
  if (response.data?.accessToken) {
    localStorage.setItem("accessToken", response.data.accessToken);
    localStorage.setItem("refreshToken", response.data.refreshToken);

  }
  return response.data;
};

export const logoutUser = async () => {
  // Call backend logout if needed
  const response = await axios.post(`${API_BASE_URL}/auth/logout`, {
    withCredentials: true, 
});
  // Clear token from localStorage
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");

  return response.data;
};





// Emergency Reports (Citizen)
export const fetchEmergencyReports = async () => {
  const response = await axios.get(`${API_BASE_URL}/emergency-report`, {
    withCredentials: true, 
  });
  console.log(response.data);
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
    reportData, {
    withCredentials: true, 
    }
  );
  return response.data;
};

// Emergency Operations API
export const updateEmergencyStatus = async (emergencyId: number, status: string) => {
  const response = await axios.patch(`${API_BASE_URL}/emergency/${emergencyId}/status`, { status }, {
   withCredentials: true, 
  });
  return response.data;
};

export const updateEmergencyUrgency = async (emergencyId: number, urgency: string) => {
  const response = await axios.patch(`${API_BASE_URL}/emergency/${emergencyId}/urgency`, { urgency }, {
   withCredentials: true, 
  });
  return response.data;
};


export const sendEmergencyMessage = async (emergencyId: number, message: string) => {
  const response = await axios.post(`${API_BASE_URL}/emergency/${emergencyId}/message`, { message }, {
   withCredentials: true, 
  });
  return response.data;
};






export const createNewMission = async (data: {
  incidentId: number;
  responderIds?: number[];
}, coordinatorId: number) => {
  const response = await axios.post(`${API_BASE_URL}/mission`, { ...data, coordinatorId }, {
   withCredentials: true, 
  });
  return response.data;
};

export const fetchMissions = async () => {
  const response = await axios.get(`${API_BASE_URL}/mission`, {
   withCredentials: true, 
  });
  console.log(response.data);
  return response.data;
};

export const updateMissionStatus = async (missionId: number, status: string) => {
  const response = await axios.patch(`${API_BASE_URL}/mission/${missionId}/status`, { status }, {
   withCredentials: true, 
  });
  return response.data;
};


export const getMissionDetails = async (missionId: number) => {
  const response = await axios.get(`${API_BASE_URL}/mission/${missionId}`, {
   withCredentials: true, 
  });
  return response.data;
};

export const fetchMissionMessages = async (missionId: number): Promise<MissionMessage[]> => {
  const response = await axios.get(`${API_BASE_URL}/mission/${missionId}/messages`, {
   withCredentials: true, 
  });
  return response.data;
};






// Responders API
export const fetchResponders = async (): Promise<User[]> => {
  const response = await axios.get(`${API_BASE_URL}/user`, {
   withCredentials: true, 
  });
  console.log(response.data);
  return response.data;
};


export const assignResponderToEmergency = async (emergencyId: number, responderIds: number[]) => {
  const response = await axios.post(`${API_BASE_URL}/emergency/${emergencyId}/assign`, { responderIds }, {
   withCredentials: true, 
  });
  return response.data;
};




export const fetchResponderMissions = async (): Promise<Mission[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/missions/assigned`, {
   withCredentials: true, 
  });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch missions:', error);
    throw error;
  }
};






// Add this function to fix the error
export const sendMissionMessage = async (missionId: number, content: string): Promise<MissionMessage> => {
  const response = await axios.post(`${API_BASE_URL}/mission/${missionId}/messages`, { content }, {
   withCredentials: true, 
  });
  return response.data;
};








// GraphQL Configuration
const httpLink = createHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL || "http://localhost:3000/graphql",
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return { headers: { ...headers, authorization: token ? `Bearer ${token}` : '' } };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});



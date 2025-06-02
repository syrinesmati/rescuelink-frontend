import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, MessageCircle, Check, ArrowRight, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchResponderMissions, updateMissionStatus, sendMissionMessage ,fetchMissions} from "@/api/rescueApi";
import { useNavigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import {
  EmergencyStatus,
  MissionStatus,
  ResponderRoleEnum,
  ResponderStatusEnum,
  UserRoleEnum
}from "@/enums/types"
import { from } from "@apollo/client";



export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  profilePicture?: string;
  cin: string;
  role: UserRoleEnum;
  responderRole: ResponderRoleEnum;
  ResponderStatus: ResponderStatusEnum;
  reports: EmergencyReport[];
  coordinatedMissions: Mission[]; // Attention : circular reference, peut être omis si inutile
}

export interface EmergencyReport {
  id: string;
  citizen: User;
  description: string;
  location: string;
  mediaUrl?: string;
  mission?: Mission; // mission peut être nul si non encore affectée
  reportedAt: string; // ISO date string
  resolvedAt?: string;
  status: EmergencyStatus;
  urgencyLevel: number;
}

export interface MissionLog {
  id: string;
  createdAt: string;
  message: string;
  statusChangeTo: string;
  mission: Mission;
  user: User;
}

export interface Mission {
  id: string;
  assignedResponders: User[];
  coordinator: User;
  startTime: string;
  endTime: string;
  incident: EmergencyReport;
  logs: MissionLog[];
  status: MissionStatus;
}


interface Message {
  id: number;
  sender: "COORDINATOR" | "RESPONDER";
  content: string;
  timestamp: string;
}

interface DecodedToken {
  role: string;
}

const ResponderPage = () => {
  const navigate = useNavigate();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentLocation, setCurrentLocation] = useState<GeolocationCoordinates | null>(null);
  const [locationSharing, setLocationSharing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  

   // Check authentication on mount
   useEffect(() => {
    const token = localStorage.getItem("accessToken");
    console.log("🪪 Raw token:", token);
  
    if (!token) {
      navigate("/login");
      return;
    }
  
    try {
      const rawToken = token.startsWith("Bearer ") ? token.slice(7) : token;
      const decoded: DecodedToken = jwtDecode(rawToken);
      console.log("✅ Decoded token:", decoded);
  
      const role = Array.isArray(decoded.role) ? decoded.role[0] : decoded.role;
  
      if (role !== "RESPONDER") {
        toast({
        variant: "destructive",
        title: "Error",
        description: "Sorry,it isn't your role.",
      });
        window.location.href = "http://localhost:8080/";
        return;
      }
  
    } catch (error) {
      console.error("❌ Error decoding token:", error);
      localStorage.removeItem("accessToken");
      navigate("/login");
    }
  }, [navigate]);
  

  // Fetch missions assigned to this responder
  useEffect(() => {
    const loadMissions = async () => {
      try {
        const data = await fetchMissions();
        setMissions(data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error loading missions",
          description: "Failed to fetch your assigned missions",
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadMissions();
  }, []);

/*
  // Load messages when selecting a mission
  useEffect(() => {
    if (selectedMission) {
      // In a real app, you would fetch messages from your API here
      // For now we'll use mock messages
      setMessages([
        {
          id: 1,
          sender: "COORDINATOR",
          content: `Please confirm your ETA for mission ${selectedMission.id}`,
          timestamp: new Date().toISOString(),
        }
      ]);
    }
  }, [selectedMission]);

  */

  // Handle location sharing
  useEffect(() => {
    if (locationSharing) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => setCurrentLocation(position.coords),
        (error) => {
          toast({
            variant: "destructive",
            title: "Location error",
            description: error.message,
          });
        },
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [locationSharing, toast]);

  const handleStatusUpdate = async (missionId: number, newStatus: MissionStatus) => {
    try {
      await updateMissionStatus(missionId, newStatus);
      setMissions(missions.map(mission => 
        mission.id === missionId.toString() ? { ...mission, status: newStatus } : mission
      ));
      toast({
        title: "Status updated",
        description: `Mission status changed to ${newStatus.replace('_', ' ')}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "Failed to update mission status",
      });
    }
  };




  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedMission) return;

    try {
      // In a real app, you would send this to your API
      const sentMessage = {
        id: messages.length + 1,
        sender: "RESPONDER" as const,
        content: newMessage,
        timestamp: new Date().toISOString(),
      };
      
      await sendMissionMessage(+selectedMission.id, newMessage);
      setMessages([...messages, sentMessage]);
      setNewMessage("");
      
      // Simulate coordinator reply
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: prev.length + 2,
          sender: "COORDINATOR",
          content: "Message received. Stand by for further instructions.",
          timestamp: new Date().toISOString(),
        }]);
      }, 2000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Message failed",
        description: "Failed to send message",
      });
    }
  };

  
  const toggleLocationSharing = () => {
    setLocationSharing(!locationSharing);
    toast({
      title: locationSharing ? "Location sharing stopped" : "Location sharing activated",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  console.log(missions);
  

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-red-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-2">Responder Portal</h1>
          <p className="text-gray-600">Your assigned missions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            {missions.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-gray-500">No missions assigned to you currently</p>
                </CardContent>
              </Card>
            ) : (
              missions.map((mission) => (
                <Card key={mission.id} className="border-l-4 border-red-500">
                  <CardHeader>
                    <CardTitle className="text-lg">Mission #{mission.id}</CardTitle>
                    <p className="font-medium">{mission.incident.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-red-500" />
                      <span>{mission.incident.location}</span>
                    </div>

                    <div className="space-y-2">
                      {["ASSIGNED", "EN_ROUTE", "ON_SITE", "COMPLETED"].map((status) => (
                        <div key={status} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={mission.status === status}
                            readOnly
                            className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                          <span>{status.replace('_', ' ')}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={mission.status === "ASSIGNED" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleStatusUpdate(+mission.id, MissionStatus.EN_ROUTE)}
                        disabled={mission.status !== "ASSIGNED"}
                      >
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Mark En Route
                      </Button>
                      <Button
                        variant={mission.status === "EN_ROUTE" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleStatusUpdate(+mission.id, MissionStatus.ON_SITE)}
                        disabled={mission.status !== "EN_ROUTE"}
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        Mark On Site
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedMission(mission)}
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Chat
                      </Button>
                    </div>

                    <p className="text-xs text-gray-500">
                      Assigned: {new Date(mission.startTime).toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}

            <Card className="border-l-4 border-red-500">
              <CardHeader>
                <CardTitle>Location Sharing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Button
                    onClick={toggleLocationSharing}
                    variant={locationSharing ? "default" : "outline"}
                  >
                    {locationSharing ? "Sharing Active" : "Share Location"}
                  </Button>
                  {currentLocation && locationSharing && (
                    <div className="text-sm">
                      <p>
                        Coordinates: {currentLocation.latitude.toFixed(6)},{" "}
                        {currentLocation.longitude.toFixed(6)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {selectedMission && (
            <Card className="border-l-4 border-red-500 h-fit">
              <CardHeader>
                <CardTitle>
                  Mission #{selectedMission.id} Chat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 overflow-y-auto space-y-4 mb-4">
                  {messages.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      No messages yet
                    </p>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === "RESPONDER" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-lg px-4 py-2 ${
                            message.sender === "RESPONDER"
                              ? "bg-red-100 text-red-900"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <p>{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                  />
                  <Button type="submit">Send</Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResponderPage;
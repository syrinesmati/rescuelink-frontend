
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Check, ArrowRight, MapPin, Clock, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";

// Type for the decoded token (adjust if you use other fields)
interface DecodedToken {
  role: string;
}


type MissionStatus = "Assigned" | "En Route" | "On Site" | "Completed";


// Type for the decoded token (adjust if you use other fields)
interface DecodedToken {
  role: string;
  exp: number; // for expiration, optional
}


interface Mission {
  id: number;
  description: string;
  location: string;
  status: MissionStatus;
  assignedAt: Date;
}

interface Message {
  id: number;
  sender: "coordinator" | "responder";
  content: string;
  timestamp: Date;
  missionId: number;
}

const initialMissions: Mission[] = [
  {
    id: 1,
    description: "Respond to car accident on 5th Avenue",
    location: "5th Avenue, City Center",
    status: "Assigned",
    assignedAt: new Date(Date.now() - 1000 * 60 * 15),
  },
  {
    id: 2,
    description: "Assist with fire evacuation on Elm Street",
    location: "Elm Street, Block 3",
    status: "En Route",
    assignedAt: new Date(Date.now() - 1000 * 60 * 5),
  },
];

const initialMessages: Message[] = [
  {
    id: 1,
    sender: "coordinator",
    content: "Please confirm your ETA to the accident site.",
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
    missionId: 1,
  },
  {
    id: 2,
    sender: "coordinator",
    content: "Be advised: Traffic congestion reported on Main Street. Consider alternate route.",
    timestamp: new Date(Date.now() - 1000 * 60 * 3),
    missionId: 1,
  },
  {
    id: 3,
    sender: "coordinator",
    content: "Fire department is already on site. Focus on evacuation assistance.",
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
    missionId: 2,
  },
];

const ResponderPage = () => {
  const navigate = useNavigate();
  const [missions, setMissions] = useState<Mission[]>(initialMissions);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [currentLocation, setCurrentLocation] = useState<GeolocationCoordinates | null>(null);
  const [locationSharing, setLocationSharing] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const { toast } = useToast();
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
      window.location.href = "http://localhost:8080/";
      return;
    }

  } catch (error) {
    console.error("❌ Error decoding token:", error);
    localStorage.removeItem("accessToken");
    navigate("/login");
  }
}, [navigate]);



  useEffect(() => {
    if (locationSharing) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setCurrentLocation(position.coords);
          setLocationError(null);
        },
        (error) => {
          setLocationError(`Error getting location: ${error.message}`);
          setLocationSharing(false);
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

  const updateMissionStatus = (id: number, newStatus: MissionStatus) => {
    setMissions((prevMissions) =>
      prevMissions.map((mission) =>
        mission.id === id ? { ...mission, status: newStatus } : mission
      )
    );

    toast({
      title: "Status updated",
      description: `Mission status updated to ${newStatus}`,
    });
  };

  const toggleLocationSharing = () => {
    if (!locationSharing) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCurrentLocation(position.coords);
            setLocationSharing(true);
            toast({
              title: "Location sharing activated",
              description: "Your location is now being shared with coordinators.",
            });
          },
          (error) => {
            setLocationError(`Error getting location: ${error.message}`);
            toast({
              variant: "destructive",
              title: "Location error",
              description: error.message,
            });
          }
        );
      } else {
        setLocationError("Geolocation is not supported by this browser.");
        toast({
          variant: "destructive",
          title: "Location error",
          description: "Geolocation is not supported by this browser.",
        });
      }
    } else {
      setLocationSharing(false);
      toast({
        title: "Location sharing deactivated",
        description: "Your location is no longer being shared.",
      });
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedMission) return;
    
    const message: Message = {
      id: messages.length + 1,
      sender: "responder",
      content: newMessage,
      timestamp: new Date(),
      missionId: selectedMission.id,
    };
    
    setMessages([...messages, message]);
    setNewMessage("");
    
    setTimeout(() => {
      const reply: Message = {
        id: messages.length + 2,
        sender: "coordinator",
        content: "Message received. Stand by for further instructions.",
        timestamp: new Date(),
        missionId: selectedMission.id,
      };
      
      setMessages(prev => [...prev, reply]);
    }, 3000);
  };

  const filteredMessages = messages.filter(
    (message) => selectedMission && message.missionId === selectedMission.id
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-red-50 dark:from-slate-900 dark:to-red-950/30 flex items-center justify-center p-6">
      <div className="max-w-7xl w-full mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
            Responder Dashboard
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            View and manage your assigned missions in real-time
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            {missions.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400">
                No missions assigned currently.
              </p>
            ) : (
              <div className="space-y-6">
                {missions.map((mission) => (
                  <Card key={mission.id} className="border border-red-200 dark:border-red-900/40 shadow-md rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg">
                    <div className="border-l-4 border-red-600 dark:border-red-400 h-full">
                      <CardHeader>
                        <CardTitle className="text-red-700 dark:text-red-400">
                          Mission #{mission.id}
                        </CardTitle>
                        <CardDescription>{mission.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="mb-2 text-gray-800 dark:text-gray-200 flex items-center gap-1">
                          <MapPin className="inline-block w-4 h-4 text-red-600 dark:text-red-500" />
                          <span>{mission.location}</span>
                        </p>
                        <p className="text-sm mb-4 text-red-700 dark:text-red-400 font-semibold">
                          Status: {mission.status}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant={mission.status === "Assigned" ? "destructive" : "outline"}
                            size="sm"
                            disabled={mission.status !== "Assigned"}
                            onClick={() => updateMissionStatus(mission.id, "En Route")}
                          >
                            <ArrowRight className="w-4 h-4" /> En Route
                          </Button>
                          <Button
                            variant={mission.status === "En Route" ? "destructive" : "outline"}
                            size="sm"
                            disabled={mission.status !== "En Route"}
                            onClick={() => updateMissionStatus(mission.id, "On Site")}
                          >
                            <Clock className="w-4 h-4" /> On Site
                          </Button>
                          <Button
                            variant={mission.status === "On Site" ? "destructive" : "outline"}
                            size="sm"
                            disabled={mission.status !== "On Site"}
                            onClick={() => updateMissionStatus(mission.id, "Completed")}
                          >
                            <Check className="w-4 h-4" /> Completed
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedMission(mission)}
                          >
                            <MessageCircle className="w-4 h-4" /> Chat
                          </Button>
                        </div>
                        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                          Assigned: {mission.assignedAt.toLocaleString()}
                        </p>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            <Card className="mt-6 border border-red-200 dark:border-red-900/40 shadow-md rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg">
              <div className="border-l-4 border-red-600 dark:border-red-400 h-full">
                <CardHeader>
                  <CardTitle className="text-red-700 dark:text-red-400">
                    Location Sharing
                  </CardTitle>
                  <CardDescription>
                    Share your real-time location with coordinators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    <Button 
                      onClick={toggleLocationSharing}
                      variant={locationSharing ? "destructive" : "default"}
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      {locationSharing ? "Stop Sharing Location" : "Share My Location"}
                    </Button>
                    
                    {locationError && (
                      <p className="text-red-500 text-sm">{locationError}</p>
                    )}
                    
                    {currentLocation && locationSharing && (
                      <div className="text-sm">
                        <p className="font-medium">Current coordinates:</p>
                        <p>Latitude: {currentLocation.latitude.toFixed(6)}</p>
                        <p>Longitude: {currentLocation.longitude.toFixed(6)}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Accuracy: ±{currentLocation.accuracy.toFixed(1)} meters
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </div>
            </Card>
          </div>

          {selectedMission && (
            <Card className="border border-red-200 dark:border-red-900/40 shadow-md rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg">
              <div className="border-l-4 border-red-600 dark:border-red-400 h-full">
                <CardHeader>
                  <CardTitle className="text-red-700 dark:text-red-400">
                    Chat - Mission #{selectedMission.id}
                  </CardTitle>
                  <CardDescription>
                    Communicate with coordinators about your mission
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] overflow-y-auto bg-gray-50 dark:bg-gray-800 rounded-md p-4 mb-4">
                    {filteredMessages.length === 0 ? (
                      <p className="text-center text-gray-500 dark:text-gray-400">
                        No messages yet
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {filteredMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.sender === "responder" ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                                message.sender === "responder"
                                  ? "bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100"
                                  : "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                              }`}
                            >
                              <p>{message.content}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {message.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <form onSubmit={sendMessage} className="flex gap-2 w-full">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit">Send</Button>
                  </form>
                </CardFooter>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResponderPage;
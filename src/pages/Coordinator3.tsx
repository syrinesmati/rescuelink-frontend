import React, { useState, useEffect } from "react";
import { AlertTriangle, PlusCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Users,
  Bell,
  Clock,
  Check,
  Filter,
  MapPin,
  UserPlus,
  MessageCircle,
  Map,
  RefreshCw
} from "lucide-react";
import { ChartContainer } from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { 
  fetchEmergencyReports,
  fetchResponders,
  updateEmergencyStatus as apiUpdateEmergencyStatus,
  updateEmergencyUrgency,
  assignResponderToEmergency,
  sendEmergencyMessage,
  createNewMission,
  updateMissionStatus as apiUpdateMissionStatus,
  fetchMissions
} from "@/api/rescueApi";
import { User } from "./Responder";
import { EmergencyStatus, MissionStatus,UserRoleEnum } from "@/enums/types";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Mission } from "./Responder";
import { useNavigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import { log } from "console";

interface DecodedToken {
  sub: number,
  role: string;
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



const CoordinatorPage3 = () => {
    const navigate = useNavigate();
  const [emergencies, setEmergencies] = useState<EmergencyReport[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [responders, setResponders] = useState<User[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedEmergency, setSelectedEmergency] = useState<EmergencyReport | null>(null);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [chatMessage, setChatMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateMissionOpen, setIsCreateMissionOpen] = useState(false);
  const [newMissionData, setNewMissionData] = useState({
    emergencyId: 0,
    description: "",
    priority: "MEDIUM"
  });
  const { toast } = useToast();

  type EmergencyUrgency = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  let decoded: DecodedToken

  const urgencyToLevel = {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    CRITICAL: 4
  };

  const getUrgencyLabel = (urgencyLevel: number): EmergencyUrgency => {
    if (urgencyLevel >= 4) return "CRITICAL";
    if (urgencyLevel === 3) return "HIGH";
    if (urgencyLevel === 2) return "MEDIUM";
    return "LOW";
  };

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
        decoded= jwtDecode(rawToken);
        console.log("✅ Decoded token:", decoded);
    
        const role = Array.isArray(decoded.role) ? decoded.role[0] : decoded.role;
    
        if (role !== "COORDINATOR") {
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


  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [emergencyData, responderData, missionData] = await Promise.all([
          fetchEmergencyReports(),
          fetchResponders(),
          fetchMissions()
        ]);

        const responders = responderData.filter((user) => user.role.toLowerCase() === UserRoleEnum.RESPONDER);
        setEmergencies(emergencyData);
        setResponders(responders);
        setMissions(missionData);
        
        
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setError("Failed to load data. Please try again later.");
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load data",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);

  // Filter emergencies
  const filteredEmergencies = emergencies.filter((emergency) => {
    return (
      (statusFilter === "" || emergency.status === statusFilter) &&
      (urgencyFilter === "" || emergency.urgencyLevel.toString() === urgencyFilter) &&
      (searchQuery === "" ||
        emergency.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emergency.location.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  
  // Dashboard metrics
  const activeCount = emergencies.filter(
    e => e.status === "DISPATCHED" || e.status === "IN_PROGRESS"
  ).length;
  
  const availableTeams = responders.filter(
    r => r.ResponderStatus === "AVAILABLE"
  ).length;
  
  const inProgressCount = emergencies.filter(
    e => e.status === "IN_PROGRESS"
  ).length;
  
  const resolvedCount = emergencies.filter(
    e => e.status === "RESOLVED"
  ).length;


  // Status updates
const handleEmergencyStatusUpdate = async (emergencyId: number, status: EmergencyStatus) => {
  try {
    await apiUpdateEmergencyStatus(emergencyId, status);
    setEmergencies(prev => prev.map(emergency =>
      +emergency.id === emergencyId ? { ...emergency, status } : emergency
    ));
    toast({
      title: "Status Updated",
      description: `Emergency status changed to ${status.replace('_', ' ')}`,
    });
  } catch (error) {
    console.error("Failed to update emergency status:", error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to update status",
    });
  }
};

const handleMissionStatusUpdate = async (missionId: number, status: MissionStatus) => {
  try {
    await apiUpdateMissionStatus(missionId, status);
    setMissions(prev => prev.map(mission =>
      +mission.id === missionId ? { ...mission, status } : mission
    ));
    toast({
      title: "Status Updated",
      description: `Mission status changed to ${status.replace('_', ' ')}`,
    });
  } catch (error) {
    console.error("Failed to update mission status:", error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to update status",
    });
  }
};

  // Mission creation
const handleCreateMission = async () => {
  try {
    const createdMission = await createNewMission({
      incidentId: newMissionData.emergencyId, // 👈 renomme ici
      responderIds: responders.map(r => +r.id),
    },
    decoded.sub
  );
    
    setMissions([...missions, createdMission]);
    setIsCreateMissionOpen(false);
    toast({
      title: "Mission Created",
      description: "New mission has been successfully created",
    });
  } catch (error) {
    console.error("Failed to create mission:", error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to create mission",
    });
  }
};

  // Assign responders
  const handleAssignResponders = async (emergencyId: number, responderIds: number[]) => {
    try {
      await Promise.all(
        responderIds.map(responderId => 
          assignResponderToEmergency(emergencyId, [responderId])
      ));
      
      // Refresh data
      const [updatedEmergencies, updatedResponders] = await Promise.all([
        fetchEmergencyReports(),
        fetchResponders()
      ]);
      
      setEmergencies(updatedEmergencies);
      setResponders(updatedResponders);
      
      toast({
        title: "Responders Assigned",
        description: "Responders have been successfully assigned",
      });
    } catch (error) {
      console.error("Failed to assign responders:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to assign responders",
      });
    }
  };

  // Urgency updates
  const handleUpdateUrgency = async (emergencyId: number, urgency: EmergencyUrgency) => {
    try {
      await updateEmergencyUrgency(emergencyId, urgency);
      setEmergencies(prev => prev.map(emergency =>
        +emergency.id === emergencyId
          ? { ...emergency, urgencyLevel: urgencyToLevel[urgency] }
          : emergency
      ));
      toast({
        title: "Urgency Updated",
        description: `Emergency urgency set to ${urgency}`,
      });
    } catch (error) {
      console.error("Failed to update urgency:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update urgency",
      });
    }
  };

  // Chat functionality
  const handleSendMessage = async () => {
    if (chatMessage.trim() && selectedEmergency) {
      try {
        await sendEmergencyMessage(+selectedEmergency.id, chatMessage);
        setChatMessage("");
        toast({
          title: "Message Sent",
          description: "Your message has been sent to responders",
        });
      } catch (error) {
        console.error("Failed to send message:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to send message",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center p-4 bg-red-100 rounded-lg max-w-md">
          <AlertTriangle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h3 className="text-xl font-bold text-red-700 mb-2">Error Loading Data</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-b from-slate-50 to-red-50 dark:from-slate-900 dark:to-red-950/30 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Dashboard Header */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
            Coordinator Dashboard
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            Monitor and manage emergency responses across the system
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <Card className="border border-red-200 dark:border-red-900/40 shadow-md rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg">
            <div className="border-l-4 border-red-600 dark:border-red-400 h-full">
              <CardHeader>
                <CardTitle className="text-lg text-red-700 dark:text-red-400">
                  Active Emergencies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-red-600 dark:text-red-500" />
                  <p className="text-3xl font-bold text-red-700 dark:text-red-400">
                    {activeCount}
                  </p>
                </div>
              </CardContent>
            </div>
          </Card>

          <Card className="border border-red-200 dark:border-red-900/40 shadow-md rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg">
            <div className="border-l-4 border-red-600 dark:border-red-400 h-full">
              <CardHeader>
                <CardTitle className="text-lg text-red-700 dark:text-red-400">
                  Available Teams
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-red-600 dark:text-red-500" />
                  <p className="text-3xl font-bold text-red-700 dark:text-red-400">
                    {availableTeams}
                  </p>
                </div>
              </CardContent>
            </div>
          </Card>

          <Card className="border border-red-200 dark:border-red-900/40 shadow-md rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg">
            <div className="border-l-4 border-red-600 dark:border-red-400 h-full">
              <CardHeader>
                <CardTitle className="text-lg text-red-700 dark:text-red-400">
                  In Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-red-600 dark:text-red-500" />
                  <p className="text-3xl font-bold text-red-700 dark:text-red-400">
                    {inProgressCount}
                  </p>
                </div>
              </CardContent>
            </div>
          </Card>

          <Card className="border border-red-200 dark:border-red-900/40 shadow-md rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg">
            <div className="border-l-4 border-red-600 dark:border-red-400 h-full">
              <CardHeader>
                <CardTitle className="text-lg text-red-700 dark:text-red-400">
                  Resolved Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-red-600 dark:text-red-500" />
                  <p className="text-3xl font-bold text-red-700 dark:text-red-400">
                    {resolvedCount}
                  </p>
                </div>
              </CardContent>
            </div>
          </Card>

          <Button 
            onClick={() => setIsCreateMissionOpen(true)}
            className="h-full flex flex-col items-center justify-center gap-2"
          >
            <PlusCircle className="w-6 h-6" />
            <span>Create New Mission</span>
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Emergency Queue */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border border-red-200 dark:border-red-900/40 shadow-md rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg">
              <div className="border-l-4 border-red-600 dark:border-red-400 h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-red-700 dark:text-red-400">
                    Emergency Queue
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[140px]">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Statuses</SelectItem>
                        <SelectItem value="RECEIVED">Received</SelectItem>
                        <SelectItem value="DISPATCHED">Dispatched</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="RESOLVED">Resolved</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Urgency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Urgencies</SelectItem>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="CRITICAL">Critical</SelectItem>
                      </SelectContent>
                    </Select>

                    <Input
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-[180px]"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredEmergencies.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400">
                      No emergencies match your filters
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {filteredEmergencies.map((emergency) => (
                        <Card
                          key={emergency.id}
                          className="border border-red-200 dark:border-red-900/40 shadow-md rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg"
                        >
                          <div
                            className={`border-l-4 ${
                              getUrgencyLabel(emergency.urgencyLevel) === "CRITICAL"
                                ? "border-red-600 dark:border-red-400"
                                : getUrgencyLabel(emergency.urgencyLevel) === "HIGH"
                                ? "border-orange-600 dark:border-orange-400"
                                : getUrgencyLabel(emergency.urgencyLevel) === "MEDIUM"
                                ? "border-yellow-600 dark:border-yellow-400"
                                : "border-green-600 dark:border-green-400"
                            } h-full`}
                          >
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-semibold text-red-700 dark:text-red-400">
                                    Emergency #{emergency.id}
                                    <span
                                      className={`ml-2 text-xs px-2 py-1 rounded-full ${
                                        emergency.status === "RECEIVED"
                                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                          : emergency.status === "DISPATCHED"
                                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                          : emergency.status === "IN_PROGRESS"
                                          ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                                          : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                      }`}
                                    >
                                      {emergency.status.replace('_', ' ')}
                                    </span>
                                    <span
                                      className={`ml-2 text-xs px-2 py-1 rounded-full ${
                                        getUrgencyLabel(emergency.urgencyLevel) === "CRITICAL"
                                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                          : getUrgencyLabel(emergency.urgencyLevel) === "HIGH"
                                          ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                                          : getUrgencyLabel(emergency.urgencyLevel) === "MEDIUM"
                                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                          : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                      }`}
                                    >
                                      {getUrgencyLabel(emergency.urgencyLevel)}
                                    </span>
                                  </h4>
                                  <p className="text-gray-700 dark:text-gray-300 mt-1">
                                    {emergency.description}
                                  </p>
                                  <p className="text-sm flex items-center gap-1 mt-1 text-gray-600 dark:text-gray-400">
                                    <MapPin className="w-4 h-4" />{" "}
                                    {emergency.location}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Submitted:{" "}
                                    {new Date(emergency.reportedAt).toLocaleString()}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedEmergency(emergency)}
                                  >
                                    <MessageCircle className="w-4 h-4 mr-1" />{" "}
                                    Chat
                                  </Button>

                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button size="sm" variant="outline">
                                        <UserPlus className="w-4 h-4 mr-1" />{" "}
                                        Assign
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-56">
                                      <div className="space-y-2">
                                        <h4 className="font-medium">
                                          Assign Responders
                                        </h4>
                                        {responders.filter(r => r.ResponderStatus === "AVAILABLE").length === 0 ? (
                                          <p className="text-sm text-gray-500">
                                            No available responders
                                          </p>
                                        ) : (
                                          <div className="space-y-2">
                                            {responders
                                              .filter(r => r.ResponderStatus === "AVAILABLE")
                                              .map((responder) => (
                                                <div
                                                  key={responder.id}
                                                  className="flex justify-between items-center"
                                                >
                                                  <span>{responder.firstName}</span>
                                                  <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleAssignResponders(+emergency.id, [+responder.id])}
                                                  >
                                                    Assign
                                                  </Button>
                                                </div>
                                              ))}
                                            <Button
                                              size="sm"
                                              variant="default"
                                              className="w-full mt-2"
                                              onClick={() => {
                                                const availableIds = responders
                                                  .filter(r => r.ResponderStatus === "AVAILABLE")
                                                  .map(r => Number(r.id));
                                                handleAssignResponders(+emergency.id, availableIds);
                                              }}
                                            >
                                              Assign All
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                    </PopoverContent>
                                  </Popover>

                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="gap-1"
                                      >
                                        <AlertTriangle className="w-4 h-4" />
                                        Set Urgency
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-40">
                                      <div className="grid gap-1">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleUpdateUrgency(+emergency.id, "LOW")}
                                          className="justify-start text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/30"
                                        >
                                          Low
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleUpdateUrgency(+emergency.id, "MEDIUM")}
                                          className="justify-start text-yellow-600 hover:bg-yellow-50 dark:text-yellow-400 dark:hover:bg-yellow-900/30"
                                        >
                                          Medium
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleUpdateUrgency(+emergency.id, "HIGH")}
                                          className="justify-start text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/30"
                                        >
                                          High
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleUpdateUrgency(+emergency.id, "CRITICAL")}
                                          className="justify-start text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                                        >
                                          Critical
                                        </Button>
                                      </div>
                                    </PopoverContent>
                                  </Popover>

                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button size="sm" variant="outline">
                                        Update Status
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-48">
                                      <div className="grid gap-1">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleEmergencyStatusUpdate(+emergency.id, EmergencyStatus.RECEIVED)}
                                          className="justify-start"
                                        >
                                          Received
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleEmergencyStatusUpdate(+emergency.id, EmergencyStatus.DISPATCHED)}
                                          className="justify-start"
                                        >
                                          Dispatched
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleEmergencyStatusUpdate(+emergency.id, EmergencyStatus.IN_PROGRESS)}
                                          className="justify-start"
                                        >
                                          In Progress
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleEmergencyStatusUpdate(+emergency.id, EmergencyStatus.RESOLVED)}
                                          className="justify-start"
                                        >
                                          Resolved
                                        </Button>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              </div>

                              {emergency.mission.assignedResponders && emergency.mission.assignedResponders.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Assigned Teams:
                                  </p>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {emergency.mission.assignedResponders.map((responder) => (
                                      <span
                                        key={responder.id}
                                        className="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-1 rounded-full"
                                      >
                                        {responder.firstName} ({responder.ResponderStatus})
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </div>
            </Card>

            {/* Missions List */}
            <Card className="border border-red-200 dark:border-red-900/40 shadow-md rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg">
              <div className="border-l-4 border-red-600 dark:border-red-400 h-full">
                <CardHeader>
                  <CardTitle className="text-red-700 dark:text-red-400">
                    Active Missions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {missions.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400">
                      No active missions
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {missions.map((mission) => (
                        <Card
                          key={mission.id}
                          className="border border-red-200 dark:border-red-900/40 shadow-md rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg"
                          onClick={() => setSelectedMission(mission)}
                        >
                          <div className="border-l-4 border-red-600 dark:border-red-400 h-full">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-semibold text-red-700 dark:text-red-400">
                                    Mission #{mission.id}
                                    <span
                                      className={`ml-2 text-xs px-2 py-1 rounded-full ${
                                        mission.status === "ASSIGNED"
                                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                          : mission.status === "EN_ROUTE"
                                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                          : mission.status === "ON_SITE"
                                          ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                                          : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                      }`}
                                    >
                                      {mission.status.replace('_', ' ')}
                                    </span>
                                  </h4>
                                  <p className="text-gray-700 dark:text-gray-300 mt-1">
                                    {mission.incident.description}
                                  </p>
                                  <p className="text-sm flex items-center gap-1 mt-1 text-gray-600 dark:text-gray-400">
                                    <MapPin className="w-4 h-4" />{" "}
                                    {mission.incident.location}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Created: {new Date(mission.startTime).toLocaleString()}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button size="sm" variant="outline">
                                        Update Status
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-48">
                                      <div className="grid gap-1">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleMissionStatusUpdate(+mission.id, MissionStatus.ASSIGNED)}
                                          className="justify-start"
                                        >
                                          Assigned
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleMissionStatusUpdate(+mission.id, MissionStatus.EN_ROUTE)}
                                          className="justify-start"
                                        >
                                          En Route
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleMissionStatusUpdate(+mission.id, MissionStatus.ON_SITE)}
                                          className="justify-start"
                                        >
                                          On Site
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleMissionStatusUpdate(+mission.id, MissionStatus.COMPLETED)}
                                          className="justify-start"
                                        >
                                          Completed
                                        </Button>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              </div>
                            </CardContent>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </div>
            </Card>
          </div>

          {/* Operations Map and Timeline */}
          <div className="space-y-6">
            <Card className="border border-red-200 dark:border-red-900/40 shadow-md rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg">
              <div className="border-l-4 border-red-600 dark:border-red-400 h-full">
                <CardHeader>
                  <CardTitle className="text-red-700 dark:text-red-400">
                    Operations Map
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-4 mb-4 h-[200px] flex items-center justify-center">
                    <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
                      <Map className="w-12 h-12 mb-2" />
                      <p>Interactive map</p>
                      <p className="text-xs">(Simulated)</p>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>

            <Card className="border border-red-200 dark:border-red-900/40 shadow-md rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg">
              <div className="border-l-4 border-red-600 dark:border-red-400 h-full">
                <CardHeader>
                  <CardTitle className="text-red-700 dark:text-red-400">
                    Activity Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      emergencies: {
                        label: "Emergencies",
                        theme: { light: "#ef4444", dark: "#f87171" },
                      },
                    }}
                    className="h-[200px]"
                  >
                    <AreaChart
                      data={[
                        { name: "00:00", emergencies: 2 },
                        { name: "04:00", emergencies: 3 },
                        { name: "08:00", emergencies: 5 },
                        { name: "12:00", emergencies: 4 },
                        { name: "16:00", emergencies: 7 },
                        { name: "20:00", emergencies: 3 },
                        { name: "24:00", emergencies: 2 },
                      ]}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="emergencies"
                        stroke="var(--color-emergencies)"
                        fill="var(--color-emergencies)"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </div>
            </Card>

            {selectedMission && (
              <Card className="border border-red-200 dark:border-red-900/40 shadow-md rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg">
                <div className="border-l-4 border-red-600 dark:border-red-400 h-full">
                  <CardHeader>
                    <CardTitle className="text-red-700 dark:text-red-400">
                      Mission #{selectedMission.id} Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium">Description:</h4>
                        <p>{selectedMission.incident.description}</p>
                      </div>
                      <div>
                        <h4 className="font-medium">Status:</h4>
                        <span className={`px-2 py-1 text-sm rounded-full ${
                          selectedMission.status === "COMPLETED" ? "bg-green-100 text-green-800" :
                          selectedMission.status === "ON_SITE" ? "bg-yellow-100 text-yellow-800" :
                          selectedMission.status === "EN_ROUTE" ? "bg-orange-100 text-orange-800" :
                          "bg-blue-100 text-blue-800"
                        }`}>
                          {selectedMission.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium">Location:</h4>
                        <p className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {selectedMission.incident.location}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium">Created At:</h4>
                        <p>{new Date(selectedMission.startTime).toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Chat Panel */}
        {selectedEmergency && (
          <Card className="border border-red-200 dark:border-red-900/40 shadow-md rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg mb-8">
            <div className="border-l-4 border-red-600 dark:border-red-400 h-full">
              <CardHeader>
                <CardTitle className="text-red-700 dark:text-red-400">
                  Communication - Emergency #{selectedEmergency.id}
                </CardTitle>
                <CardDescription>
                  Chat with responders assigned to this emergency
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] bg-gray-50 dark:bg-gray-800 rounded-md p-4 mb-4 overflow-y-auto">
                  <p className="text-center text-gray-500 dark:text-gray-400">
                    Chat messages will appear here
                  </p>
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage}>Send</Button>
                </div>
              </CardContent>
            </div>
          </Card>
        )}
      </div>

      {/* Create Mission Dialog */}
      <Dialog open={isCreateMissionOpen} onOpenChange={setIsCreateMissionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Mission</DialogTitle>
            <DialogDescription>
              Assign a new mission to respond to an emergency
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Emergency</label>
              <Select
                value={newMissionData.emergencyId.toString()}
                onValueChange={(value) => setNewMissionData({...newMissionData, emergencyId: parseInt(value)})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select emergency" />
                </SelectTrigger>
                <SelectContent>
                  {emergencies.map(emergency => (
                    <SelectItem key={emergency.id} value={emergency.id.toString()}>
                      Emergency #{emergency.id} - {emergency.description.substring(0, 30)}...
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Input
                placeholder="Mission description"
                value={newMissionData.description}
                onChange={(e) => setNewMissionData({...newMissionData, description: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <Select
                value={newMissionData.priority}
                onValueChange={(value) => setNewMissionData({...newMissionData, priority: value as "LOW" | "MEDIUM" | "HIGH"})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreateMission} className="w-full mt-4">
              Create Mission
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default CoordinatorPage3;
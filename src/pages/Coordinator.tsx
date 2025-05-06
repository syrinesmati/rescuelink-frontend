import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";
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

type EmergencyStatus = "Received" | "Dispatched" | "In Progress" | "Resolved";
type EmergencyUrgency = "Low" | "Medium" | "High" | "Critical";

interface Responder {
  id: number;
  name: string;
  status: "Available" | "Assigned" | "En Route" | "On Site";
  location?: string;
}

interface Emergency {
  id: number;
  description: string;
  location: string;
  status: EmergencyStatus;
  urgency: EmergencyUrgency;
  assignedTo?: number[];
  submittedAt: Date;
}

const emergencyData = [
  {
    id: 1,
    description: "Car accident on 5th Avenue, need medical assistance.",
    location: "5th Avenue, City Center",
    status: "Dispatched" as EmergencyStatus,
    urgency: "High" as EmergencyUrgency,
    assignedTo: [1],
    submittedAt: new Date(Date.now() - 1000 * 60 * 60),
  },
  {
    id: 2,
    description: "Fire in a residential building on Elm Street.",
    location: "Elm Street, Block 3",
    status: "In Progress" as EmergencyStatus,
    urgency: "Critical" as EmergencyUrgency,
    assignedTo: [2],
    submittedAt: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: 3,
    description: "Flooding reported in downtown area.",
    location: "Main Street, Downtown",
    status: "Received" as EmergencyStatus,
    urgency: "Medium" as EmergencyUrgency,
    submittedAt: new Date(Date.now() - 1000 * 60 * 10),
  },
];

const responderData = [
  {
    id: 1,
    name: "Team Alpha",
    status: "Assigned" as const,
    location: "5th Avenue, City Center",
  },
  {
    id: 2,
    name: "Team Beta",
    status: "En Route" as const,
    location: "Elm Street, Block 3",
  },
  { id: 3, name: "Team Delta", status: "Available" as const },
  { id: 4, name: "Team Gamma", status: "Available" as const },
  { id: 5, name: "Team Epsilon", status: "Available" as const },
];

const timelineData = [
  { name: "00:00", emergencies: 2 },
  { name: "04:00", emergencies: 3 },
  { name: "08:00", emergencies: 5 },
  { name: "12:00", emergencies: 4 },
  { name: "16:00", emergencies: 7 },
  { name: "20:00", emergencies: 3 },
  { name: "24:00", emergencies: 2 },
];

const CoordinatorPage = () => {
  const [emergencies, setEmergencies] = useState<Emergency[]>(emergencyData);
  const [responders, setResponders] = useState<Responder[]>(responderData);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedEmergency, setSelectedEmergency] = useState<Emergency | null>(
    null
  );
  const [chatMessage, setChatMessage] = useState<string>("");

  const filteredEmergencies = emergencies.filter((emergency) => {
    return (
      (statusFilter === "" || emergency.status === statusFilter) &&
      (urgencyFilter === "" || emergency.urgency === urgencyFilter) &&
      (searchQuery === "" ||
        emergency.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        emergency.location.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const assignResponder = (emergencyId: number, responderId: number) => {
    setEmergencies((prev) =>
      prev.map((emergency) => {
        if (emergency.id === emergencyId) {
          const assignedTo = emergency.assignedTo || [];
          if (!assignedTo.includes(responderId)) {
            return {
              ...emergency,
              assignedTo: [...assignedTo, responderId],
              status:
                emergency.status === "Received"
                  ? "Dispatched"
                  : emergency.status,
            };
          }
        }
        return emergency;
      })
    );

    setResponders((prev) =>
      prev.map((responder) => {
        if (responder.id === responderId && responder.status === "Available") {
          return { ...responder, status: "Assigned" };
        }
        return responder;
      })
    );
  };

  const handleSendMessage = () => {
    if (chatMessage.trim() && selectedEmergency) {
      console.log(
        `Message sent to emergency #${selectedEmergency.id}: ${chatMessage}`
      );
      setChatMessage("");
    }
  };

  const availableResponders = responders.filter(
    (r) => r.status === "Available"
  );

  const activeCount = emergencies.filter(
    (e) => e.status === "Dispatched" || e.status === "In Progress"
  ).length;
  const availableTeams = responders.filter(
    (r) => r.status === "Available"
  ).length;
  const inProgressCount = emergencies.filter(
    (e) => e.status === "In Progress"
  ).length;
  const resolvedToday = emergencies.filter(
    (e) => e.status === "Resolved"
  ).length;
  const updateEmergencyUrgency = (
    emergencyId: number,
    newUrgency: EmergencyUrgency
  ) => {
    setEmergencies((prev) =>
      prev.map((emergency) =>
        emergency.id === emergencyId
          ? { ...emergency, urgency: newUrgency }
          : emergency
      )
    );
  };

  return (
    <section className="min-h-screen bg-gradient-to-b from-slate-50 to-red-50 dark:from-slate-900 dark:to-red-950/30 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
            Coordinator Dashboard
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            Monitor and manage emergency responses across the system
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {[
            "Active Emergencies",
            "Available Teams",
            "Available Responders",
            "In Progress",
            "Resolved Today",
          ].map((title, index) => (
            <Card
              key={title}
              className="border border-red-200 dark:border-red-900/40 shadow-md rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg"
            >
              <div className="border-l-4 border-red-600 dark:border-red-400 h-full">
                <CardHeader>
                  <CardTitle className="text-lg text-red-700 dark:text-red-400">
                    {title}
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
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card className="border border-red-200 dark:border-red-900/40 shadow-md rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg">
              <div className="border-l-4 border-red-600 dark:border-red-400 h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-red-700 dark:text-red-400">
                    Emergency Queue
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-[140px]">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all_statuses">
                          All Statuses
                        </SelectItem>
                        <SelectItem value="Received">Received</SelectItem>
                        <SelectItem value="Dispatched">Dispatched</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={urgencyFilter}
                      onValueChange={setUrgencyFilter}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Urgency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all_urgencies">
                          All Urgencies
                        </SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Critical">Critical</SelectItem>
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
                              emergency.urgency === "Critical"
                                ? "border-red-600 dark:border-red-400"
                                : emergency.urgency === "High"
                                ? "border-orange-600 dark:border-orange-400"
                                : emergency.urgency === "Medium"
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
                                        emergency.status === "Received"
                                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                          : emergency.status === "Dispatched"
                                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                          : emergency.status === "In Progress"
                                          ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                                          : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                      }`}
                                    >
                                      {emergency.status}
                                    </span>
                                    <span
                                      className={`ml-2 text-xs px-2 py-1 rounded-full ${
                                        emergency.urgency === "Critical"
                                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                          : emergency.urgency === "High"
                                          ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                                          : emergency.urgency === "Medium"
                                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                          : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                      }`}
                                    >
                                      {emergency.urgency}
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
                                    {emergency.submittedAt.toLocaleString()}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      setSelectedEmergency(emergency)
                                    }
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
                                        {availableResponders.length === 0 ? (
                                          <p className="text-sm text-gray-500">
                                            No available responders
                                          </p>
                                        ) : (
                                          availableResponders.map(
                                            (responder) => (
                                              <div
                                                key={responder.id}
                                                className="flex justify-between items-center"
                                              >
                                                <span>{responder.name}</span>
                                                <Button
                                                  size="sm"
                                                  variant="outline"
                                                  onClick={() =>
                                                    assignResponder(
                                                      emergency.id,
                                                      responder.id
                                                    )
                                                  }
                                                >
                                                  Assign
                                                </Button>
                                              </div>
                                            )
                                          )
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
                                          onClick={() =>
                                            updateEmergencyUrgency(
                                              emergency.id,
                                              "Low"
                                            )
                                          }
                                          className="justify-start text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/30"
                                        >
                                          Low
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            updateEmergencyUrgency(
                                              emergency.id,
                                              "Medium"
                                            )
                                          }
                                          className="justify-start text-yellow-600 hover:bg-yellow-50 dark:text-yellow-400 dark:hover:bg-yellow-900/30"
                                        >
                                          Medium
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            updateEmergencyUrgency(
                                              emergency.id,
                                              "High"
                                            )
                                          }
                                          className="justify-start text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/30"
                                        >
                                          High
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            updateEmergencyUrgency(
                                              emergency.id,
                                              "Critical"
                                            )
                                          }
                                          className="justify-start text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                                        >
                                          Critical
                                        </Button>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              </div>

                              {emergency.assignedTo &&
                                emergency.assignedTo.length > 0 && (
                                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                      Assigned Teams:
                                    </p>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                      {emergency.assignedTo.map((id) => {
                                        const responder = responders.find(
                                          (r) => r.id === id
                                        );
                                        return responder ? (
                                          <span
                                            key={id}
                                            className="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-1 rounded-full"
                                          >
                                            {responder.name} ({responder.status}
                                            )
                                          </span>
                                        ) : null;
                                      })}
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
          </div>

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

                <h4 className="font-medium text-red-700 dark:text-red-400 mb-2">
                  Activity Timeline
                </h4>
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
                    data={timelineData}
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
        </div>

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
                  {/* In a real application, messages would be displayed here */}
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
    </section>
  );
};

export default CoordinatorPage;

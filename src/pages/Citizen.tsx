import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, AlertTriangle, LocateFixed, LocateOff } from "lucide-react";

type ReportStatus = "Received" | "Dispatched" | "In Progress" | "Resolved";

interface EmergencyReport {
  id: number;
  description: string;
  location: string;
  coordinates: { lat: number; lng: number } | null;
  status: ReportStatus;
  submittedAt: Date;
}

const initialReports: EmergencyReport[] = [
  {
    id: 1,
    description: "Car accident on 5th Avenue, need medical assistance.",
    location: "5th Avenue, City Center",
    coordinates: { lat: 40.7128, lng: -74.006 },
    status: "Dispatched",
    submittedAt: new Date(Date.now() - 1000 * 60 * 60),
  },
  {
    id: 2,
    description: "Fire in a residential building on Elm Street.",
    location: "Elm Street, Block 3",
    coordinates: { lat: 40.7357, lng: -74.0034 },
    status: "In Progress",
    submittedAt: new Date(Date.now() - 1000 * 60 * 30),
  },
];

const CitizenPage = () => {
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [reports, setReports] = useState<EmergencyReport[]>(initialReports);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast({
        variant: "destructive",
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation.",
      });
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ lat: latitude, lng: longitude });

        try {
          // Reverse geocoding to get address from coordinates
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();

          let address = "";
          if (data.address) {
            const { road, house_number, suburb, city, county, state, country } =
              data.address;
            address = [
              house_number ? `${house_number} ` : "",
              road || "",
              suburb ? `, ${suburb}` : "",
              city ? `, ${city}` : county ? `, ${county}` : "",
              state ? `, ${state}` : "",
              country ? `, ${country}` : "",
            ].join("");
          }

          setLocation(
            address ||
              `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`
          );
        } catch (error) {
          console.error("Reverse geocoding failed:", error);
          setLocation(
            `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`
          );
        }

        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        toast({
          variant: "destructive",
          title: "Location error",
          description: error.message || "Unable to retrieve your location.",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please describe the emergency.",
      });
      return;
    }

    if (!coordinates) {
      toast({
        variant: "destructive",
        title: "Location required",
        description: "Please get your location before submitting.",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate report submission delay
    setTimeout(() => {
      const newReport: EmergencyReport = {
        id: reports.length + 1,
        description,
        location:
          location ||
          `Coordinates: ${coordinates.lat.toFixed(
            4
          )}, ${coordinates.lng.toFixed(4)}`,
        coordinates,
        status: "Received",
        submittedAt: new Date(),
      };
      setReports([newReport, ...reports]);
      setDescription("");
      setLocation("");
      setCoordinates(null);
      setIsSubmitting(false);
      toast({
        title: "Report submitted",
        description:
          "Your emergency report has been received and will be processed shortly.",
      });
    }, 1000);
  };

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case "Received":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
      case "Dispatched":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
      case "In Progress":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100";
      case "Resolved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-b from-slate-50 to-red-50 dark:from-slate-900 dark:to-red-950/30 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
            Emergency Reporting Center
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            Quick and reliable emergency reporting system for citizens
          </p>
        </div>

        <Card className="border border-red-200 dark:border-red-900/40 shadow-md rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <Shield className="h-5 w-5" />
              Report an Emergency
            </CardTitle>
            <CardDescription>
              Please provide accurate details to help us respond quickly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  placeholder="Describe the emergency..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[120px] resize-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Your location will appear here"
                    value={location}
                    readOnly
                    className="focus:ring-2 focus:ring-offset-1 focus:ring-red-500 focus:outline-none"
                  />
                  <Button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={isLocating}
                    className="flex items-center gap-2"
                  >
                    {isLocating ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent border-solid" />
                        Locating...
                      </>
                    ) : (
                      <>
                        {coordinates ? (
                          <LocateFixed className="h-4 w-4" />
                        ) : (
                          <LocateOff className="h-4 w-4" />
                        )}
                        {coordinates ? "Update" : "Get"} Location
                      </>
                    )}
                  </Button>
                </div>
                {coordinates && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Coordinates: {coordinates.lat.toFixed(6)},{" "}
                    {coordinates.lng.toFixed(6)}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full emergency-btn transition-transform duration-200 active:scale-95"
                disabled={isSubmitting || !coordinates}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent border-solid" />
                    Submitting...
                  </span>
                ) : (
                  "Submit Emergency Report"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Your Active Reports
          </h3>

          {reports.length === 0 ? (
            <Alert>
              <AlertTitle>No active reports</AlertTitle>
              <AlertDescription>
                You haven't submitted any emergency reports yet
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
              {reports.map((report) => (
                <Card
                  key={report.id}
                  className="overflow-hidden transition-all duration-200 hover:shadow-md"
                >
                  <div className="emergency-card">
                    <CardContent className="p-6">
                      <p className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">
                        {report.description}
                      </p>
                      <div className="space-y-2">
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          <strong>Location:</strong> {report.location}
                        </p>
                        {report.coordinates && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Coordinates: {report.coordinates.lat.toFixed(6)},{" "}
                            {report.coordinates.lng.toFixed(6)}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              report.status
                            )}`}
                          >
                            {report.status}
                          </span>
                          <time className="text-xs text-slate-500 dark:text-slate-400">
                            {new Intl.DateTimeFormat("en-US", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            }).format(report.submittedAt)}
                          </time>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CitizenPage;

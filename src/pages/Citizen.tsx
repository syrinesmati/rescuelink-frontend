"use client";


import React,{ useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, AlertTriangle, LocateFixed, LocateOff } from "lucide-react";
import { 
  fetchEmergencyReports, 
  submitEmergencyReport,
  updateMissionStatus // Si vous utilisez SSE
} from "@/api/rescueApi";
import type { EmergencyReport, MissionStatus } from "@/types/rescue";
import { useNavigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";



// Utilisez les types du backend
type ReportStatus = "RECEIVED" | "DISPATCHED" | "IN_PROGRESS" | "RESOLVED";

const CitizenPage = () => {
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [locationName, setLocationName] = useState("");
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [reports, setReports] = useState<EmergencyReport[]>([]);
  const { toast } = useToast();


  interface DecodedToken {
  role: string;
}
interface EmergencyReport {
  id: number;
  description: string;
  location: string;
  coordinates: { lat: number; lng: number } | null;
  status: ReportStatus;
  submittedAt: Date;
}


  
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

    if (role !== "CITIZEN") {
      window.location.href = "http://localhost:8080/";
      return;
    }

  } catch (error) {
    console.error("❌ Error decoding token:", error);
    localStorage.removeItem("accessToken");
    navigate("/login");
  }
}, [navigate]);


  // Chargement initial des rapports
  useEffect(() => {
    const loadReports = async () => {
      try {
        const data = await fetchEmergencyReports();
        setReports(data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Échec du chargement des rapports",
        });
      }
    };
    loadReports();
  }, []);

  // Géolocalisation optimisée
  const handleGetLocation = async () => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000
        });
      });

      const { latitude, longitude } = position.coords;
      setCoordinates({ lat: latitude, lng: longitude });

      // Reverse geocoding simplifié
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const { address } = await response.json();
      setLocationName(address?.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur de localisation",
        description: error instanceof Error ? error.message : "Impossible de déterminer la position",
      });
    }
  };

  // Soumission du rapport
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!coordinates) {
      toast({ title: "Localisation requise", variant: "destructive" });
      return;
    }

    try {
      const newReport = await submitEmergencyReport({
        description,
        location: {
          latitude: coordinates.lat,
          longitude: coordinates.lng,
          address: locationName
        },
        urgencyLevel: 3,
        citizenId: 1 // À remplacer par l'ID réel après auth
      });

      setReports([newReport, ...reports]);
      resetForm();
      
      toast({ title: "Rapport envoyé !" });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Échec de l'envoi",
        description: "Veuillez réessayer plus tard"
      });
    }
  };

  const resetForm = () => {
    setDescription("");
    setLocationName("");
    setCoordinates(null);
  };

  // UI Helpers
  const getStatusVariant = (status: ReportStatus) => {
    const variants: Record<ReportStatus, string> = {
      RECEIVED: "bg-blue-100 text-blue-800",
      DISPATCHED: "bg-yellow-100 text-yellow-800",
      IN_PROGRESS: "bg-purple-100 text-purple-800",
      RESOLVED: "bg-green-100 text-green-800"
    };
    return variants[status];
  };

  return (
    <section className="min-h-screen bg-gradient-to-b from-slate-50 to-red-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* En-tête */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
            Emergency Reporting Center
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            Quick and reliable emergency reporting system for citizens
          </p>
        </div>

        {/* Formulaire */}
        <Card>
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
              <Textarea
                placeholder="Describe the emergency..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />

              <div className="flex gap-2">
                <Input
                  value={locationName}
                  readOnly
                  placeholder="Your location will appear here"
                />
                <Button
                  type="button"
                  onClick={handleGetLocation}
                  variant={coordinates ? "outline" : "default"}
                >
                  {coordinates ? <LocateFixed /> : <LocateOff />}
                  {coordinates ? "Mettre à jour" : "Get Location"}
                </Button>
              </div>

              <Button type="submit" className="w-full" disabled={!coordinates}>
                Submit Emergency Report
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Liste des rapports */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Your Active Reports 
          </h3>

          {reports.length === 0 ? (
            <Alert>
              <AlertTitle>No Active Reports</AlertTitle>
            </Alert>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {reports.map((report) => (
                <Card key={report.id}>
                  <CardContent className="p-4">
                    <p>{report.description}</p>
                    <div className="mt-2 flex justify-between items-center">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusVariant(report.status)}`}>
                        {report.status}
                      </span>
                      <time className="text-xs text-gray-500">
                        {new Date(report.submittedAt).toLocaleString()}
                      </time>
                    </div>
                  </CardContent>
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
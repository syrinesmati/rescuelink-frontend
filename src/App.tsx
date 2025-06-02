
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CitizenPage from "./pages/Citizen";
import ResponderPage from "./pages/Responder";
import CoordinatorPage from "./pages/Coordinator";
import NotFound from "./pages/NotFound";
import CoordinatorPage2 from "./pages/Coordinator2";
import CoordinatorPage3 from "./pages/Coordinator3";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/citizen" element={<CitizenPage />} />
            <Route path="/responder" element={<ResponderPage />} />
            <Route path="/coordinator" element={<CoordinatorPage />} />
            <Route path="/coordinator3" element={<CoordinatorPage3/>}  />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
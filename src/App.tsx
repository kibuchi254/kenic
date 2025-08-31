import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext"; // Import AuthProvider
import Index from "./pages/Index";
import DomainCheckout from "./pages/DomainCheckout";
import Signin from "./pages/Signin";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Signup from "./pages/Signup";
import Registrars from "./pages/RegistrarsSelectionPage"; // Import the Registrars component

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider> {/* Wrap BrowserRouter with AuthProvider */}
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/domain-checkout" element={<DomainCheckout />} />
            <Route path="/registrars" element={<Registrars />} /> {/* Add this route */}
            <Route path="/signin" element={<Signin />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/signup" element={<Signup />} />
            {/* Add other routes here */}

            {/* Catch-all route for 404 Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
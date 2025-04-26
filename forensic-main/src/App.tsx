
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import Dashboard from "./pages/Dashboard";

import Case from "./pages/Case";
import NotFound from "./pages/NotFound";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/forgotpassword"
import Profile from "./pages/profile"
import Common from "./pages/commons"
import Usercases from "./pages/usercases";
import Verification from "./pages/2ndstepVerification";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/case/:caseId" element={<Case />} />
          <Route path="/Signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword/>} />
          <Route path="/Profile" element={<Profile/>} />
          <Route path="/common" element={<Common/>} />
          <Route path="/usercases/:caseId" element={<Usercases/>} />
          <Route path="/verification" element={<Verification/>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

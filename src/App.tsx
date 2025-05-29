
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Layout } from "./components/Layout";

// Pages
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import CustomerDetails from "./pages/CustomerDetails";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import NewOrder from "./pages/NewOrder";
import Shipments from "./pages/Shipments";
import ShipmentDetails from "./pages/ShipmentDetails";
import Calendar from "./pages/Calendar";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes */}
            <Route path="/" element={<Layout><Dashboard /></Layout>} />
            <Route path="/customers" element={<Layout><Customers /></Layout>} />
            <Route path="/customers/:customerId" element={<Layout><CustomerDetails /></Layout>} />
            <Route path="/orders" element={<Layout><Orders /></Layout>} />
            <Route path="/orders/:orderId" element={<Layout><OrderDetails /></Layout>} />
            <Route path="/new-order" element={<Layout><NewOrder /></Layout>} />
            <Route path="/shipments" element={<Layout><Shipments /></Layout>} />
            <Route path="/shipments/:shipmentId" element={<Layout><ShipmentDetails /></Layout>} />
            <Route path="/calendar" element={<Layout><Calendar /></Layout>} />
            
            {/* Redirect / to /dashboard */}
            <Route path="/" element={<Navigate to="/customers" replace />} />
            
            {/* Catch-all route */}
            <Route path="*" element={<Layout><NotFound /></Layout>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

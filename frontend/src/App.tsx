import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth-context";
import { AttendanceProvider } from "@/lib/attendance-context";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import GuestDashboard from "./pages/GuestDashboard";
import NetworkDebug from "./pages/NetworkDebug";
import StudentsPage from "./pages/StudentsPage";
import AttendanceLogsPage from "./pages/AttendanceLogsPage";
import StudentDetailsPage from "./pages/StudentDetailsPage";
import ProfilePage from "./pages/ProfilePage";
import AttendanceHistoryPage from "./pages/AttendanceHistoryPage";
import LabManagementPage from "./pages/LabManagementPage";
import ManualAttendancePage from "./pages/ManualAttendancePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <AttendanceProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/students" element={<StudentsPage />} />
              <Route path="/students/:id" element={<StudentDetailsPage />} />
              <Route path="/attendance-logs" element={<AttendanceLogsPage />} />
              <Route path="/my-history" element={<AttendanceHistoryPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/lab-management" element={<LabManagementPage />} />
              <Route path="/manual-attendance" element={<ManualAttendancePage />} />
              <Route path="/guest" element={<GuestDashboard />} />
              <Route path="/debug" element={<NetworkDebug />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AttendanceProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

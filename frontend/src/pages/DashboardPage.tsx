import { useAuth } from "@/lib/auth-context";
import { Navigate } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";
import StudentDashboard from "./StudentDashboard";
import DashboardLayout from "@/components/DashboardLayout";

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated || !user) return <Navigate to="/" replace />;

  return (
    <DashboardLayout>
      {user.role === "admin" ? <AdminDashboard /> : <StudentDashboard />}
    </DashboardLayout>
  );
}

import { useAuth } from "@/lib/auth-context";
import { Navigate } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";
import StudentDashboard from "./StudentDashboard";
import DashboardLayout from "@/components/DashboardLayout";

export default function DashboardPage() {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-hero">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-primary-foreground font-medium animate-pulse">Restoring Session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) return <Navigate to="/" replace />;

  return (
    <DashboardLayout>
      {user.role === "admin" ? <AdminDashboard /> : <StudentDashboard />}
    </DashboardLayout>
  );
}

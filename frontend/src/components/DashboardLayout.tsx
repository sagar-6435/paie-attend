import { ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { QrCode, LayoutDashboard, LogOut, Shield, GraduationCap, Users } from "lucide-react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border hidden md:flex flex-col">
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <QrCode className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <p className="font-semibold text-sidebar-primary-foreground text-sm">PAIE-Attend</p>
              <p className="text-xs text-sidebar-foreground">Attendance System</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <button 
            onClick={() => navigate("/dashboard")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === "/dashboard" 
                ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>
          
          {user?.role === "admin" && (
            <button 
              onClick={() => navigate("/students")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === "/students" 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              <Users className="w-4 h-4" />
              Students
            </button>
          )}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full gradient-accent flex items-center justify-center text-accent-foreground text-xs font-bold">
              {user?.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-sidebar-accent-foreground truncate">{user?.name}</p>
              <div className="flex items-center gap-1">
                {user?.role === "admin" ? (
                  <Shield className="w-3 h-3 text-sidebar-primary" />
                ) : (
                  <GraduationCap className="w-3 h-3 text-sidebar-primary" />
                )}
                <span className="text-xs text-sidebar-foreground capitalize">{user?.role}</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground hover:text-sidebar-accent-foreground" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex-1 flex flex-col">
        <header className="md:hidden border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex items-center justify-between h-14 px-4">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-primary" />
              <span className="font-semibold text-sm">PAIE-Attend</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

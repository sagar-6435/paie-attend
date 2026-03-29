import { ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { QrCode, LayoutDashboard, LogOut, Shield, GraduationCap, Users, ClipboardList, User, History, Settings2, UserPlus } from "lucide-react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-sidebar-border bg-sidebar h-screen sticky top-0">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1.5 shadow-md border border-primary/10">
              <img src="/favicon.png" alt="PAIE Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-black text-xl tracking-tighter">PAIE-<span className="text-primary">Attend</span></span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <button 
            onClick={() => navigate("/dashboard")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === "/dashboard" 
                ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm" 
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard Home
          </button>

          {user?.role === "admin" && (
            <>
              <button 
                onClick={() => navigate("/students")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === "/students" 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <Users className="w-4 h-4" />
                Student Directory
              </button>

              <button 
                onClick={() => navigate("/attendance-logs")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === "/attendance-logs" 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                Attendance Logs
              </button>

              <button 
                onClick={() => navigate("/lab-management")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === "/lab-management" 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <Settings2 className="w-4 h-4" />
                Lab Management
              </button>

              <button 
                onClick={() => navigate("/manual-attendance")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === "/manual-attendance" 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <UserPlus className="w-4 h-4" />
                Manual Attendance
              </button>
            </>
          )}

          {user?.role === "student" && (
            <button 
              onClick={() => navigate("/my-history")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === "/my-history" 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              <History className="w-4 h-4" />
              My History
            </button>
          )}

          <button 
            onClick={() => navigate("/profile")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === "/profile" 
                ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            }`}
          >
            <User className="w-4 h-4" />
            My Profile
          </button>
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
        <header className="md:hidden border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-20">
          <div className="flex items-center justify-between h-14 px-4">
            <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center p-1 shadow-sm border border-primary/10">
              <img src="/favicon.png" alt="PAIE Logo" className="w-full h-full object-contain" />
            </div>
              <span className="font-black text-sm tracking-tight">PAIE-<span className="text-primary">Attend</span></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full gradient-accent flex items-center justify-center text-[10px] font-bold text-accent-foreground">
                {user?.name.charAt(0)}
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-6 left-6 right-6 h-16 bg-card/90 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl z-30 flex items-center justify-around px-2">
          <button 
            onClick={() => navigate("/dashboard")}
            className={`flex flex-col items-center justify-center gap-1 flex-1 transition-all ${
              location.pathname === "/dashboard" ? "text-primary scale-110" : "text-muted-foreground"
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Home</span>
          </button>
          
          {user?.role === "admin" && (
            <>
              <button 
                onClick={() => navigate("/students")}
                className={`flex flex-col items-center justify-center gap-1 flex-1 transition-all ${
                  location.pathname === "/students" ? "text-primary scale-110" : "text-muted-foreground"
                }`}
              >
                <Users className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">Students</span>
              </button>
              <button 
                onClick={() => navigate("/manual-attendance")}
                className={`flex flex-col items-center justify-center gap-1 flex-1 transition-all ${
                  location.pathname === "/manual-attendance" ? "text-primary scale-110" : "text-muted-foreground"
                }`}
              >
                <UserPlus className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">Manual</span>
              </button>
            </>
          )}

          {user?.role === "student" && (
            <button 
              onClick={() => navigate("/my-history")}
              className={`flex flex-col items-center justify-center gap-1 flex-1 transition-all ${
                location.pathname === "/my-history" ? "text-primary scale-110" : "text-muted-foreground"
              }`}
            >
              <History className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-tighter">History</span>
            </button>
          )}

          <button 
            onClick={() => navigate("/profile")}
            className={`flex flex-col items-center justify-center gap-1 flex-1 transition-all ${
              location.pathname === "/profile" ? "text-primary scale-110" : "text-muted-foreground"
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Profile</span>
          </button>
        </nav>
      </div>
    </div>
  );
}

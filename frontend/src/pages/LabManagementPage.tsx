import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { labStatusApi } from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Settings2, 
  CalendarDays, 
  Clock, 
  AlertTriangle,
  Save,
  Rocket,
  Sun,
  Coffee,
  ShieldCheck
} from "lucide-react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Navigate } from "react-router-dom";

export default function LabManagementPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<'active' | 'holiday'>('active');
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await labStatusApi.get();
        if (response.data) {
          setStatus(response.data.status as any);
          setMessage(response.data.message || "");
        }
      } catch (error) {
        toast.error("Failed to load lab status");
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && user?.role === "admin") {
      fetchStatus();
    }
  }, [isAuthenticated, user]);

  if (authLoading) return null;
  if (!isAuthenticated || user?.role !== "admin") return <Navigate to="/" replace />;

  const handleUpdate = async () => {
    setIsSaving(true);
    try {
      const response = await labStatusApi.update(status, message);
      if (!response.error) {
        toast.success(`Lab status updated to ${status.toUpperCase()}`);
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <Settings2 className="w-8 h-8 text-primary" />
            Lab Management
          </h1>
          <p className="text-muted-foreground mt-2">Configure laboratory availability and calendar status.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className={`glass-card border-2 transition-all duration-500 overflow-hidden ${status === 'active' ? 'border-primary/20 bg-primary/5 shadow-primary/10' : 'border-warning/20 bg-warning/5 shadow-warning/10'}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className={`w-5 h-5 ${status === 'active' ? 'text-primary' : 'text-warning'}`} />
                  Lab Status
                </CardTitle>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${status === 'active' ? 'bg-primary text-primary-foreground' : 'bg-warning text-warning-foreground'}`}>
                  {status}
                </div>
              </div>
              <CardDescription>Toggle whether the laboratory is operational today.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/50">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold">Active Mode</Label>
                  <p className="text-xs text-muted-foreground">When active, students can scan and log attendance.</p>
                </div>
                <Switch 
                  checked={status === 'active'} 
                  onCheckedChange={(checked) => setStatus(checked ? 'active' : 'holiday')}
                  disabled={isLoading || isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="msg" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status Message / Reason</Label>
                <Input 
                  id="msg"
                  placeholder={status === 'active' ? "e.g. Lab is open for regular session" : "e.g. Closed for Public Holiday"}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="bg-background/50 h-11"
                  disabled={isLoading || isSaving}
                />
              </div>

              <Button 
                onClick={handleUpdate} 
                className={`w-full h-12 rounded-xl font-bold transition-all shadow-lg ${status === 'active' ? 'gradient-primary shadow-primary/20' : 'bg-warning hover:bg-warning/90 text-warning-foreground shadow-warning/20'}`}
                disabled={isLoading || isSaving}
              >
                {isSaving ? "Updating Status..." : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Apply Lab Status
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <div className="p-6 rounded-2xl gradient-primary text-primary-foreground flex items-center gap-4 relative overflow-hidden group shadow-xl">
              <div className="absolute -right-4 -bottom-4 opacity-10 transition-transform group-hover:scale-125 duration-700">
                <ShieldCheck className="w-24 h-24 rotate-12" />
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shadow-inner">
                <Sun className="w-6 h-6" />
              </div>
              <div className="relative z-10">
                <h4 className="font-black text-lg">Lab Health: {status === 'active' ? 'Operational' : 'On Leave'}</h4>
                <p className="text-[10px] uppercase font-bold tracking-widest opacity-80">Last synced at {new Date().toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

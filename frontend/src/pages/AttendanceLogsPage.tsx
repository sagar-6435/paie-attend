import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { attendanceApi } from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, RefreshCw, ClipboardList, TrendingUp, CheckCircle2, LayoutDashboard } from "lucide-react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Navigate } from "react-router-dom";

export default function AttendanceLogsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [dailyAttendance, setDailyAttendance] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const todayDate = new Date().toISOString().split("T")[0];
  const yesterdayDate = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  const fetchDailyLogs = useCallback(async (date: string) => {
    setIsLoading(true);
    try {
      const response = await attendanceApi.getAll(undefined, date);
      if (response.data) {
        setDailyAttendance(response.data as any[]);
      }
    } catch (error) {
      toast.error("Failed to load attendance logs");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      fetchDailyLogs(selectedDate);
    }
  }, [selectedDate, fetchDailyLogs, isAuthenticated, user]);

  if (authLoading) return null;
  if (!isAuthenticated || user?.role !== "admin") return <Navigate to="/" replace />;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Attendance Logs</h1>
            <p className="text-muted-foreground text-sm">Monitor daily student attendance and work submissions.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-muted p-1 rounded-lg text-xs font-medium">
              <button 
                onClick={() => setSelectedDate(todayDate)}
                className={`px-3 py-1.5 rounded-md transition-all ${selectedDate === todayDate ? 'bg-background shadow-sm text-primary font-bold' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Today
              </button>
              <button 
                onClick={() => setSelectedDate(yesterdayDate)}
                className={`px-3 py-1.5 rounded-md transition-all ${selectedDate === yesterdayDate ? 'bg-background shadow-sm text-primary font-bold' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Yesterday
              </button>
            </div>
            <Input 
              type="date" 
              className="h-9 text-xs w-36 glass-card" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{dailyAttendance.length}</p>
                  <p className="text-xs text-muted-foreground">Entries for {selectedDate}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">100%</p>
                  <p className="text-xs text-muted-foreground">Sync Health</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
            <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" />
              Detailed Activity for {selectedDate}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <RefreshCw className="w-10 h-10 animate-spin mb-3 text-primary" />
                  <p className="font-medium">Fetching secure records...</p>
                </div>
              ) : dailyAttendance.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border-2 border-dashed rounded-2xl bg-muted/5">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Calendar className="w-8 h-8 opacity-20" />
                  </div>
                  <p className="text-lg font-medium">No activity found</p>
                  <p className="text-sm">There are no attendance records registered for this date.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {dailyAttendance.map((record, i) => (
                    <motion.div
                      key={record._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-muted/20 border border-border/50 hover:border-primary/40 transition-all hover:bg-muted/40 group shadow-sm hover:shadow-primary/5"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-all transform group-hover:scale-105 shadow-soft">
                          {(record.studentId?.name || record.studentName || "?").charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-base group-hover:text-primary transition-colors">{record.studentId?.name || record.studentName}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="font-mono text-[10px] bg-background px-1.5">{record.studentId?.rollNumber || "N/A"}</Badge>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <RefreshCw className="w-2.5 h-2.5" />
                              Synced at {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 sm:mt-0 max-w-sm p-3 rounded-xl bg-background/50 border border-border/40 text-sm leading-relaxed flex items-start gap-3">
                        <FileText className="w-4 h-4 mt-0.5 text-accent flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-[10px] font-bold text-accent uppercase tracking-wider mb-0.5">Reported Work</p>
                          <p className="text-xs text-muted-foreground italic font-medium">{record.workDone}</p>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

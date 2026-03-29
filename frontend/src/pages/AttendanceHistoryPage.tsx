import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { attendanceApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { 
  History, 
  CheckCircle2, 
  TrendingUp, 
  Clock,
  LayoutDashboard,
  ClipboardList,
  FileText,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function AttendanceHistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Hardcoded total lab sessions for percentage calculation
  const TOTAL_SESSIONS = 32;

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // Fetching specifically using the student route
      const response = await attendanceApi.getStudentRecords(user.id);
      if (response.data) {
        setHistory(response.data as any[]);
      }
    } catch (error) {
      toast.error("Failed to load your lab history.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  if (!user) return null;

  const attendanceCount = history.length;
  const percentage = Math.round((attendanceCount / TOTAL_SESSIONS) * 100);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              <History className="w-8 h-8 text-primary" />
              My Lab History
            </h1>
            <p className="text-muted-foreground mt-2">Comprehensive overview of your laboratory engagements.</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchHistory}
            className="w-fit rounded-xl border-primary/20 hover:bg-primary/5 transition-all"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Records
          </Button>
        </div>

        {/* Analytics Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card md:col-span-2 overflow-hidden border-none shadow-xl">
            <CardHeader className="bg-primary/5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Overall Progress</CardTitle>
                  <CardDescription>Target: {TOTAL_SESSIONS} Laboratory Sessions</CardDescription>
                </div>
                <div className="text-right">
                  <span className="text-4xl font-black text-primary">{percentage}%</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  <span>Completed: {attendanceCount}</span>
                  <span>Goal: {TOTAL_SESSIONS}</span>
                </div>
                <Progress value={percentage} className="h-4 rounded-full" />
                <p className="text-[10px] text-muted-foreground italic text-center">
                  Successfully marked {attendanceCount} attendance records this semester.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-none bg-accent/5 flex flex-col items-center justify-center p-6 text-center">
            <TrendingUp className="w-10 h-10 text-accent mb-3" />
            <h3 className="font-bold text-lg mb-1">Consistency Score</h3>
            <p className="text-xs text-muted-foreground px-4">Keep it up! Your involvement in the labs directly impacts your final scoring.</p>
          </Card>
        </div>

        {/* Submission Timeline */}
        <Card className="glass-card border-none shadow-2xl">
          <CardHeader className="border-b border-border/50 bg-muted/20">
            <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" />
              Submission Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <RefreshCw className="w-10 h-10 animate-spin mb-3 text-primary" />
                <p className="font-medium font-mono text-xs uppercase tracking-widest">Reconstructing Records...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground group">
                <div className="w-20 h-20 rounded-3xl bg-muted/30 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                  <LayoutDashboard className="w-10 h-10 opacity-30" />
                </div>
                <p className="text-sm font-medium">No submission records yet.</p>
                <Link to="/dashboard" className="mt-4 text-xs font-bold text-primary hover:underline">
                  Visit Dashboard to scan QR
                </Link>
              </div>
            ) : (
              <div className="relative space-y-6">
                {/* Vertical Line */}
                <div className="absolute left-[21px] top-4 bottom-4 w-0.5 bg-border/40" />

                <AnimatePresence mode="popLayout">
                  {[...history].reverse().map((record, i) => (
                    <motion.div
                      key={record._id || record.id || i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.05 }}
                      className="relative pl-12"
                    >
                      {/* Index Dot */}
                      <div className="absolute left-0 top-1 w-11 h-11 rounded-full border-4 border-background bg-sidebar-accent flex items-center justify-center z-10 shadow-sm">
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      </div>

                      <div className="p-5 rounded-2xl bg-muted/20 border border-border/50 hover:border-primary/30 hover:bg-muted/30 transition-all group overflow-hidden">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                          <Badge className="w-fit gradient-primary border-none text-[10px] px-3 font-mono font-bold tracking-tight">
                            {record.date}
                          </Badge>
                          <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {new Date(record.timestamp || record.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-background/50 border border-border/30 group-hover:bg-background transition-colors">
                          <div className="flex items-center gap-2 mb-2">
                             <FileText className="w-3.5 h-3.5 text-primary/40" />
                             <Label className="text-[10px] uppercase font-black tracking-widest text-primary opacity-60">
                              Learning Log Record
                            </Label>
                          </div>
                          <p className="text-sm leading-relaxed text-foreground font-medium italic">
                            "{record.workDone}"
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

import { Button } from "@/components/ui/button";

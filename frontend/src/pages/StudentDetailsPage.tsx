import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { usersApi, attendanceApi } from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  FileText, 
  GraduationCap, 
  TrendingUp,
  Mail,
  RefreshCw,
  Trophy
} from "lucide-react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";

const TOTAL_SESSIONS = 34; // Goal for students

export default function StudentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  const [student, setStudent] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      // Fetch student info and attendance in parallel
      const [userRes, attendanceRes] = await Promise.all([
        usersApi.getById(id),
        attendanceApi.getAll(id)
      ]);

      if (userRes.data) setStudent(userRes.data);
      if (attendanceRes.data) setRecords(attendanceRes.data as any[]);
      
    } catch (error) {
      toast.error("Failed to load student overview");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      fetchData();
    }
  }, [fetchData, isAuthenticated, user]);

  if (authLoading) return null;
  if (!isAuthenticated || user?.role !== "admin") return <Navigate to="/" replace />;

  const attendanceCount = records.length;
  const percentage = Math.round((attendanceCount / TOTAL_SESSIONS) * 100);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Navigation */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/students")}
            className="rounded-full hover:bg-sidebar-accent/50"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Student Overview</h1>
            <p className="text-muted-foreground text-xs uppercase tracking-widest font-bold">Analytics & Performance</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <RefreshCw className="w-10 h-10 animate-spin mb-3 text-primary" />
            <p className="font-medium">Synthesizing data profile...</p>
          </div>
        ) : !student ? (
          <Card className="glass-card p-10 text-center text-muted-foreground">
            Student not found or access denied.
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Profile Card */}
            <div className="space-y-6">
              <Card className="glass-card overflow-hidden">
                <div className="h-24 gradient-primary" />
                <CardContent className="pt-0 -mt-12 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-2xl border-4 border-background bg-sidebar-accent shadow-xl flex items-center justify-center text-3xl font-bold text-primary mb-4 transform hover:scale-105 transition-transform duration-300">
                      {student.name.charAt(0)}
                    </div>
                    <h2 className="text-xl font-bold">{student.name}</h2>
                    <Badge variant="outline" className="mt-1 font-mono">{student.rollNumber}</Badge>
                    
                    <div className="mt-6 w-full space-y-3 text-left">
                      <div className="p-3 rounded-xl bg-muted/30 flex items-center gap-3">
                        <Mail className="w-4 h-4 text-primary" />
                        <span className="text-sm truncate">{student.email}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-muted/30 flex items-center gap-3">
                        <GraduationCap className="w-4 h-4 text-primary" />
                        <span className="text-sm capitalize">{student.role} Account</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Progress Summary */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Overall Engagement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center">
                    <div className="relative w-32 h-32 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          className="text-muted/20"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={351.85}
                          strokeDashoffset={351.85 - (351.85 * (Math.min(percentage, 100))) / 100}
                          className="text-primary transition-all duration-1000 ease-out"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-black">{percentage}%</span>
                        <span className="text-[10px] text-muted-foreground font-bold uppercase">Attendance</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 rounded-xl bg-primary/5 border border-primary/10">
                      <p className="text-2xl font-bold text-primary">{attendanceCount}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Labs Done</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-accent/5 border border-accent/10">
                      <p className="text-2xl font-bold text-accent">{TOTAL_SESSIONS - attendanceCount}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Remaining</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Attendance History */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="glass-card h-full">
                <CardHeader className="border-b border-border/50 bg-muted/20 pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" />
                      Lab Work History
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">Timeline of all successfully marked sessions</p>
                  </div>
                  {percentage >= 75 && (
                    <Badge className="bg-success/20 text-success hover:bg-success/30 flex items-center gap-1 border-success/30 px-3 py-1">
                      <Trophy className="w-3 h-3" />
                      Top Performer
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="pt-6">
                  {records.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground opacity-50">
                      <Calendar className="w-12 h-12 mb-4" />
                      <p className="text-sm font-medium">No lab records registered for this student.</p>
                    </div>
                  ) : (
                    <div className="relative space-y-4">
                      {/* Vertical Line */}
                      <div className="absolute left-[21px] top-2 bottom-2 w-0.5 bg-border/40" />
                      
                      {records.map((record, index) => (
                        <motion.div
                          key={record._id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="relative pl-12"
                        >
                          <div className="absolute left-0 top-1 w-11 h-11 rounded-full border-4 border-background bg-muted flex items-center justify-center z-10">
                            <CheckCircle2 className={`w-5 h-5 ${index === 0 ? "text-primary animate-pulse" : "text-muted-foreground/50"}`} />
                          </div>
                          
                          <div className="p-4 rounded-2xl bg-muted/20 border border-border/50 hover:border-primary/30 hover:bg-muted/30 transition-all group shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                              <span className="text-xs font-black text-primary uppercase tracking-tighter">Session {records.length - index}</span>
                              <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-medium">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {record.date}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                            
                            <div className="p-3 rounded-xl bg-background/50 border border-border/30">
                              <p className="text-[10px] font-bold text-accent uppercase tracking-widest mb-1 flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                Student Reflection
                              </p>
                              <p className="text-xs text-foreground font-medium leading-relaxed italic">
                                "{record.workDone}"
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

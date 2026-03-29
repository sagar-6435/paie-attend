import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { attendanceApi } from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, RefreshCw, ClipboardList, TrendingUp, CheckCircle2, LayoutDashboard, Download, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import * as XLSX from 'xlsx';

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

  const handleExport = () => {
    if (dailyAttendance.length === 0) {
      toast.error("No data to export");
      return;
    }

    const exportData = dailyAttendance.map(record => ({
      'Student Name': record.studentId?.name || record.studentName,
      'Roll Number': record.studentId?.rollNumber || "N/A",
      'Date': selectedDate,
      'Sync Time': new Date(record.timestamp).toLocaleTimeString(),
      'Work Reported': record.workDone
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance Logs");
    XLSX.writeFile(wb, `Attendance_Logs_${selectedDate}.xlsx`);
    toast.success("Excel file downloaded successfully");
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      fetchDailyLogs(selectedDate);
      
      // Auto-refresh logs every 5 seconds only for today's date
      if (selectedDate === todayDate) {
        const interval = setInterval(() => fetchDailyLogs(selectedDate), 5000);
        return () => clearInterval(interval);
      }
    }
  }, [selectedDate, todayDate, fetchDailyLogs, isAuthenticated, user]);

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
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 gap-2 glass-card hover:bg-primary hover:text-primary-foreground transition-all"
              onClick={handleExport}
              disabled={dailyAttendance.length === 0}
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export to Excel</span>
            </Button>
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
              Verified Laboratory Activity Overview - {selectedDate}
              {selectedDate === todayDate && (
                <Badge variant="outline" className="ml-2 animate-pulse bg-primary/10 text-primary border-primary/20 text-[10px] py-0 px-2">
                  LIVE
                </Badge>
              )}
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
                <div className="rounded-xl border border-border/50 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead className="w-[200px] font-bold">Student</TableHead>
                        <TableHead className="w-[120px] font-bold">Roll Number</TableHead>
                        <TableHead className="w-[120px] font-bold text-center">Attendance Time</TableHead>
                        <TableHead className="font-bold">Proposed Work / Learning Log</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence mode="popLayout">
                        {dailyAttendance.map((record, i) => (
                          <TableRow key={record._id} className="group hover:bg-muted/40 transition-colors">
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                  {(record.studentId?.name || record.studentName || "?").charAt(0)}
                                </div>
                                <span className="group-hover:text-primary transition-colors">
                                  {record.studentId?.name || record.studentName}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-mono text-[10px] bg-background">
                                {record.studentId?.rollNumber || "N/A"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="text-[11px] text-muted-foreground font-medium">
                                {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-start gap-2 max-w-xl">
                                <FileText className="w-3.5 h-3.5 mt-0.5 text-accent shrink-0" />
                                <p className="text-xs text-muted-foreground italic line-clamp-2 group-hover:line-clamp-none transition-all">
                                  {record.workDone}
                                </p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

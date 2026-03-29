import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { useAttendance } from "@/lib/attendance-context";
import { getAllStudentsStats, TOTAL_SESSIONS } from "@/lib/mock-data";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { QrCode, MapPin, Users, Clock, RefreshCw, CheckCircle2, FileText, Search, Calendar } from "lucide-react";
import { attendanceApi } from "@/lib/api";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { activeSession, generateQR, getTimeRemaining, attendance } = useAttendance();
  const [timeLeft, setTimeLeft] = useState(0);
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [adminLocation, setAdminLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const navigate = useNavigate();
  const stats = getAllStudentsStats();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [dailyAttendance, setDailyAttendance] = useState<any[]>([]);
  const [isLogsLoading, setIsLogsLoading] = useState(false);

  const fetchDailyLogs = useCallback(async (date: string) => {
    setIsLogsLoading(true);
    try {
      const response = await attendanceApi.getAll(undefined, date);
      if (response.data) {
        setDailyAttendance(response.data as any[]);
      }
    } catch (error) {
      toast.error("Failed to load attendance logs");
    } finally {
      setIsLogsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDailyLogs(selectedDate);
  }, [selectedDate, fetchDailyLogs]);

  const todayDate = new Date().toISOString().split("T")[0];
  const yesterdayDate = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  const todayCount = attendance.filter((a) => a.date === todayDate).length;

  const handleGenerateQR = useCallback(async () => {
    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setAdminLocation(loc);
        if (user) {
          const result = await generateQR(loc, user.id);
          setLocationStatus(result.success ? "success" : "error");
        }
      },
      async () => {
        const fallback = { lat: 28.6139, lng: 77.209 };
        setAdminLocation(fallback);
        if (user) {
          const result = await generateQR(fallback, user.id);
          setLocationStatus(result.success ? "success" : "error");
        }
      }
    );
  }, [user, generateQR]);

  useEffect(() => {
    const t = setInterval(() => setTimeLeft(getTimeRemaining()), 1000);
    return () => clearInterval(t);
  }, [getTimeRemaining]);

  useEffect(() => {
    if (autoRefresh && timeLeft === 0 && adminLocation && user) {
      handleGenerateQR();
    }
  }, [autoRefresh, timeLeft, adminLocation, user, handleGenerateQR]);

  const qrData = activeSession
    ? JSON.stringify({ sessionId: activeSession.sessionId, ts: activeSession.createdAt })
    : "";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome, {user?.name}</p>
        </div>
        <Badge variant="outline" className="border-primary text-primary">
          <MapPin className="w-3 h-3 mr-1" />
          {adminLocation ? `${adminLocation.lat.toFixed(4)}, ${adminLocation.lng.toFixed(4)}` : "Location pending"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass-card cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate("/students")}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Users className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.length}</p>
                <p className="text-xs text-muted-foreground">Total Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate("/students")}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{todayCount}</p>
                <p className="text-xs text-muted-foreground">Today's Attendance</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <FileText className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{TOTAL_SESSIONS}</p>
                <p className="text-xs text-muted-foreground">Total Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QR Generator */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-primary" />
            QR Code Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex flex-col items-center gap-4">
              {activeSession && timeLeft > 0 ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-4 bg-background rounded-2xl border-2 border-primary/30 animate-pulse-glow"
                >
                  <QRCodeSVG value={qrData} size={200} level="H" />
                </motion.div>
              ) : (
                <div className="w-[232px] h-[232px] rounded-2xl border-2 border-dashed border-border flex items-center justify-center">
                  <p className="text-muted-foreground text-sm text-center px-4">
                    Generate a QR code to start attendance
                  </p>
                </div>
              )}

              {activeSession && timeLeft > 0 && (
                <div className="text-center">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-warning" />
                    <span className="font-mono font-semibold text-lg">
                      {timeLeft}s
                    </span>
                    <span className="text-muted-foreground">remaining</span>
                  </div>
                  <Progress value={(timeLeft / 30) * 100} className="w-48 mt-2 h-2" />
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleGenerateQR}
                  className="gradient-primary text-primary-foreground"
                  disabled={locationStatus === "loading"}
                >
                  {locationStatus === "loading" ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <QrCode className="w-4 h-4 mr-2" />
                  )}
                  Generate QR
                </Button>
                <Button
                  variant={autoRefresh ? "default" : "outline"}
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  size="sm"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Auto
                </Button>
              </div>
            </div>

            {/* Session Info */}
            {activeSession && (
              <div className="flex-1 space-y-2 text-sm">
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-muted-foreground">Session ID</p>
                  <p className="font-mono text-xs truncate">{activeSession.sessionId}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-muted-foreground">Location</p>
                  <p className="font-mono text-xs">
                    {activeSession.location.lat.toFixed(6)}, {activeSession.location.lng.toFixed(6)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant={timeLeft > 0 ? "default" : "secondary"}>
                    {timeLeft > 0 ? "Active" : "Expired"}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Attendance Activity Logs */}
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Attendance Activity
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex bg-muted p-1 rounded-lg text-xs">
              <button 
                onClick={() => setSelectedDate(todayDate)}
                className={`px-3 py-1 rounded-md transition-all ${selectedDate === todayDate ? 'bg-background shadow-sm font-bold text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Today
              </button>
              <button 
                onClick={() => setSelectedDate(yesterdayDate)}
                className={`px-3 py-1 rounded-md transition-all ${selectedDate === yesterdayDate ? 'bg-background shadow-sm font-bold text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Yesterday
              </button>
            </div>
            <Input 
              type="date" 
              className="h-8 text-xs w-32" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLogsLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <RefreshCw className="w-8 h-8 animate-spin mb-2 text-primary" />
                <p>Fetching logs...</p>
              </div>
            ) : dailyAttendance.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                <Calendar className="w-10 h-10 mb-2 opacity-20" />
                <p>No attendance records for {selectedDate}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {dailyAttendance.map((record, i) => (
                  <motion.div
                    key={record._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/30 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        {(record.studentId?.name || record.studentName || "?").charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold">{record.studentId?.name || record.studentName}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          {record.studentId?.rollNumber || "N/A"} • {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:mt-0 max-w-sm truncate text-xs text-muted-foreground italic flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {record.workDone}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

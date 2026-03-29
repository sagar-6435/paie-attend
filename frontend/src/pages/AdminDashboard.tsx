import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { useAttendance } from "@/lib/attendance-context";
// Real stats are fetched via API in useEffect
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { QrCode, MapPin, Users, Clock, RefreshCw, CheckCircle2, FileText, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { activeSession, generateQR, getTimeRemaining, attendance } = useAttendance();
  const [timeLeft, setTimeLeft] = useState(0);
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [adminLocation, setAdminLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [labStatus, setLabStatus] = useState<'active' | 'holiday'>('active');
  const [stats, setStats] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  const navigate = useNavigate();
  const todayCount = attendance.filter((a) => a.date === new Date().toISOString().split("T")[0]).length;

  const fetchDashboardData = useCallback(async () => {
    try {
      const { labStatusApi, attendanceApi } = await import("@/lib/api");
      const [labRes, statsRes] = await Promise.all([
        labStatusApi.get(),
        attendanceApi.getStats()
      ]);
      
      if (labRes.data) setLabStatus(labRes.data.status as any);
      if (statsRes.data) setStats(statsRes.data as any[]);
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const handleGenerateQR = useCallback(async () => {
    if (labStatus === 'holiday') {
      toast.error("Lab is currently on HOLIDAY mode. Switch to ACTIVE in Lab Management to generate QR codes.");
      return;
    }
    
    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setAdminLocation(loc);
        if (user) {
          const result = await generateQR(loc, user.id, 60); // Extended to 60 seconds
          setLocationStatus(result.success ? "success" : "error");
        }
      },
      async () => {
        const fallback = { lat: 28.6139, lng: 77.209 };
        setAdminLocation(fallback);
        if (user) {
          const result = await generateQR(fallback, user.id, 60); // Extended to 60 seconds
          setLocationStatus(result.success ? "success" : "error");
        }
      }
    );
  }, [user, generateQR, labStatus]);

  useEffect(() => {
    const t = setInterval(() => setTimeLeft(getTimeRemaining()), 1000);
    return () => clearInterval(t);
  }, [getTimeRemaining]);

  useEffect(() => {
    if (autoRefresh && timeLeft === 0 && adminLocation && user && labStatus === 'active') {
      handleGenerateQR();
    }
  }, [autoRefresh, timeLeft, adminLocation, user, handleGenerateQR, labStatus]);

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
                <p className="text-2xl font-bold">{stats[0]?.totalLabs || 0}</p>
                <p className="text-xs text-muted-foreground">Total Lab Days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* QR Generator */}
        <Card className="glass-card shadow-2xl relative overflow-hidden">
          <CardHeader className="border-b border-border/10 bg-muted/5 pb-3">
            <CardTitle className="text-xl flex items-center gap-2">
              <QrCode className="w-5 h-5 text-primary" />
              QR Code Generator
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="flex flex-col 2xl:flex-row gap-10 items-center 2xl:items-start">
              <div className="flex flex-col items-center gap-6 shrink-0 w-full 2xl:w-auto">
                <div className="relative">
                  {activeSession && timeLeft > 0 ? (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-6 bg-background rounded-3xl border-2 border-primary/20 shadow-2xl animate-pulse-glow"
                    >
                      <QRCodeSVG value={qrData} size={280} level="H" />
                    </motion.div>
                  ) : (
                    <div className="w-[328px] h-[328px] rounded-3xl border-4 border-dashed border-border/50 flex flex-col items-center justify-center bg-muted/5 transition-all">
                      <QrCode className="w-12 h-12 text-muted-foreground/20 mb-4" />
                      <p className="text-muted-foreground text-[10px] uppercase font-bold text-center px-12 tracking-widest leading-loose">
                        Awaiting session<br/>generation
                      </p>
                    </div>
                  )}
                  {activeSession && timeLeft > 0 && (
                    <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full gradient-primary animate-pulse flex items-center justify-center text-primary-foreground font-black text-xs shadow-lg shadow-primary/40 border-4 border-background">
                      LIVE
                    </div>
                  )}
                </div>
  
                {activeSession && timeLeft > 0 && (
                  <div className="text-center w-full max-w-[328px] space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground text-[10px] uppercase font-black tracking-widest">Time Remaining</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-warning" />
                        <span className="font-mono font-black text-lg text-primary">{timeLeft}s</span>
                      </div>
                    </div>
                    <Progress value={(timeLeft / 60) * 100} className="w-full h-2 rounded-full" />
                  </div>
                )}
  
                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-[328px]">
                  <Button
                    onClick={handleGenerateQR}
                    className={`flex-1 h-14 rounded-2xl text-primary-foreground font-black shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] ${labStatus === 'active' ? 'gradient-primary shadow-primary/20' : 'bg-muted cursor-not-allowed opacity-60'}`}
                    disabled={locationStatus === "loading" || labStatus === 'holiday'}
                  >
                    {locationStatus === "loading" ? (
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    ) : labStatus === 'holiday' ? (
                      <Clock className="w-5 h-5 mr-2" />
                    ) : (
                      <QrCode className="w-5 h-5 mr-2" />
                    )}
                    {labStatus === 'holiday' ? "Disabled" : "Generate QR"}
                  </Button>
                  <Button
                    variant={autoRefresh ? "default" : "outline"}
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    disabled={labStatus === 'holiday'}
                    className="h-14 w-14 rounded-2xl p-0 shrink-0 border-2"
                    title={autoRefresh ? "Auto-refresh: ON" : "Auto-refresh: OFF"}
                  >
                    <RefreshCw className={`w-5 h-5 ${autoRefresh ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
  
              {/* Session Info */}
              {activeSession ? (
                <div className="flex-1 w-full space-y-6 mt-8 2xl:mt-0">
                  <div className="p-5 rounded-2xl bg-muted/40 border border-border/50 shadow-inner">
                    <div className="flex items-center justify-between mb-3 text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                      <span>Server Handshake</span>
                      <RefreshCw className="w-3 h-3 text-primary animate-spin-slow" />
                    </div>
                    <p className="text-[10px] text-muted-foreground font-bold mb-1.5 opacity-60">SESSION ID</p>
                    <p className="font-mono text-xs break-all font-black text-primary p-3 rounded-xl bg-background border border-primary/5 shadow-sm">{activeSession.sessionId}</p>
                  </div>
                  
                  <div className="p-5 rounded-2xl bg-muted/40 border border-border/50 shadow-inner">
                    <p className="text-[10px] text-muted-foreground uppercase font-black mb-3 tracking-widest opacity-60">Real-time Presence</p>
                    <div className="flex items-center gap-3">
                       <Badge className={timeLeft > 0 ? "bg-success text-success-foreground font-bold" : "bg-destructive text-destructive-foreground font-bold"}>
                        {timeLeft > 0 ? "SYSTEM ACTIVE" : "AUTHENTICATION EXPIRED"}
                      </Badge>
                      <span className="text-[10px] font-bold text-muted-foreground italic">Last validated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline"
                    className="w-full h-auto py-4 px-5 rounded-2xl border-2 border-dashed border-primary/20 hover:border-primary/50 hover:bg-primary/5 group transition-all"
                    onClick={() => navigate("/attendance-logs")}
                  >
                    <div className="flex flex-col items-start gap-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary">Attendance Pipeline</span>
                      <span className="text-xs text-muted-foreground font-bold">Monitor incoming validation logs</span>
                    </div>
                    <FileText className="w-5 h-5 ml-auto text-primary transition-transform group-hover:scale-110" />
                  </Button>
                </div>
              ) : (
                 <div className="flex-1 w-full min-h-[300px] flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-muted/50 bg-muted/5">
                   <AlertTriangle className="w-10 h-10 text-muted-foreground/20 mb-4" />
                   <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest text-center">No active authentication session detected.</p>
                 </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Real-time Activity Tracker */}
        <Card className="glass-card shadow-2xl relative overflow-hidden h-full flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/10 bg-muted/5 pb-3">
            <CardTitle className="text-xl flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-accent animate-spin-slow" />
              Live Activity Tracker
            </CardTitle>
            <div className="flex items-center gap-2">
               <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
              </span>
              <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-[10px] font-black tracking-widest py-0 px-2 h-5">REAL-TIME</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-8 flex-1">
            <div className="h-full">
              {attendance.length === 0 ? (
                <div className="h-[300px] flex flex-col items-center justify-center py-20 text-muted-foreground border-2 border-dashed rounded-3xl bg-muted/5">
                  <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 opacity-20" />
                  </div>
                  <p className="text-xs uppercase font-black tracking-widest opacity-40">No entries yet today</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-3 custom-scrollbar">
                  {[...attendance].reverse().slice(0, 10).map((record, i) => (
                    <motion.div 
                      key={record.id || i} 
                      initial={{ opacity: 0, x: 20 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-4 p-4 rounded-3xl bg-muted/20 border border-white/5 hover:border-primary/20 hover:bg-muted/30 transition-all group cursor-pointer shadow-sm"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 flex items-center justify-center text-primary font-black shadow-inner group-hover:scale-110 transition-transform">
                        {record.studentName?.charAt(0) || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-black text-sm text-foreground group-hover:text-primary transition-colors truncate">{record.studentName}</p>
                          <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded-md">
                            {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                           <FileText className="w-3 h-3 text-accent/60" />
                           <p className="text-[11px] text-accent font-bold truncate italic opacity-80 group-hover:opacity-100 transition-opacity">"{record.workDone}"</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

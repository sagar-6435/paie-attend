import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { useAttendance } from "@/lib/attendance-context";
import { getAllStudentsStats, TOTAL_SESSIONS } from "@/lib/mock-data";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { QrCode, MapPin, Users, Clock, RefreshCw, CheckCircle2, FileText } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { activeSession, generateQR, getTimeRemaining, attendance } = useAttendance();
  const [timeLeft, setTimeLeft] = useState(0);
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [adminLocation, setAdminLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const [showStudentList, setShowStudentList] = useState(false);
  const stats = getAllStudentsStats();
  const todayCount = attendance.filter((a) => a.date === new Date().toISOString().split("T")[0]).length;
  const studentListRef = useRef<HTMLDivElement>(null);

  const scrollToStudents = () => {
    setShowStudentList(true);
    setTimeout(() => studentListRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  useEffect(() => {
    const t = setInterval(() => setTimeLeft(getTimeRemaining()), 1000);
    return () => clearInterval(t);
  }, [getTimeRemaining]);

  useEffect(() => {
    if (autoRefresh && timeLeft === 0 && adminLocation && user) {
      generateQR(adminLocation, user.id);
    }
  }, [autoRefresh, timeLeft, adminLocation, user, generateQR]);

  const handleGenerateQR = useCallback(() => {
    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setAdminLocation(loc);
        setLocationStatus("success");
        if (user) generateQR(loc, user.id);
      },
      () => {
        const fallback = { lat: 28.6139, lng: 77.209 };
        setAdminLocation(fallback);
        setLocationStatus("success");
        if (user) generateQR(fallback, user.id);
      }
    );
  }, [user, generateQR]);

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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass-card cursor-pointer hover:border-primary/50 transition-colors" onClick={scrollToStudents}>
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
        <Card className="glass-card cursor-pointer hover:border-primary/50 transition-colors" onClick={scrollToStudents}>
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
        <Card className="glass-card cursor-pointer hover:border-primary/50 transition-colors" onClick={scrollToStudents}>
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

      {/* Student List */}
      <div ref={studentListRef}>
      {showStudentList && (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-accent" />
            Student Attendance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center text-accent-foreground font-semibold text-sm">
                  {s.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium truncate">{s.name}</p>
                    <span className="text-sm font-mono text-muted-foreground">{s.rollNumber}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <Progress value={s.percentage} className="flex-1 h-2" />
                    <span className="text-sm font-semibold w-12 text-right">{s.percentage}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    Last: {s.lastWork}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useAttendance } from "@/lib/attendance-context";
import { getStudentAttendance, getStudentAttendancePercentage, TOTAL_SESSIONS } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Camera, Send, CheckCircle2, XCircle, Calendar, FileText, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

type ScanState = "idle" | "scanning" | "scanned" | "submitting";

export default function StudentDashboard() {
  const { user } = useAuth();
  const { submitAttendance, activeSession, getTimeRemaining } = useAttendance();
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [scannedSession, setScannedSession] = useState<string | null>(null);
  const [workDone, setWorkDone] = useState("");
  const [submitResult, setSubmitResult] = useState<{ success: boolean; error?: string } | null>(null);

  if (!user) return null;
  const myAttendance = getStudentAttendance(user.id);
  const percentage = getStudentAttendancePercentage(user.id);

  const handleScan = () => {
    setScanState("scanning");
    setSubmitResult(null);
    // Simulate scanning the active QR
    setTimeout(() => {
      if (activeSession && getTimeRemaining() > 0) {
        setScannedSession(activeSession.sessionId);
        setScanState("scanned");
        toast.success("QR scanned successfully!");
      } else {
        setScanState("idle");
        toast.error("No active QR code found or QR has expired. Ask admin to generate one.");
      }
    }, 1500);
  };

  const handleSubmit = () => {
    if (!scannedSession || !workDone.trim()) {
      toast.error("Please enter what you worked on today.");
      return;
    }
    setScanState("submitting");
    // Simulate getting student location
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const result = submitAttendance(
          scannedSession,
          user.id,
          user.name,
          { lat: pos.coords.latitude, lng: pos.coords.longitude },
          workDone.trim()
        );
        setSubmitResult(result);
        setScanState("idle");
        setWorkDone("");
        setScannedSession(null);
        if (result.success) toast.success("Attendance marked successfully!");
        else toast.error(result.error || "Failed to mark attendance");
      },
      () => {
        // Fallback: simulate nearby location for demo
        const result = submitAttendance(scannedSession, user.id, user.name, { lat: 28.6139, lng: 77.209 }, workDone.trim());
        setSubmitResult(result);
        setScanState("idle");
        setWorkDone("");
        setScannedSession(null);
        if (result.success) toast.success("Attendance marked!");
        else toast.error(result.error || "Failed");
      }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Student Dashboard</h1>
        <p className="text-muted-foreground">Welcome, {user.name} ({user.rollNumber})</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{percentage}%</p>
                <p className="text-xs text-muted-foreground">Attendance</p>
              </div>
            </div>
            <Progress value={percentage} className="mt-3 h-2" />
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center">
                <Calendar className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{myAttendance.length}/{TOTAL_SESSIONS}</p>
                <p className="text-xs text-muted-foreground">Sessions Attended</p>
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
                <p className="text-2xl font-bold">{myAttendance.length}</p>
                <p className="text-xs text-muted-foreground">Work Submissions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scan QR */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            Mark Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            {scanState === "idle" && !scannedSession && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4 py-6">
                <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-primary/40 flex items-center justify-center relative overflow-hidden">
                  <Camera className="w-12 h-12 text-primary/40" />
                </div>
                <Button onClick={handleScan} className="gradient-primary text-primary-foreground">
                  <Camera className="w-4 h-4 mr-2" />
                  Scan QR Code
                </Button>
                <p className="text-xs text-muted-foreground">Point camera at admin's QR code</p>
              </motion.div>
            )}
            {scanState === "scanning" && (
              <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4 py-6">
                <div className="w-32 h-32 rounded-2xl border-2 border-primary bg-primary/5 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute w-full h-0.5 bg-primary animate-scan-line" />
                  <Camera className="w-12 h-12 text-primary" />
                </div>
                <p className="text-sm text-primary font-medium">Scanning...</p>
              </motion.div>
            )}
            {scanState === "scanned" && scannedSession && (
              <motion.div key="scanned" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">QR Scanned Successfully</span>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">What did you work on today?</label>
                  <Input
                    placeholder="e.g. Built a React component for user dashboard..."
                    value={workDone}
                    onChange={(e) => setWorkDone(e.target.value)}
                    className="h-11"
                  />
                </div>
                <Button onClick={handleSubmit} className="w-full gradient-primary text-primary-foreground">
                  <Send className="w-4 h-4 mr-2" />
                  Submit Attendance
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {submitResult && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${submitResult.success ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
              {submitResult.success ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              <span className="text-sm">{submitResult.success ? "Attendance marked!" : submitResult.error}</span>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* History */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Submission History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {myAttendance.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-6">No attendance records yet.</p>
            ) : (
              [...myAttendance].reverse().map((record, i) => (
                <motion.div key={record.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold mt-0.5">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">{record.date}</Badge>
                    </div>
                    <p className="text-sm mt-1">{record.workDone}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useAttendance } from "@/lib/attendance-context";
import { getStudentAttendance, getStudentAttendancePercentage, TOTAL_SESSIONS } from "@/lib/mock-data";
import { qrSessionApi } from "@/lib/api";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Camera, Send, CheckCircle2, XCircle, Calendar, FileText, TrendingUp, X, BookOpen, GraduationCap, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

type ScanState = "idle" | "scanning" | "scanned" | "submitting";

export default function StudentDashboard() {
  const { user } = useAuth();
  const { submitAttendance, fetchActiveSession } = useAttendance();
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [scannedSession, setScannedSession] = useState<string | null>(null);
  const [workDone, setWorkDone] = useState("");
  const [submitResult, setSubmitResult] = useState<{ success: boolean; error?: string } | null>(null);
  const [manualSessionId, setManualSessionId] = useState("");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const qrReaderRef = useRef<HTMLDivElement>(null);

  if (!user) return null;
  const myAttendance = getStudentAttendance(user.id);
  const percentage = getStudentAttendancePercentage(user.id);

  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;
    let isStarting = false;
    let timer: NodeJS.Timeout;

    const startScanner = async () => {
      // Small delay to ensure DOM is ready and transitions are finished
      if (scanState !== "scanning" || isStarting) return;
      
      // Wait for ref to be available (it might take a frame)
      if (!qrReaderRef.current) {
        timer = setTimeout(startScanner, 100);
        return;
      }

      isStarting = true;

      // 1. Secure Context Check (Check this FIRST as it's the most common cause of missing mediaDevices)
      if (!window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        const msg = "HTTPS REQUIRED: Your browser has disabled the camera because this site is not secure (HTTP). Please access via HTTPS or localhost.";
        setCameraError(msg);
        toast.error(msg);
        setScanState("idle");
        isStarting = false;
        return;
      }

      // 2. Hardware/Browser Support Check
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        const msg = "Media Devices API not found. This usually happens on non-HTTPS origins or very old browsers.";
        setCameraError(msg);
        toast.error(msg);
        setScanState("idle");
        isStarting = false;
        return;
      }

      try {
        // Create instance - always use a fresh ID if possible
        html5QrCode = new Html5Qrcode("qr-reader");
        scannerRef.current = html5QrCode;

        const config = { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0 
        };

        // Try environment camera first, then fall back to any camera
        try {
          await html5QrCode.start(
            { facingMode: "environment" },
            config,
            onScanSuccess,
            onScanFailure
          );
        } catch (envErr) {
          console.warn("Environment camera failed, trying default camera...", envErr);
          await html5QrCode.start(
            { facingMode: "user" }, // Fallback to front or default
            config,
            onScanSuccess,
            onScanFailure
          );
        }
      } catch (err: any) {
        console.error("Scanner start error:", err);
        let message = "Unable to access camera";
        
        if (err.name === "NotAllowedError" || err.toString().includes("NotAllowedError") || err.toString().includes("Permission denied")) {
          message = "Permission Denied: Please allow camera access in your browser settings and refresh.";
        } else if (err.name === "NotFoundError" || err.toString().includes("NotFoundError")) {
          message = "No camera found on this device.";
        } else if (err.name === "NotReadableError" || err.toString().includes("is already in use")) {
          message = "Camera is already in use by another tab or app.";
        }
        
        setCameraError(message);
        toast.error(message);
        setScanState("idle");
      } finally {
        isStarting = false;
      }
    };

    const onScanSuccess = async (decodedText: string) => {
      try {
        const qrData = JSON.parse(decodedText);
        const sessionId = qrData.sessionId;

        const response = await qrSessionApi.getById(sessionId);
        if (response.error) {
          toast.error("Invalid QR code or session expired");
          return;
        }

        if (response.data) {
          await fetchActiveSession(sessionId);
          setScannedSession(sessionId);
          setScanState("scanned");
          
          if (scannerRef.current) {
            await scannerRef.current.stop().catch(() => {});
            scannerRef.current = null;
          }
          toast.success("QR scanned successfully!");
        }
      } catch (error) {
        toast.error("Invalid QR code format.");
      }
    };

    const onScanFailure = (error: any) => {
      // Just log internally, don't spam toasts
      // console.debug("Still looking for QR...", error);
    };

    startScanner();

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        const currentScanner = scannerRef.current;
        if (currentScanner.isScanning) {
          currentScanner.stop().catch(() => {});
        }
      }
    };
  }, [scanState, fetchActiveSession]);

  const handleScan = () => {
    setScanState("scanning");
    setSubmitResult(null);
    setCameraError(null);
  };

  const handleCancelScan = () => {
    if (scannerRef.current) {
      if (scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setScanState("idle");
    setCameraError(null);
  };

  const handleManualSessionSubmit = async () => {
    if (!manualSessionId.trim()) {
      toast.error("Please enter a session ID");
      return;
    }

    try {
      const response = await qrSessionApi.getById(manualSessionId);
      if (response.error) {
        toast.error("Invalid session ID or session expired");
        return;
      }

      if (response.data) {
        await fetchActiveSession(manualSessionId);
        setScannedSession(manualSessionId);
        setScanState("scanned");
        setManualSessionId("");
        toast.success("Session found!");
      }
    } catch (error) {
      toast.error("Failed to find session");
    }
  };

  const handleSubmit = async () => {
    if (!scannedSession || !workDone.trim()) {
      toast.error("Please enter what you worked on today.");
      return;
    }
    setScanState("submitting");
    
    // Get student location
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const result = await submitAttendance(
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
      async () => {
        // Fallback: use default location for demo
        const result = await submitAttendance(
          scannedSession,
          user.id,
          user.name,
          { lat: 28.6139, lng: 77.209 },
          workDone.trim()
        );
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
              <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4">
                <div ref={qrReaderRef} id="qr-reader" className="w-full rounded-2xl overflow-hidden border-2 border-primary" style={{ minHeight: "300px" }} />
                {cameraError && (
                  <div className="w-full p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    <p className="font-medium mb-2">Camera access denied or unavailable</p>
                    <p className="text-xs mb-3">Enter the session ID manually instead:</p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter session ID"
                        value={manualSessionId}
                        onChange={(e) => setManualSessionId(e.target.value)}
                        className="h-9 text-sm"
                      />
                      <Button onClick={handleManualSessionSubmit} size="sm" className="gradient-primary text-primary-foreground">
                        Submit
                      </Button>
                    </div>
                  </div>
                )}
                <Button onClick={handleCancelScan} variant="outline" className="w-full">
                  <X className="w-4 h-4 mr-2" />
                  Cancel Scan
                </Button>
              </motion.div>
            )}
            {(scanState === "scanned" || scanState === "submitting") && scannedSession && (
              <motion.div key="scanned" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                    <CheckCircle2 className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-bold text-lg text-primary leading-none mb-1">Session Active</p>
                    <p className="text-xs text-muted-foreground font-mono truncate max-w-[200px]">{scannedSession}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold flex items-center gap-2 text-foreground/80">
                    <BookOpen className="w-4 h-4 text-primary" />
                    What have you learnt today?
                  </label>
                  <textarea
                    placeholder="Describe your learning summary, key takeaways, or achievements..."
                    className="w-full min-h-[140px] p-4 rounded-2xl bg-muted/40 border-2 border-transparent focus:border-primary/30 focus:bg-background transition-all outline-none text-sm leading-relaxed"
                    value={workDone}
                    onChange={(e) => setWorkDone(e.target.value)}
                  />
                  <p className="text-[10px] text-muted-foreground italic px-1 text-center">
                    Successfully scanned. You can submit this after you finish writing.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={() => { setScanState("idle"); setScannedSession(null); }} 
                    variant="ghost" 
                    className="flex-1 h-12 rounded-xl"
                  >
                    Cancel
                  </Button>
                    <Button 
                      onClick={handleSubmit} 
                      className="flex-[2] h-12 rounded-xl gradient-primary text-primary-foreground font-bold shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                      disabled={!workDone.trim() || scanState === "submitting"}
                    >
                      {scanState === "submitting" ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Submit Attendance"}
                    </Button>
                </div>
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

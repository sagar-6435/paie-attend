import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { QRSession, AttendanceRecord, MOCK_ATTENDANCE, haversineDistance } from "./mock-data";
import { v4 } from "./uuid";

interface AttendanceContextType {
  activeSession: QRSession | null;
  attendance: AttendanceRecord[];
  generateQR: (location: { lat: number; lng: number }, adminId: string) => QRSession;
  submitAttendance: (
    sessionId: string,
    studentId: string,
    studentName: string,
    studentLocation: { lat: number; lng: number },
    workDone: string
  ) => { success: boolean; error?: string };
  getTimeRemaining: () => number;
}

const AttendanceContext = createContext<AttendanceContextType | null>(null);

export function AttendanceProvider({ children }: { children: ReactNode }) {
  const [activeSession, setActiveSession] = useState<QRSession | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(MOCK_ATTENDANCE);

  const generateQR = useCallback((location: { lat: number; lng: number }, adminId: string) => {
    const session: QRSession = {
      sessionId: v4(),
      createdBy: adminId,
      createdAt: Date.now(),
      expiresAt: Date.now() + 30000,
      location,
      used: false,
    };
    setActiveSession(session);
    return session;
  }, []);

  const getTimeRemaining = useCallback(() => {
    if (!activeSession) return 0;
    return Math.max(0, Math.floor((activeSession.expiresAt - Date.now()) / 1000));
  }, [activeSession]);

  const submitAttendance = useCallback(
    (
      sessionId: string,
      studentId: string,
      studentName: string,
      studentLocation: { lat: number; lng: number },
      workDone: string
    ) => {
      if (!activeSession || activeSession.sessionId !== sessionId) {
        return { success: false, error: "Invalid or unknown QR session" };
      }
      if (Date.now() > activeSession.expiresAt) {
        return { success: false, error: "QR code has expired" };
      }
      const duplicate = attendance.find((a) => a.sessionId === sessionId && a.studentId === studentId);
      if (duplicate) {
        return { success: false, error: "Attendance already marked for this session" };
      }
      const dist = haversineDistance(
        activeSession.location.lat,
        activeSession.location.lng,
        studentLocation.lat,
        studentLocation.lng
      );
      if (dist > 50) {
        return { success: false, error: `Too far from admin (${Math.round(dist)}m away). Must be within 50m.` };
      }
      const record: AttendanceRecord = {
        id: v4(),
        studentId,
        studentName,
        sessionId,
        date: new Date().toISOString().split("T")[0],
        workDone,
        location: studentLocation,
        timestamp: Date.now(),
      };
      setAttendance((prev) => [...prev, record]);
      return { success: true };
    },
    [activeSession, attendance]
  );

  return (
    <AttendanceContext.Provider value={{ activeSession, attendance, generateQR, submitAttendance, getTimeRemaining }}>
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  const ctx = useContext(AttendanceContext);
  if (!ctx) throw new Error("useAttendance must be used within AttendanceProvider");
  return ctx;
}

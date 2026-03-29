import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { QRSession, AttendanceRecord, MOCK_ATTENDANCE } from "./mock-data";
import { qrSessionApi, attendanceApi } from "./api";

interface AttendanceContextType {
  activeSession: QRSession | null;
  attendance: AttendanceRecord[];
  generateQR: (location: { lat: number; lng: number }, adminId: string, expiresIn?: number) => Promise<{ success: boolean; error?: string }>;
  submitAttendance: (
    sessionId: string,
    studentId: string,
    studentName: string,
    studentLocation: { lat: number; lng: number },
    workDone: string
  ) => Promise<{ success: boolean; error?: string }>;
  getTimeRemaining: () => number;
  fetchActiveSession: (sessionId: string) => Promise<void>;
}

const AttendanceContext = createContext<AttendanceContextType | null>(null);

export function AttendanceProvider({ children }: { children: ReactNode }) {
  const [activeSession, setActiveSession] = useState<QRSession | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(MOCK_ATTENDANCE);

  const generateQR = useCallback(async (location: { lat: number; lng: number }, adminId: string, expiresIn: number = 60) => {
    try {
      const response = await qrSessionApi.create(location, expiresIn);
      if (response.error) {
        return { success: false, error: response.error };
      }
      if (response.data) {
        const session = response.data as any;
        setActiveSession({
          sessionId: session.sessionId,
          createdBy: session.createdBy,
          createdAt: new Date(session.createdAt).getTime(),
          expiresAt: new Date(session.expiresAt).getTime(),
          location: session.location,
          used: session.used || false,
        });
        return { success: true };
      }
      return { success: false, error: "Failed to create QR session" };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  }, []);

  const fetchActiveSession = useCallback(async (sessionId: string) => {
    try {
      const response = await qrSessionApi.getById(sessionId);
      if (response.error) {
        setActiveSession(null);
        return;
      }
      if (response.data) {
        const session = response.data as any;
        setActiveSession({
          sessionId: session.sessionId,
          createdBy: session.createdBy,
          createdAt: new Date(session.createdAt).getTime(),
          expiresAt: new Date(session.expiresAt).getTime(),
          location: session.location,
          used: session.used || false,
        });
      }
    } catch (error) {
      setActiveSession(null);
    }
  }, []);

  const getTimeRemaining = useCallback(() => {
    if (!activeSession) return 0;
    return Math.max(0, Math.floor((activeSession.expiresAt - Date.now()) / 1000));
  }, [activeSession]);

  const submitAttendance = useCallback(
    async (
      sessionId: string,
      studentId: string,
      studentName: string,
      studentLocation: { lat: number; lng: number },
      workDone: string
    ) => {
      try {
        const response = await attendanceApi.record(sessionId, workDone, studentLocation);
        if (response.error) {
          return { success: false, error: response.error };
        }
        if (response.data) {
          const record = response.data as any;
          setAttendance((prev) => [...prev, {
            id: record._id,
            studentId: record.studentId,
            studentName: record.studentName,
            sessionId: record.sessionId,
            date: record.date,
            workDone: record.workDone,
            location: record.location,
            timestamp: new Date(record.timestamp).getTime(),
          }]);
          return { success: true };
        }
        return { success: false, error: "Failed to record attendance" };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
      }
    },
    []
  );

  return (
    <AttendanceContext.Provider value={{ activeSession, attendance, generateQR, submitAttendance, getTimeRemaining, fetchActiveSession }}>
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  const ctx = useContext(AttendanceContext);
  if (!ctx) throw new Error("useAttendance must be used within AttendanceProvider");
  return ctx;
}

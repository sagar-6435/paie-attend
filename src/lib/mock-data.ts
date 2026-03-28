export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "student" | "guest";
  rollNumber?: string;
}

export interface QRSession {
  sessionId: string;
  createdBy: string;
  createdAt: number;
  expiresAt: number;
  location: { lat: number; lng: number };
  used: boolean;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  sessionId: string;
  date: string;
  workDone: string;
  location: { lat: number; lng: number };
  timestamp: number;
}

export const MOCK_USERS: User[] = [
  { id: "admin-1", name: "Prof. Sharma", email: "admin@paie.club", role: "admin" },
  { id: "stu-1", name: "Aarav Patel", email: "aarav@student.com", role: "student", rollNumber: "CS2024001" },
  { id: "stu-2", name: "Priya Singh", email: "priya@student.com", role: "student", rollNumber: "CS2024002" },
  { id: "stu-3", name: "Rohan Kumar", email: "rohan@student.com", role: "student", rollNumber: "CS2024003" },
  { id: "stu-4", name: "Ananya Gupta", email: "ananya@student.com", role: "student", rollNumber: "CS2024004" },
  { id: "stu-5", name: "Vikram Reddy", email: "vikram@student.com", role: "student", rollNumber: "CS2024005" },
];

const today = new Date().toISOString().split("T")[0];
const days = Array.from({ length: 10 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (9 - i));
  return d.toISOString().split("T")[0];
});

export const MOCK_ATTENDANCE: AttendanceRecord[] = [
  { id: "a1", studentId: "stu-1", studentName: "Aarav Patel", sessionId: "s1", date: days[0], workDone: "Completed React hooks tutorial", location: { lat: 28.6139, lng: 77.209 }, timestamp: Date.now() - 86400000 * 9 },
  { id: "a2", studentId: "stu-2", studentName: "Priya Singh", sessionId: "s1", date: days[0], workDone: "Built a todo app component", location: { lat: 28.6140, lng: 77.2091 }, timestamp: Date.now() - 86400000 * 9 },
  { id: "a3", studentId: "stu-1", studentName: "Aarav Patel", sessionId: "s2", date: days[1], workDone: "Studied TypeScript generics", location: { lat: 28.6139, lng: 77.209 }, timestamp: Date.now() - 86400000 * 8 },
  { id: "a4", studentId: "stu-3", studentName: "Rohan Kumar", sessionId: "s2", date: days[1], workDone: "API integration practice", location: { lat: 28.6141, lng: 77.2092 }, timestamp: Date.now() - 86400000 * 8 },
  { id: "a5", studentId: "stu-2", studentName: "Priya Singh", sessionId: "s3", date: days[2], workDone: "Designed login page UI", location: { lat: 28.6140, lng: 77.2091 }, timestamp: Date.now() - 86400000 * 7 },
  { id: "a6", studentId: "stu-4", studentName: "Ananya Gupta", sessionId: "s3", date: days[2], workDone: "Implemented dark mode toggle", location: { lat: 28.6138, lng: 77.2089 }, timestamp: Date.now() - 86400000 * 7 },
  { id: "a7", studentId: "stu-1", studentName: "Aarav Patel", sessionId: "s4", date: days[3], workDone: "Redux state management", location: { lat: 28.6139, lng: 77.209 }, timestamp: Date.now() - 86400000 * 6 },
  { id: "a8", studentId: "stu-5", studentName: "Vikram Reddy", sessionId: "s4", date: days[3], workDone: "Set up CI/CD pipeline", location: { lat: 28.6142, lng: 77.2093 }, timestamp: Date.now() - 86400000 * 6 },
  { id: "a9", studentId: "stu-2", studentName: "Priya Singh", sessionId: "s5", date: days[5], workDone: "Unit testing with Vitest", location: { lat: 28.6140, lng: 77.2091 }, timestamp: Date.now() - 86400000 * 4 },
  { id: "a10", studentId: "stu-3", studentName: "Rohan Kumar", sessionId: "s5", date: days[5], workDone: "Database schema design", location: { lat: 28.6141, lng: 77.2092 }, timestamp: Date.now() - 86400000 * 4 },
  { id: "a11", studentId: "stu-1", studentName: "Aarav Patel", sessionId: "s6", date: days[7], workDone: "WebSocket real-time chat", location: { lat: 28.6139, lng: 77.209 }, timestamp: Date.now() - 86400000 * 2 },
  { id: "a12", studentId: "stu-4", studentName: "Ananya Gupta", sessionId: "s6", date: days[7], workDone: "Responsive navbar component", location: { lat: 28.6138, lng: 77.2089 }, timestamp: Date.now() - 86400000 * 2 },
  { id: "a13", studentId: "stu-5", studentName: "Vikram Reddy", sessionId: "s6", date: days[7], workDone: "Docker containerization", location: { lat: 28.6142, lng: 77.2093 }, timestamp: Date.now() - 86400000 * 2 },
];

export const TOTAL_SESSIONS = 10;

export function getStudentAttendance(studentId: string) {
  return MOCK_ATTENDANCE.filter((a) => a.studentId === studentId);
}

export function getStudentAttendancePercentage(studentId: string) {
  const records = getStudentAttendance(studentId);
  return Math.round((records.length / TOTAL_SESSIONS) * 100);
}

export function getAllStudentsStats() {
  const students = MOCK_USERS.filter((u) => u.role === "student");
  return students.map((s) => ({
    ...s,
    attended: getStudentAttendance(s.id).length,
    percentage: getStudentAttendancePercentage(s.id),
    lastWork: getStudentAttendance(s.id).sort((a, b) => b.timestamp - a.timestamp)[0]?.workDone || "N/A",
  }));
}

export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

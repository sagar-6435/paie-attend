import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { attendanceApi, usersApi } from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  UserPlus, 
  Search, 
  Calendar, 
  CheckCircle2, 
  Loader2, 
  BookOpen, 
  ChevronRight,
  History
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Navigate } from "react-router-dom";

interface User {
  _id: string;
  name: string;
  rollNumber: string;
  email: string;
}

export default function ManualAttendancePage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [students, setStudents] = useState<User[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [workDone, setWorkDone] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await usersApi.getStudents();
        if (response.data) {
          setStudents(response.data as User[]);
        }
      } catch (error) {
        toast.error("Failed to load students");
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && user?.role === "admin") {
      fetchStudents();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredStudents([]);
    } else {
      const filtered = students.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5);
      setFilteredStudents(filtered);
    }
  }, [searchTerm, students]);

  if (authLoading) return null;
  if (!isAuthenticated || user?.role !== "admin") return <Navigate to="/" replace />;

  const handleSubmit = async () => {
    if (!selectedStudent || !date || !workDone.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await attendanceApi.manualRecord(selectedStudent._id, date, workDone);
      if (!response.error) {
        toast.success(`Attendance marked for ${selectedStudent.name}`);
        setWorkDone("");
        setSelectedStudent(null);
        setSearchTerm("");
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      toast.error("Failed to mark attendance");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <UserPlus className="w-8 h-8 text-primary" />
            Manual Attendance
          </h1>
          <p className="text-muted-foreground mt-2">Manually record laboratory attendance for a specific student.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="glass-card border-none shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Search className="w-5 h-5 text-primary" />
                Select Student
              </CardTitle>
              <CardDescription>Search by name or roll number</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Type to search..." 
                  className="pl-10 h-12 bg-background/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <AnimatePresence>
                  {filteredStudents.map(s => (
                    <motion.button
                      key={s._id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => { setSelectedStudent(s); setSearchTerm(""); }}
                      className={`w-full p-4 rounded-xl border flex items-center justify-between group transition-all ${
                        selectedStudent?._id === s._id 
                          ? "bg-primary/10 border-primary shadow-inner" 
                          : "bg-muted/30 border-transparent hover:bg-muted/50 hover:border-border"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                           selectedStudent?._id === s._id ? "bg-primary text-primary-foreground" : "bg-primary/20 text-primary"
                        }`}>
                          {s.name.charAt(0)}
                        </div>
                        <div className="text-left">
                          <p className={`font-bold text-sm ${selectedStudent?._id === s._id ? "text-primary" : ""}`}>{s.name}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{s.rollNumber || "GUEST-USER"}</p>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${selectedStudent?._id === s._id ? "text-primary" : "text-muted-foreground/30"}`} />
                    </motion.button>
                  ))}
                </AnimatePresence>
                
                {searchTerm && filteredStudents.length === 0 && !isLoading && (
                  <p className="text-xs text-center text-muted-foreground py-4 italic">No matching students found.</p>
                )}
                
                {!selectedStudent && !searchTerm && (
                  <div className="text-center py-10 opacity-30 select-none pointer-events-none">
                    <UserPlus className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-xs font-bold uppercase tracking-widest">Awaiting Selection</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className={`glass-card border-none transition-all duration-500 overflow-hidden ${selectedStudent ? 'opacity-100 scale-100' : 'opacity-50 scale-95 pointer-events-none'}`}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-primary">
                  <CheckCircle2 className="w-5 h-5" />
                  Entry Details
                </CardTitle>
                <CardDescription>
                  {selectedStudent ? `Marking for ${selectedStudent.name}` : "Select a student first"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">Date of Lab</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      type="date" 
                      className="pl-10 h-11 bg-background/50"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">Learning Summary / Work Done</Label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <textarea
                      placeholder="e.g. Completed experiments 5 & 6 on Network Topology..."
                      className="w-full min-h-[120px] pl-10 pr-4 py-3 rounded-xl bg-background/50 border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all outline-none text-sm resize-none"
                      value={workDone}
                      onChange={(e) => setWorkDone(e.target.value)}
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleSubmit} 
                  className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-black shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  disabled={isSubmitting || !selectedStudent}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Confirm & Mark Attendance"
                  )}
                </Button>
              </CardContent>
            </Card>

            <div className="p-6 rounded-2xl bg-muted/30 border border-dashed border-border/50 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center shadow-sm">
                <History className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Administrative Audit</h4>
                <p className="text-xs text-muted-foreground px-4">
                  Manual entries are logged with an 'Administrative Override' flag for auditing purposes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

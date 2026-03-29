import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { usersApi, attendanceApi } from "@/lib/api";
import { getAllStudentsStats, TOTAL_SESSIONS } from "@/lib/mock-data";
import { useAttendance } from "@/lib/attendance-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Search, Download, FileText, CheckCircle2, TrendingUp, Loader2, UserPlus, Users as UsersIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Navigate } from "react-router-dom";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function StudentsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { attendance } = useAttendance();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [studentsData, setStudentsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form state
  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    password: "",
    rollNumber: ""
  });

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const response = await attendanceApi.getStats();
      if (response.data) {
        setStudentsData(response.data as any[]);
      }
    } catch (error) {
      toast.error("Failed to load students");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      fetchStats();
    }
  }, [isAuthenticated, user]);

  if (authLoading) return null;
  if (!isAuthenticated || user?.role !== "admin") return <Navigate to="/" replace />;

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingStudent(true);
    
    try {
      const response = await usersApi.create(newStudent);

      if (!response.error) {
        toast.success("Student added successfully!");
        setIsDialogOpen(false);
        setNewStudent({ name: "", email: "", password: "", rollNumber: "" });
        fetchStats(); // Refresh the list
      } else {
        toast.error(response.error || "Failed to add student");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setIsAddingStudent(false);
    }
  };

  const todayCount = attendance.filter((a) => a.date === new Date().toISOString().split("T")[0]).length;

  const filteredStats = studentsData.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.rollNumber && s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Students Directory</h1>
          <div className="flex items-center gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-primary text-primary-foreground">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Student
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card border-primary/20 sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-primary" />
                    Add New Student
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddStudent} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      placeholder="e.g. Aarav Patel" 
                      required 
                      value={newStudent.name}
                      onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="roll">Roll Number</Label>
                    <Input 
                      id="roll" 
                      placeholder="e.g. CS2024001" 
                      required 
                      value={newStudent.rollNumber}
                      onChange={(e) => setNewStudent({...newStudent, rollNumber: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="aarav@student.com" 
                      required 
                      value={newStudent.email}
                      onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Initial Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      required 
                      value={newStudent.password}
                      onChange={(e) => setNewStudent({...newStudent, password: e.target.value})}
                    />
                  </div>
                  <DialogFooter className="pt-4">
                    <Button 
                      type="submit" 
                      className="w-full gradient-primary" 
                      disabled={isAddingStudent}
                    >
                      {isAddingStudent ? "Adding..." : "Confirm & Add Student"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Mini Stats for context */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <UsersIcon className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{studentsData.length}</p>
                  <p className="text-xs text-muted-foreground">Total Enrolled</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{todayCount}</p>
                  <p className="text-xs text-muted-foreground">Present Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{TOTAL_SESSIONS}</p>
                  <p className="text-xs text-muted-foreground">Avg. Attendance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or roll number..." 
              className="pl-9 h-11"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Card className="glass-card border-none overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
              <CardTitle className="text-lg">Student Attendance Progress</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin mb-2 text-primary" />
                  <p>Loading student data...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                  {filteredStats.map((s, i) => (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/5 group"
                    >
                      <div className="w-12 h-12 rounded-2xl flex-shrink-0 gradient-accent flex items-center justify-center text-accent-foreground font-bold shadow-soft transition-transform group-hover:scale-110">
                        {s.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold truncate group-hover:text-primary transition-colors">{s.name}</p>
                          <Badge variant="outline" className="font-mono text-[10px] bg-muted/50">{s.rollNumber || 'N/A'}</Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex-1">
                            <Progress value={s.percentage} className="h-2" />
                          </div>
                          <span className={`text-xs font-bold w-12 text-right ${s.percentage >= 75 ? 'text-primary' : 'text-warning'}`}>
                            {s.percentage}%
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground italic truncate">
                          <FileText className="w-3 h-3" />
                          <span>Last Work: {s.lastWork}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {!isLoading && filteredStats.length === 0 && (
                    <div className="col-span-full py-12 text-center text-muted-foreground">
                      No results found for "{searchTerm}"
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

import { useState, useEffect } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { useAuth, User as UserType } from "@/lib/auth-context";
import { usersApi } from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Lock, 
  Hash, 
  Save, 
  ShieldCheck, 
  RefreshCw,
  Eye,
  EyeOff,
  GraduationCap,
  Phone,
  ArrowLeft,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ManageStudentProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [student, setStudent] = useState<UserType | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    rollNumber: "",
    email: "",
    phoneNumber: "",
    password: "",
  });

  useEffect(() => {
    const fetchStudent = async () => {
      if (!id) return;
      try {
        const response = await usersApi.getById(id);
        if (response.data) {
          const s = response.data as any;
          setStudent(s);
          setFormData({
            name: s.name,
            rollNumber: s.rollNumber || "",
            email: s.email,
            phoneNumber: s.phoneNumber || "",
            password: "",
          });
        }
      } catch (error) {
        toast.error("Failed to load student profile");
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && user?.role === "admin") {
      fetchStudent();
    }
  }, [id, isAuthenticated, user]);

  if (authLoading) return null;
  if (!isAuthenticated || user?.role !== "admin") return <Navigate to="/" replace />;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setIsSaving(true);
    try {
      const updatePayload: any = {
        name: formData.name,
        rollNumber: formData.rollNumber,
        phoneNumber: formData.phoneNumber,
        email: formData.email, // Admin can change email too
      };
      
      if (formData.password) {
        updatePayload.password = formData.password;
      }

      const response = await usersApi.update(id, updatePayload);
      
      if (!response.error) {
        toast.success("Student profile updated successfully!");
        setFormData(prev => ({ ...prev, password: "" }));
        setStudent(response.data);
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!id) return;
    try {
      const response = await usersApi.delete(id);
      if (!response.error) {
        toast.success("Student deleted successfully");
        navigate("/students");
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      toast.error("Failed to delete student");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(`/students/${id}`)}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              Manage Student Profile
            </h1>
            <p className="text-muted-foreground mt-2">Administrative control over student records and security.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <RefreshCw className="w-10 h-10 animate-spin mb-3 text-primary" />
            <p className="font-medium">Loading profile data...</p>
          </div>
        ) : !student ? (
          <Card className="glass-card p-10 text-center text-muted-foreground">
            Student record not found.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Side - Student Snapshot */}
            <div className="md:col-span-1 space-y-6">
              <Card className="glass-card overflow-hidden">
                <div className="h-32 gradient-primary opacity-20" />
                <CardContent className="pt-0 -mt-16 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-3xl border-4 border-background bg-sidebar-accent shadow-xl flex items-center justify-center text-4xl font-black text-primary mb-4">
                      {student.name.charAt(0)}
                    </div>
                    <h2 className="text-xl font-bold">{student.name}</h2>
                    <Badge variant="outline" className="mt-1 font-mono">{student.rollNumber || 'NO ROLL'}</Badge>
                    
                    <div className="mt-8 pt-8 border-t border-border/50 w-full">
                       <div className="space-y-4">
                          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
                            <span>Last Active</span>
                            <span className="text-primary">Live Now</span>
                          </div>
                          <div className="text-left space-y-2">
                             <div className="p-3 rounded-xl bg-muted/30 flex items-center gap-3">
                                <Mail className="w-4 h-4 text-primary" />
                                <span className="text-xs truncate">{student.email}</span>
                             </div>
                             {student.phoneNumber && (
                               <div className="p-3 rounded-xl bg-muted/30 flex items-center gap-3">
                                  <Phone className="w-4 h-4 text-primary" />
                                  <span className="text-xs">{student.phoneNumber}</span>
                               </div>
                             )}
                          </div>
                       </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-destructive/5 pt-6 flex flex-col gap-3 border-t border-destructive/10">
                   <div className="flex items-center gap-2 text-destructive text-[10px] font-black uppercase tracking-widest px-1">
                      <AlertTriangle className="w-3 h-3" />
                      Danger Zone
                   </div>
                   <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full h-11 rounded-xl font-bold flex items-center gap-2">
                          <Trash2 className="w-4 h-4" />
                          Terminate Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="glass-card border-destructive/20">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the student account for <strong>{student.name}</strong> and remove all associated attendance records. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleDeleteStudent}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
                          >
                            Delete Student
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                   </AlertDialog>
                </CardFooter>
              </Card>
            </div>

            {/* Right Side - Edit Form */}
            <div className="md:col-span-2">
              <Card className="glass-card border-none shadow-2xl overflow-hidden">
                <CardHeader className="border-b border-border/50 bg-muted/20">
                  <CardTitle className="text-lg">Edit Student Details</CardTitle>
                  <CardDescription>Modify student identity and security credentials</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Identity Information</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-xs font-bold flex items-center gap-1.5 ml-1">
                            <User className="w-3 h-3 text-primary" /> Full Name
                          </Label>
                          <Input 
                            id="name" 
                            value={formData.name}
                            onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                            className="h-11 rounded-xl bg-muted/40 font-medium"
                            placeholder="Student's name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="roll" className="text-xs font-bold flex items-center gap-1.5 ml-1">
                            <Hash className="w-3 h-3 text-primary" /> Roll Number
                          </Label>
                          <Input 
                            id="roll"
                            value={formData.rollNumber}
                            onChange={e => setFormData(f => ({ ...f, rollNumber: e.target.value }))}
                            className="h-11 rounded-xl bg-muted/40 font-mono"
                            placeholder="e.g. CS2024001"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-xs font-bold flex items-center gap-1.5 ml-1">
                            <Mail className="w-3 h-3 text-primary" /> Email Address
                          </Label>
                          <Input 
                            id="email"
                            value={formData.email}
                            onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                            className="h-11 rounded-xl bg-muted/40 font-medium"
                            placeholder="student@example.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-xs font-bold flex items-center gap-1.5 ml-1">
                            <Phone className="w-3 h-3 text-primary" /> Phone Number
                          </Label>
                          <Input 
                            id="phone"
                            value={formData.phoneNumber}
                            onChange={e => setFormData(f => ({ ...f, phoneNumber: e.target.value }))}
                            className="h-11 rounded-xl bg-muted/40 font-medium"
                            placeholder="+91 00000 00000"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-border/50">
                      <div className="flex items-center justify-between">
                         <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Reset Security</h3>
                         <Badge variant="outline" className="text-[9px] bg-warning/5 text-warning border-warning/20">Sensitive Area</Badge>
                      </div>
                      <div className="space-y-2 relative">
                        <Label htmlFor="pass" className="text-xs font-bold flex items-center gap-1.5 ml-1">
                          <Lock className="w-3 h-3 text-primary" /> Force New Password
                        </Label>
                        <div className="relative">
                          <Input 
                            id="pass" 
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={e => setFormData(f => ({ ...f, password: e.target.value }))}
                            className="h-11 rounded-xl bg-muted/40 pr-10 font-mono"
                            placeholder="Leave blank to keep current"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6">
                      <Button 
                        disabled={isSaving} 
                        className="w-full h-12 rounded-2xl gradient-primary text-primary-foreground font-bold shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.01] active:scale-[0.99]"
                      >
                        {isSaving ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Saving Pipeline Changes...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Deploy Profile Updates
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

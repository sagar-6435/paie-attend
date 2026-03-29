import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { usersApi } from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  User as UserIcon, 
  Mail, 
  Lock, 
  Hash, 
  Save, 
  ShieldCheck, 
  UserCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  GraduationCap,
  Phone
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";

export default function ProfilePage() {
  const { user, login, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    rollNumber: user?.rollNumber || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    password: "",
    confirmPassword: ""
  });

  // Re-sync with auth user if it changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name,
        rollNumber: user.rollNumber || "",
        email: user.email,
        phoneNumber: user.phoneNumber || ""
      }));
    }
  }, [user]);

  if (!user) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if anything changed
    const nothingChanged = 
      formData.name === user.name && 
      formData.rollNumber === (user.rollNumber || "") && 
      formData.phoneNumber === (user.phoneNumber || "") &&
      !formData.password;

    if (nothingChanged) {
      toast.info("No changes to update.");
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const updatePayload: any = {
        name: formData.name,
        rollNumber: formData.rollNumber,
        phoneNumber: formData.phoneNumber
      };
      
      if (formData.password) {
        updatePayload.password = formData.password;
      }

      const response = await usersApi.update(user.id, updatePayload);
      
      if (!response.error) {
        toast.success("Profile updated successfully!");
        setFormData(prev => ({ ...prev, password: "", confirmPassword: "" }));
        
        // Use the new updateUser to sync context immediately
        updateUser(response.data as any);
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <UserCircle2 className="w-8 h-8 text-primary" />
            My Profile
          </h1>
          <p className="text-muted-foreground mt-2">Manage your student identity and account security.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Side - Profile Snapshot */}
          <div className="md:col-span-1 space-y-6">
            <Card className="glass-card overflow-hidden">
              <div className="h-32 gradient-accent opacity-20" />
              <CardContent className="pt-0 -mt-16 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-3xl border-4 border-background bg-sidebar-accent shadow-xl flex items-center justify-center text-4xl font-black text-primary mb-4">
                    {user.name.charAt(0)}
                  </div>
                  <h2 className="text-xl font-bold">{user.name}</h2>
                  <Badge variant="outline" className="mt-1 font-mono">{user.role === 'admin' ? 'ADMINISTRATOR' : (user.rollNumber || 'GUEST')}</Badge>
                  <p className="text-xs text-muted-foreground mt-2">{user.email}</p>
                  
                  <div className="mt-8 pt-8 border-t border-border/50 w-full">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between px-2">
                        <span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">Account Type</span>
                        <Badge className="gradient-primary border-none text-[10px] font-bold px-2 py-0">OFFICIAL</Badge>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                        {user.role === 'admin' ? (
                          <ShieldCheck className="w-5 h-5 text-primary" />
                        ) : user.role === 'student' ? (
                          <GraduationCap className="w-5 h-5 text-primary" />
                        ) : (
                          <Eye className="w-5 h-5 text-primary" />
                        )}
                        <span className="text-sm font-black uppercase tracking-wider text-primary">{user.role}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-none bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed text-primary/80">
                    Your <strong>Roll Number</strong> is used for identification in attendance logs. 
                    Ensure it matches your official records.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Edit Form */}
          <div className="md:col-span-2">
            <Card className="glass-card border-none shadow-2xl">
              <CardHeader className="border-b border-border/50 bg-muted/20">
                <CardTitle className="text-lg">Account Settings</CardTitle>
                <CardDescription>Update your personal information and password</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  {/* Personal Info Group */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Personal Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs font-bold flex items-center gap-1.5 ml-1">
                          <UserIcon className="w-3 h-3" /> Full Name
                        </Label>
                        <Input 
                          id="name" 
                          value={formData.name}
                          onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                          className="h-11 rounded-xl bg-muted/40"
                          placeholder="Your full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold flex items-center gap-1.5 ml-1 opacity-50">
                          <Hash className="w-3 h-3" /> Roll Number (Read-only)
                        </Label>
                        <Input 
                          value={formData.rollNumber}
                          disabled
                          className="h-11 rounded-xl bg-muted/20 text-muted-foreground border-dashed font-mono"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold flex items-center gap-1.5 ml-1 opacity-50">
                        <Mail className="w-3 h-3" /> Email Address (Read-only)
                      </Label>
                      <Input 
                        value={formData.email}
                        disabled
                        className="h-11 rounded-xl bg-muted/20 text-muted-foreground border-dashed"
                      />
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-xs font-bold flex items-center gap-1.5 ml-1">
                          <Phone className="w-3 h-3" /> Phone Number
                        </Label>
                        <Input 
                          id="phone" 
                          value={formData.phoneNumber}
                          onChange={e => setFormData(f => ({ ...f, phoneNumber: e.target.value }))}
                          className="h-11 rounded-xl bg-muted/40"
                          placeholder="Your phone number"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Security Group */}
                  <div className="space-y-4 pt-6 border-t border-border/50">
                    <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Security Settings</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2 relative">
                        <Label htmlFor="pass" className="text-xs font-bold flex items-center gap-1.5 ml-1">
                          <Lock className="w-3 h-3" /> New Password
                        </Label>
                        <div className="relative">
                          <Input 
                            id="pass" 
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={e => setFormData(f => ({ ...f, password: e.target.value }))}
                            className="h-11 rounded-xl bg-muted/40 pr-10"
                            placeholder="••••••••"
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
                      <div className="space-y-2">
                        <Label htmlFor="confirm" className="text-xs font-bold flex items-center gap-1.5 ml-1">
                          Check Password
                        </Label>
                        <Input 
                          id="confirm" 
                          type={showPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={e => setFormData(f => ({ ...f, confirmPassword: e.target.value }))}
                          className="h-11 rounded-xl bg-muted/40"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <Button 
                      disabled={isLoading} 
                      className="w-full h-12 rounded-2xl gradient-primary text-primary-foreground font-bold shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.01] active:scale-[0.99]"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Committing Changes...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Update Account Records
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useNavigate, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, Shield, GraduationCap, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated
  if (!loading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const success = await login(email, password);
    if (success) {
      navigate("/dashboard");
    } else {
      setError("Invalid credentials. Try admin@paie.club, aarav@student.com, etc.");
    }
  };

  const quickLogin = async (email: string) => {
    const success = await login(email, "");
    if (success) navigate("/dashboard");
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary glow-primary mb-4">
            <QrCode className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-primary-foreground tracking-tight">
            PAIE-<span className="text-gradient">Attend</span>
          </h1>
          <p className="text-muted-foreground mt-2">QR-Based Attendance System</p>
        </div>

        <div className="glass-card rounded-2xl p-6 bg-card">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="loginId">Email or Roll Number</Label>
              <Input
                id="loginId"
                type="text"
                placeholder="Enter email or roll number"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full h-11 gradient-primary text-primary-foreground font-semibold">
              Sign In
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center mb-3">Quick Demo Login</p>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => quickLogin("admin@paie.club")}
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-xs">Admin</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => quickLogin("aarav@student.com")}
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                <GraduationCap className="w-4 h-4 text-accent" />
                <span className="text-xs">Student</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => quickLogin("guest@paie.club")}
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                <Eye className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs">Guest</span>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

import { getAllStudentsStats, MOCK_ATTENDANCE, TOTAL_SESSIONS } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, FileText, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function GuestDashboard() {
  const navigate = useNavigate();
  const stats = getAllStudentsStats();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            <span className="font-semibold">PAIE-Attend</span>
            <Badge variant="secondary">Guest View</Badge>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/")}>
            Sign In
          </Button>
        </div>
      </header>

      <main className="container px-4 py-6 max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Attendance Overview</h1>
          <p className="text-muted-foreground">View-only access • {TOTAL_SESSIONS} total sessions</p>
        </div>

        {/* Student List */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Student Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.map((s, i) => (
                <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                  <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center text-accent-foreground font-semibold text-sm">
                    {s.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{s.name}</p>
                      <span className="text-sm font-mono">{s.rollNumber}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <Progress value={s.percentage} className="flex-1 h-2" />
                      <span className="text-sm font-semibold w-12 text-right">{s.percentage}%</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Submissions */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-accent" />
              Recent Work Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...MOCK_ATTENDANCE].reverse().slice(0, 10).map((r) => (
                <div key={r.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <Badge variant="outline" className="text-xs mt-0.5 shrink-0">{r.date}</Badge>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{r.studentName}</p>
                    <p className="text-xs text-muted-foreground truncate">{r.workDone}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

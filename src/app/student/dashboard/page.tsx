import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Star, Target, TrendingUp, ClipboardCheck, Clock } from "lucide-react";

export default async function StudentDashboard() {
  const session = await getSession();
  if (!session) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      testResults: {
        include: { test: true },
        orderBy: { createdAt: 'desc' },
        take: 5
      }
    }
  });

  if (!user) redirect('/login');
  
  // Calculate Ranks Dynamically
  const currentScore = user.rankingScore ?? 0;
  
  const globalRank = (await prisma.user.count({ 
    where: { role: 'STUDENT', rankingScore: { gt: currentScore } } 
  })) + 1;
  
  const classRank = (await prisma.user.count({ 
    where: { role: 'STUDENT', classType: user.classType!, rankingScore: { gt: currentScore } } 
  })) + 1;
  
  const levelRank = (await prisma.user.count({ 
    where: { role: 'STUDENT', classType: user.classType!, level: user.level!, rankingScore: { gt: currentScore } } 
  })) + 1;

  const stats = [
    {
      label: "Global Rank",
      value: currentScore > 0 ? `#${globalRank}` : "—",
      icon: Trophy,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
      border: "border-amber-400/20",
    },
    {
      label: "Class Rank",
      value: currentScore > 0 ? `#${classRank}` : "—",
      icon: Star,
      color: "text-violet-400",
      bg: "bg-violet-400/10",
      border: "border-violet-400/20",
    },
    {
      label: "Level Rank",
      value: currentScore > 0 ? `#${levelRank}` : "—",
      icon: Target,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      border: "border-blue-400/20",
    },
    {
      label: "Performance Score",
      value: user.rankingScore?.toFixed(2) ?? "0.00",
      icon: TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      border: "border-emerald-400/20",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">
          Welcome back, <span className="gradient-text">{user.name}</span> 👋
        </h1>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="info">{user.classType?.replace("_", " ")}</Badge>
          <Badge variant="secondary">Level {user.level}</Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg, border }) => (
          <Card key={label} className={`border ${border} bg-card/60 backdrop-blur-sm hover:bg-card/80 transition-all duration-200 group`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${bg} ${border} border`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
              </div>
              <div className={`text-3xl font-bold ${color} mb-1`}>{value}</div>
              <div className="text-sm text-muted-foreground">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Tests */}
      <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Recent Tests</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="pl-6">Test Name</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Accuracy</TableHead>
                <TableHead className="pr-6">Time Taken</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {user.testResults.map(tr => (
                <TableRow key={tr.id} className="border-border/30 hover:bg-secondary/30">
                  <TableCell className="pl-6 font-medium">{tr.test.title}</TableCell>
                  <TableCell>
                    <span className="text-foreground font-semibold">{tr.marks.toFixed(1)}</span>
                    <span className="text-muted-foreground text-xs"> / 200</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={tr.accuracy >= 80 ? "success" : tr.accuracy >= 60 ? "warning" : "destructive"}>
                      {tr.accuracy.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-6">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      {Math.floor(tr.timeTaken / 60)}m {tr.timeTaken % 60}s
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {user.testResults.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                    <ClipboardCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No tests taken yet. Start a test to see your results here!</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

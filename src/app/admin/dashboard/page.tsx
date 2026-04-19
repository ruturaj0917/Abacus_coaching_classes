import { prisma } from "@/lib/db";
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, BookOpen, GraduationCap, TrendingUp, TrendingDown, Star } from "lucide-react";

export default async function AdminDashboard() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') redirect('/login');

  const totalStudents = await prisma.user.count({ where: { role: 'STUDENT' } });
  const abacusStudents = await prisma.user.count({ where: { role: 'STUDENT', classType: 'ABACUS' } });
  const vedicStudents = await prisma.user.count({ where: { role: 'STUDENT', classType: 'VEDIC_MATHS' } });
  const totalTests = await prisma.test.count();

  const topPerformers = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    orderBy: { rankingScore: 'desc' },
    take: 5,
    select: { id: true, name: true, rankingScore: true, classType: true, level: true }
  });

  const lowPerformers = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    orderBy: { rankingScore: 'asc' },
    take: 5,
    select: { id: true, name: true, rankingScore: true, classType: true, level: true }
  });

  const stats = [
    { label: "Total Students", value: totalStudents, icon: Users, color: "text-violet-400", bg: "bg-violet-400/10", border: "border-violet-400/20" },
    { label: "Abacus Students", value: abacusStudents, icon: GraduationCap, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
    { label: "Vedic Maths", value: vedicStudents, icon: BookOpen, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
    { label: "Total Tests", value: totalTests, icon: Star, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
  ];

  const PerformerTable = ({ performers, title, icon: Icon, accent }: {
    performers: typeof topPerformers;
    title: string;
    icon: React.ElementType;
    accent: string;
  }) => (
    <Card className={`border-border/50 bg-card/60 backdrop-blur-sm border-l-2 ${accent}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-primary" />
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="pl-6">#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Level</TableHead>
              <TableHead className="pr-6 text-right">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {performers.map((p, i) => (
              <TableRow key={p.id} className="border-border/30 hover:bg-secondary/30">
                <TableCell className="pl-6 text-muted-foreground font-medium">{i + 1}</TableCell>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>
                  <Badge variant="info" className="text-xs">{p.classType?.replace("_", " ")}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">Lvl {p.level}</Badge>
                </TableCell>
                <TableCell className="pr-6 text-right font-bold text-primary">
                  {p.rankingScore?.toFixed(2) ?? "0.00"}
                </TableCell>
              </TableRow>
            ))}
            {performers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No student data yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">
          Admin <span className="gradient-text">Dashboard</span>
        </h1>
        <p className="text-muted-foreground">Overview of academy performance and student progress</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg, border }) => (
          <Card key={label} className={`border ${border} bg-card/60 backdrop-blur-sm hover:bg-card/80 transition-all duration-200`}>
            <CardContent className="p-6">
              <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${bg} border ${border} mb-4`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div className={`text-3xl font-bold ${color} mb-1`}>{value}</div>
              <div className="text-sm text-muted-foreground">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <PerformerTable
          performers={topPerformers}
          title="Top Performers"
          icon={TrendingUp}
          accent="border-l-emerald-500"
        />
        <PerformerTable
          performers={lowPerformers}
          title="Needs Attention"
          icon={TrendingDown}
          accent="border-l-amber-500"
        />
      </div>
    </div>
  );
}

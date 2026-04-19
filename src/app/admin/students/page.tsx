import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Mail, GraduationCap } from "lucide-react";

export default async function AdminStudents() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') redirect('/login');

  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">
          Student <span className="gradient-text">Management</span>
        </h1>
        <p className="text-muted-foreground">{students.length} registered student{students.length !== 1 ? "s" : ""}</p>
      </div>

      <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">All Students</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="pl-6">Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Global Rank</TableHead>
                  <TableHead className="pr-6 text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map(s => (
                  <TableRow key={s.id} className="border-border/30 hover:bg-secondary/30">
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-xs font-bold text-white shrink-0">
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{s.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                        <Mail className="w-3.5 h-3.5" />
                        {s.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={s.classType === 'ABACUS' ? "info" : "success"}>
                        {s.classType?.replace("_", " ") ?? "—"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">Level {s.level ?? 0}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-amber-400">
                        {s.globalRank ? `#${s.globalRank}` : "—"}
                      </span>
                    </TableCell>
                    <TableCell className="pr-6 text-right font-bold text-primary">
                      {s.rankingScore?.toFixed(2) ?? "0.00"}
                    </TableCell>
                  </TableRow>
                ))}
                {students.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      <GraduationCap className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p>No students registered yet.</p>
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

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, FileQuestion, PlayCircle } from "lucide-react";

export default async function AvailableTests() {
  const session = await getSession();
  if (!session) redirect('/login');

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) redirect('/login');

  const tests = await prisma.test.findMany({
    where: { classType: user.classType!, level: user.level! },
    orderBy: { createdAt: 'desc' }
  });

  const takenResults = await prisma.testResult.findMany({
    where: { studentId: user.id },
    select: { testId: true }
  });
  const takenTestIds = new Set(takenResults.map(t => t.testId));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Available Tests</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="info">{user.classType?.replace("_", " ")}</Badge>
          <Badge variant="secondary">Level {user.level}</Badge>
          <span className="text-muted-foreground text-xs md:text-sm">
            {tests.length} test{tests.length !== 1 ? "s" : ""} available
          </span>
        </div>
      </div>

      {tests.length === 0 ? (
        <Card className="border-border/50 bg-card/60 text-center py-12 md:py-16">
          <CardContent>
            <FileQuestion className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-base md:text-lg font-semibold text-foreground mb-2">No tests available</h3>
            <p className="text-muted-foreground text-xs md:text-sm">
              No tests found for {user.classType?.replace("_", " ")} Level {user.level}.<br />
              Your instructor will add tests soon.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 pb-8">
          {tests.map(t => {
            const isTaken = takenTestIds.has(t.id);
            return (
              <Card
                key={t.id}
                className={`border transition-all duration-200 flex flex-col ${
                  isTaken
                    ? "border-emerald-500/20 bg-emerald-500/5"
                    : "border-border/50 bg-card/60 hover:bg-card/80 hover:border-primary/30 hover:-translate-y-0.5"
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-semibold leading-tight line-clamp-2">
                      {t.title}
                    </CardTitle>
                    {isTaken && (
                      <Badge variant="success" className="shrink-0">Done</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pb-4 flex-1">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileQuestion className="w-4 h-4" />
                      <span>200 Questions</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{t.timeLimit} minutes time limit</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="info" className="text-xs">{t.classType.replace("_", " ")}</Badge>
                      <Badge variant="secondary" className="text-xs">Level {t.level}</Badge>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Link href={`/student/tests/${t.id}`} className="w-full">
                    <Button 
                      variant={isTaken ? "outline" : "default"}
                      className={cn(
                        "w-full font-semibold h-11 transition-all duration-200",
                        !isTaken && "gradient-brand hover:opacity-90 border-0 text-white shadow-lg shadow-primary/20",
                        isTaken && "border-primary/20 hover:bg-primary/5 hover:border-primary/40 text-primary"
                      )}
                    >
                      {isTaken ? (
                        <><History className="w-4 h-4 mr-2" /> Retake Test</>
                      ) : (
                        <><PlayCircle className="w-4 h-4 mr-2" /> Start Test</>
                      )}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

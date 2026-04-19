import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import TestClient from "./TestClient";

export default async function TestPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect('/login');

  const { id: testId } = await params;

  const test = await prisma.test.findUnique({
    where: { id: testId },
    include: {
      questions: {
        select: { id: true, questionText: true, options: true }
      }
    }
  });

  if (!test) redirect('/student/tests');

  // Verify if already taken
  const existingResult = await prisma.testResult.findFirst({
    where: { testId, studentId: session.userId }
  });

  if (existingResult) {
    redirect('/student/dashboard');
  }

  return (
    <div style={{ padding: '2rem 0' }}>
      <TestClient test={test} questions={test.questions} />
    </div>
  );
}

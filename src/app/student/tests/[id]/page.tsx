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

  return (
    <div className="py-8 md:py-12">
      <TestClient test={test} questions={test.questions} />
    </div>
  );
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== 'STUDENT') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { testId, answers, timeTaken } = await req.json();

    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: { questions: { select: { id: true, correctAnswer: true } } }
    });

    if (!test) return NextResponse.json({ error: 'Test not found' }, { status: 404 });

    // Validate
    let correctCount = 0;
    for (const q of test.questions) {
      if (answers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    }

    const marks = correctCount;
    const totalQs = test.questions.length > 0 ? test.questions.length : 200;
    const accuracy = (marks / totalQs) * 100;
    const latest_test_score = accuracy;

    // Fetch past
    const pastResults = await prisma.testResult.findMany({
      where: { studentId: session.userId }
    });

    let totalPercentageSum = 0;
    for (const pr of pastResults) {
      totalPercentageSum += pr.accuracy; // assuming accuracy saved matches test score normalisation
    }

    // Add current
    totalPercentageSum += latest_test_score;
    const n = pastResults.length + 1;
    const average_marks = totalPercentageSum / n;

    // Formula
    const rankingScore = (0.6 * average_marks) + (0.4 * latest_test_score);

    // Save Result
    await prisma.testResult.create({
      data: {
        studentId: session.userId,
        testId: test.id,
        marks,
        accuracy,
        timeTaken: parseInt(timeTaken) || 0
      }
    });

    // Update the student's personal ranking score only.
    // Dynamic ranking will be calculated on-the-fly in the dashboard.
    await prisma.user.update({
      where: { id: session.userId },
      data: { rankingScore }
    });

    return NextResponse.json({ success: true, marks, accuracy, rankingScore });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

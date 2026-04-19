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

    // Fetch ALL results for this student to calculate the new average based on LATEST attempts per test
    const allResults = await prisma.testResult.findMany({
      where: { studentId: session.userId },
      orderBy: { createdAt: 'desc' }
    });

    // Filter to keep only the most recent accuracy for each unique test
    const latestPerTest = new Map<string, number>();
    for (const res of allResults) {
      if (!latestPerTest.has(res.testId)) {
        latestPerTest.set(res.testId, res.accuracy);
      }
    }

    // Calculate Average Marks based on the latest attempt of every test taken
    const totalAccuracySum = Array.from(latestPerTest.values()).reduce((sum, acc) => sum + acc, 0);
    const average_marks = totalAccuracySum / latestPerTest.size;

    // Formula: (60% weight on total average + 40% weight on latest test performance)
    const rankingScore = (0.6 * average_marks) + (0.4 * latest_test_score);

    // Update the student's personal ranking score
    await prisma.user.update({
      where: { id: session.userId },
      data: { rankingScore }
    });

    return NextResponse.json({ success: true, marks, accuracy: latest_test_score, rankingScore });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

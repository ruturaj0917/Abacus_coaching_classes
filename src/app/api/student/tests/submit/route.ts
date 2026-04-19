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

    // Update Score
    const user = await prisma.user.update({
      where: { id: session.userId },
      data: { rankingScore }
    });

    // Update Global Rank
    const allUsers = await prisma.user.findMany({ where: { role: 'STUDENT' }, orderBy: { rankingScore: 'desc' }});
    let tx = [];
    for (let i = 0; i < allUsers.length; i++) {
        tx.push(prisma.user.update({ where: { id: allUsers[i].id }, data: { globalRank: i + 1 } }));
    }
    await prisma.$transaction(tx);

    // Update Class Rank
    const classUsers = await prisma.user.findMany({ where: { role: 'STUDENT', classType: user.classType }, orderBy: { rankingScore: 'desc' }});
    tx = [];
    for (let i = 0; i < classUsers.length; i++) {
        tx.push(prisma.user.update({ where: { id: classUsers[i].id }, data: { classRank: i + 1 } }));
    }
    await prisma.$transaction(tx);

    // Update Level Rank
    const levelUsers = await prisma.user.findMany({ where: { role: 'STUDENT', classType: user.classType, level: user.level }, orderBy: { rankingScore: 'desc' }});
    tx = [];
    for (let i = 0; i < levelUsers.length; i++) {
        tx.push(prisma.user.update({ where: { id: levelUsers[i].id }, data: { levelRank: i + 1 } }));
    }
    await prisma.$transaction(tx);

    return NextResponse.json({ success: true, marks, accuracy, rankingScore });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

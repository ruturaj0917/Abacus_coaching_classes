import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tests = await prisma.test.findMany({
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json({ tests });
}

function generateQuestionsForLevel(level: number, classType: string, count: number) {
  const questions = [];
  for (let i = 0; i < count; i++) {
    const a = Math.floor(Math.random() * (10 * (level + 1))) + 1;
    const b = Math.floor(Math.random() * (10 * (level + 1))) + 1;
    const isAddition = Math.random() > 0.5;
    
    let text = '';
    let answer = 0;
    
    if (isAddition) {
      text = `${a} + ${b}`;
      answer = a + b;
    } else {
      const max = Math.max(a, b);
      const min = Math.min(a, b);
      text = `${max} - ${min}`;
      answer = max - min;
    }

    questions.push({
      questionText: text,
      correctAnswer: answer.toString(),
      options: JSON.stringify([
        answer.toString(),
        (answer + 1).toString(),
        (answer - 1).toString(),
        (answer + 2).toString(),
      ].sort(() => Math.random() - 0.5))
    });
  }
  return questions;
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { title, classType, level, timeLimit, questionCount } = await req.json();
    const numQuestions = Math.max(1, Math.min(500, parseInt(questionCount) || 200));

    const questions = generateQuestionsForLevel(parseInt(level), classType, numQuestions);

    const test = await prisma.test.create({
      data: {
        title,
        classType,
        level: parseInt(level),
        timeLimit: parseInt(timeLimit),
        questions: {
          create: questions
        }
      }
    });

    return NextResponse.json({ test });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

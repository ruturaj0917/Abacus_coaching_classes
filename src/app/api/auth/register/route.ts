import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { createSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { name, email, password, classType, level } = await request.json();

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'STUDENT',
        classType: classType,
        level: level ? parseInt(level) : 0,
      },
    });

    await createSession(user.id, user.role, {
      name: user.name,
      classType: user.classType,
      level: user.level,
    });

    return NextResponse.json({
      message: 'Registered successfully',
      user: { id: user.id, email: user.email, role: user.role, name: user.name }
    });
  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message || String(error) }, { status: 500 });
  }
}

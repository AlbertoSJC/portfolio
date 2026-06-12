import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { playerDataSchema } from '@/lib/playerSchema';

async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profile = await prisma.playerProfile.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json({
    player: profile ? JSON.parse(profile.data) : null,
    updatedAt: profile?.updatedAt ?? null,
  });
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = playerDataSchema.safeParse(body?.player);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid player payload', issues: parsed.error.issues }, { status: 400 });
  }

  const data = JSON.stringify(parsed.data);
  const profile = await prisma.playerProfile.upsert({
    where: { userId: session.user.id },
    update: { data },
    create: { userId: session.user.id, data },
  });

  return NextResponse.json({ ok: true, updatedAt: profile.updatedAt });
}

export async function DELETE() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await prisma.playerProfile.deleteMany({ where: { userId: session.user.id } });
  return NextResponse.json({ ok: true });
}

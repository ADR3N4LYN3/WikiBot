import { NextRequest, NextResponse } from 'next/server';
// eslint-disable-next-line import/no-unresolved
import { SignJWT } from 'jose';

import { auth } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function getAuthToken(session: { user: { discordId?: string; name?: string | null; email?: string | null } }) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET not configured');
  }

  const secretKey = new TextEncoder().encode(secret);

  const jwt = await new SignJWT({
    discordId: session.user.discordId,
    name: session.user.name,
    email: session.user.email,
    sub: session.user.discordId,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secretKey);

  return jwt;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.discordId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serverId = request.headers.get('X-Server-Id');
    if (!serverId) {
      return NextResponse.json({ error: 'Server ID required' }, { status: 400 });
    }

    const token = await getAuthToken(session);

    const response = await fetch(`${API_URL}/api/v1/settings`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Server-Id': serverId,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.discordId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serverId = request.headers.get('X-Server-Id');
    if (!serverId) {
      return NextResponse.json({ error: 'Server ID required' }, { status: 400 });
    }

    const body = await request.json();
    const token = await getAuthToken(session);

    const response = await fetch(`${API_URL}/api/v1/settings`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Server-Id': serverId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

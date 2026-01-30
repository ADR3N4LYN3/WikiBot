import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';

import { auth } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Generate JWT token for API calls
async function generateJWTToken(userId: string, name?: string | null, email?: string | null): Promise<string> {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET not configured');
  }

  const secretKey = new TextEncoder().encode(secret);

  const token = await new SignJWT({
    discordId: userId,
    name: name,
    email: email,
    sub: userId,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secretKey);

  return token;
}

// Generic handler for all methods
async function handleRequest(request: NextRequest, params: Promise<{ path: string[] }>) {
  try {
    const session = await auth();

    if (!session?.user?.discordId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { path } = await params;
    const apiPath = `/api/v1/${path.join('/')}`;

    // Generate JWT for API call
    const jwtToken = await generateJWTToken(
      session.user.discordId,
      session.user.name,
      session.user.email
    );

    // Get server ID from headers
    const serverId = request.headers.get('X-Server-Id');

    // Build headers for API request
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${jwtToken}`,
      'Content-Type': 'application/json',
    };

    if (serverId) {
      headers['X-Server-Id'] = serverId;
    }

    // Get request body for POST/PUT/PATCH
    let body: string | undefined;
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      try {
        body = await request.text();
      } catch {
        // No body
      }
    }

    // Build URL with query params
    const url = new URL(apiPath, API_URL);
    request.nextUrl.searchParams.forEach((value, key) => {
      url.searchParams.set(key, value);
    });

    // Forward request to API
    const response = await fetch(url.toString(), {
      method: request.method,
      headers,
      body,
    });

    // Get response data
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Return response with same status
    if (typeof data === 'string') {
      return new NextResponse(data, {
        status: response.status,
        headers: { 'Content-Type': contentType || 'text/plain' },
      });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Export handlers for all methods
export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, context.params);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, context.params);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, context.params);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, context.params);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, context.params);
}

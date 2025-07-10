import { NextResponse } from 'next/server';
import { logRequest, logResponse, logAuth, logError } from '@/lib/logger';

export async function POST(request: Request) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  // Log incoming request
  logRequest('POST', '/api/auth', undefined, requestId);

  try {
    const { pin } = await request.json();

    // Get the PIN from environment variable
    const correctPin = process.env.AUTH_PIN;

    if (!correctPin) {
      logAuth('config_error', undefined, false, 'AUTH_PIN environment variable is not set');
      logResponse('POST', '/api/auth', 500, undefined, requestId, Date.now() - startTime);
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (!pin || pin.length !== 6) {
      logAuth('invalid_pin_format', undefined, false, 'PIN validation failed - invalid length');
      logResponse('POST', '/api/auth', 400, undefined, requestId, Date.now() - startTime);
      return NextResponse.json(
        { error: 'PIN deve ter 6 dígitos' },
        { status: 400 }
      );
    }

    if (pin === correctPin) {
      logAuth('login_success', undefined, true);
      logResponse('POST', '/api/auth', 200, undefined, requestId, Date.now() - startTime);
      return NextResponse.json({ success: true });
    } else {
      logAuth('login_failed', undefined, false, 'Incorrect PIN provided');
      logResponse('POST', '/api/auth', 401, undefined, requestId, Date.now() - startTime);
      return NextResponse.json({ error: 'PIN incorreto' }, { status: 401 });
    }
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Unknown auth error'), 'Auth API', undefined, { requestId });
    logResponse('POST', '/api/auth', 500, undefined, requestId, Date.now() - startTime);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

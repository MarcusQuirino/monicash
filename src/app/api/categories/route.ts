import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { categorySchema } from '@/lib/validations';
import { logRequest, logResponse, logDatabase, logError } from '@/lib/logger';

export async function GET() {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  logRequest('GET', '/api/categories', undefined, requestId);

  try {
    logDatabase('findMany', 'category', undefined, undefined);
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { expenses: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    logDatabase('findMany', 'category', undefined, undefined, undefined);
    logResponse('GET', '/api/categories', 200, undefined, requestId, Date.now() - startTime);
    return NextResponse.json(categories);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logDatabase('findMany', 'category', undefined, undefined, errorMessage);
    logError(error instanceof Error ? error : new Error('Unknown categories GET error'), 'Categories API GET', undefined, { requestId });
    logResponse('GET', '/api/categories', 500, undefined, requestId, Date.now() - startTime);
    return NextResponse.json(
      { error: 'Falha ao buscar categorias' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  logRequest('POST', '/api/categories', undefined, requestId);

  try {
    const body = await request.json();
    const validatedData = categorySchema.parse(body);

    logDatabase('create', 'category', undefined, undefined);
    const category = await prisma.category.create({
      data: validatedData,
    });

    logDatabase('create', 'category', category.id.toString(), undefined, undefined);
    logResponse('POST', '/api/categories', 201, undefined, requestId, Date.now() - startTime);
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logDatabase('create', 'category', undefined, undefined, errorMessage);
    logError(error instanceof Error ? error : new Error('Unknown categories POST error'), 'Categories API POST', undefined, { requestId });
    logResponse('POST', '/api/categories', 500, undefined, requestId, Date.now() - startTime);
    return NextResponse.json(
      { error: 'Falha ao criar categoria' },
      { status: 500 }
    );
  }
}

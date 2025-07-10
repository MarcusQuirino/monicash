import { NextRequest, NextResponse } from 'next/server';
import { incomeSchema } from '@/lib/validations';
import { prisma } from '@/lib/db';
import { Decimal } from '@prisma/client/runtime/library';
import {
  logRequest,
  logResponse,
  logDatabase,
  logError,
  logBusinessLogic,
} from '@/lib/logger';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  logRequest('GET', '/api/incomes', undefined, requestId);

  try {
    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    logBusinessLogic('filter_incomes', 'income', undefined, undefined, {
      month,
      year,
    });

    let whereClause = {};

    if (month && year && month !== 'all' && year !== 'all') {
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);

      whereClause = {
        date: {
          gte: new Date(yearNum, monthNum - 1, 1),
          lt: new Date(yearNum, monthNum, 1),
        },
      };
    }

    logDatabase('findMany', 'income', undefined, undefined);
    const incomes = await prisma.income.findMany({
      where: whereClause,
      orderBy: {
        date: 'desc',
      },
    });

    // Convert Decimal to string for JSON serialization
    const serializedIncomes = incomes.map((income) => ({
      ...income,
      amount: income.amount.toString(),
      date: income.date.toISOString().split('T')[0],
      createdAt: income.createdAt.toISOString(),
      updatedAt: income.updatedAt.toISOString(),
    }));

    logDatabase('findMany', 'income', undefined, undefined, undefined);
    logResponse(
      'GET',
      '/api/incomes',
      200,
      undefined,
      requestId,
      Date.now() - startTime
    );
    return NextResponse.json(serializedIncomes);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    logDatabase('findMany', 'income', undefined, undefined, errorMessage);
    logError(
      error instanceof Error ? error : new Error('Unknown incomes GET error'),
      'Incomes API GET',
      undefined,
      { requestId }
    );
    logResponse(
      'GET',
      '/api/incomes',
      500,
      undefined,
      requestId,
      Date.now() - startTime
    );
    return NextResponse.json(
      { error: 'Failed to fetch incomes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  logRequest('POST', '/api/incomes', undefined, requestId);

  try {
    const body = await request.json();
    const validatedData = incomeSchema.parse(body);

    logBusinessLogic('create_income', 'income', undefined, undefined, {
      amount: validatedData.amount,
    });

    logDatabase('create', 'income', undefined, undefined);
    const income = await prisma.income.create({
      data: {
        date: new Date(validatedData.date),
        description: validatedData.description || null,
        amount: new Decimal(validatedData.amount),
      },
    });

    // Convert Decimal to string for JSON serialization
    const serializedIncome = {
      ...income,
      amount: income.amount.toString(),
      date: income.date.toISOString().split('T')[0],
      createdAt: income.createdAt.toISOString(),
      updatedAt: income.updatedAt.toISOString(),
    };

    logDatabase('create', 'income', income.id.toString(), undefined, undefined);
    logBusinessLogic(
      'income_created',
      'income',
      income.id.toString(),
      undefined,
      { amount: income.amount.toString() }
    );
    logResponse(
      'POST',
      '/api/incomes',
      201,
      undefined,
      requestId,
      Date.now() - startTime
    );
    return NextResponse.json(serializedIncome, { status: 201 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    logDatabase('create', 'income', undefined, undefined, errorMessage);
    logError(
      error instanceof Error ? error : new Error('Unknown incomes POST error'),
      'Incomes API POST',
      undefined,
      { requestId }
    );
    logResponse(
      'POST',
      '/api/incomes',
      500,
      undefined,
      requestId,
      Date.now() - startTime
    );
    return NextResponse.json(
      { error: 'Failed to create income' },
      { status: 500 }
    );
  }
}

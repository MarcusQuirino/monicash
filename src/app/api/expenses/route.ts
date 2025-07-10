import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { expenseSchema } from '@/lib/validations';
import { logRequest, logResponse, logDatabase, logError, logBusinessLogic } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  logRequest('GET', '/api/expenses', undefined, requestId);

  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const categoryId = searchParams.get('categoryId');

    logBusinessLogic('filter_expenses', 'expense', undefined, undefined, { month, year, categoryId });

    const currentDate = new Date();
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();
    const targetMonth = month ? parseInt(month) - 1 : currentDate.getMonth();

    const where: {
      date?: { gte: Date; lte: Date };
      categoryId?: number;
    } = {};

    // Only add date filtering if not requesting "all time"
    if (month !== 'all' && year !== 'all') {
      const startDate = new Date(targetYear, targetMonth, 1);
      const endDate = new Date(targetYear, targetMonth + 1, 0);
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }

    logDatabase('findMany', 'expense', undefined, undefined);
    const expenses = await prisma.expense.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: { date: 'desc' },
    });

    logDatabase('findMany', 'expense', undefined, undefined, undefined);
    logResponse('GET', '/api/expenses', 200, undefined, requestId, Date.now() - startTime);
    return NextResponse.json(expenses);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logDatabase('findMany', 'expense', undefined, undefined, errorMessage);
    logError(error instanceof Error ? error : new Error('Unknown expenses GET error'), 'Expenses API GET', undefined, { requestId });
    logResponse('GET', '/api/expenses', 500, undefined, requestId, Date.now() - startTime);
    return NextResponse.json(
      { error: 'Falha ao buscar gastos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  logRequest('POST', '/api/expenses', undefined, requestId);

  try {
    const body = await request.json();
    const validatedData = expenseSchema.parse(body);

    logBusinessLogic('create_expense', 'expense', undefined, undefined, {
      amount: validatedData.amount,
      categoryId: validatedData.categoryId
    });

    logDatabase('create', 'expense', undefined, undefined);
    const expense = await prisma.expense.create({
      data: {
        date: new Date(validatedData.date),
        description: validatedData.description,
        amount: parseFloat(validatedData.amount),
        categoryId: parseInt(validatedData.categoryId),
      },
      include: {
        category: true,
      },
    });

    logDatabase('create', 'expense', expense.id.toString(), undefined, undefined);
    logBusinessLogic('expense_created', 'expense', expense.id.toString(), undefined, { amount: expense.amount });
    logResponse('POST', '/api/expenses', 201, undefined, requestId, Date.now() - startTime);
    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logDatabase('create', 'expense', undefined, undefined, errorMessage);
    logError(error instanceof Error ? error : new Error('Unknown expenses POST error'), 'Expenses API POST', undefined, { requestId });
    logResponse('POST', '/api/expenses', 500, undefined, requestId, Date.now() - startTime);
    return NextResponse.json(
      { error: 'Falha ao criar gasto' },
      { status: 500 }
    );
  }
}

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

type Context = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: NextRequest, context: Context) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    const { id } = await context.params;
    logRequest('PUT', `/api/incomes/${id}`, undefined, requestId);

    const body = await request.json();
    const validatedData = incomeSchema.parse(body);

    logBusinessLogic('update_income', 'income', id, undefined, {
      amount: validatedData.amount,
    });

    logDatabase('update', 'income', id, undefined);
    const income = await prisma.income.update({
      where: { id: parseInt(id) },
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

    logDatabase('update', 'income', id, undefined, undefined);
    logBusinessLogic('income_updated', 'income', id, undefined, {
      amount: income.amount.toString(),
    });
    logResponse(
      'PUT',
      `/api/incomes/${id}`,
      200,
      undefined,
      requestId,
      Date.now() - startTime
    );
    return NextResponse.json(serializedIncome);
  } catch (error) {
    const { id } = await context.params;
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    logDatabase('update', 'income', id, undefined, errorMessage);
    logError(
      error instanceof Error ? error : new Error('Unknown income PUT error'),
      'Income API PUT',
      undefined,
      { requestId, incomeId: id }
    );
    logResponse(
      'PUT',
      `/api/incomes/${id}`,
      500,
      undefined,
      requestId,
      Date.now() - startTime
    );
    return NextResponse.json(
      { error: 'Failed to update income' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    const { id } = await context.params;
    logRequest('DELETE', `/api/incomes/${id}`, undefined, requestId);

    logBusinessLogic('delete_income', 'income', id, undefined);
    logDatabase('delete', 'income', id, undefined);
    await prisma.income.delete({
      where: { id: parseInt(id) },
    });

    logDatabase('delete', 'income', id, undefined, undefined);
    logBusinessLogic('income_deleted', 'income', id, undefined);
    logResponse(
      'DELETE',
      `/api/incomes/${id}`,
      200,
      undefined,
      requestId,
      Date.now() - startTime
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    const { id } = await context.params;
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    logDatabase('delete', 'income', id, undefined, errorMessage);
    logError(
      error instanceof Error ? error : new Error('Unknown income DELETE error'),
      'Income API DELETE',
      undefined,
      { requestId, incomeId: id }
    );
    logResponse(
      'DELETE',
      `/api/incomes/${id}`,
      500,
      undefined,
      requestId,
      Date.now() - startTime
    );
    return NextResponse.json(
      { error: 'Failed to delete income' },
      { status: 500 }
    );
  }
}

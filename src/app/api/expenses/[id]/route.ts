import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { expenseSchema } from '@/lib/validations';
import {
  logRequest,
  logResponse,
  logDatabase,
  logError,
  logBusinessLogic,
} from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    const { id } = await params;
    logRequest('GET', `/api/expenses/${id}`, undefined, requestId);

    logDatabase('findUnique', 'expense', id, undefined);
    const expense = await prisma.expense.findUnique({
      where: { id: parseInt(id) },
      include: { category: true },
    });

    if (!expense) {
      logDatabase('findUnique', 'expense', id, undefined, 'Record not found');
      logResponse(
        'GET',
        `/api/expenses/${id}`,
        404,
        undefined,
        requestId,
        Date.now() - startTime
      );
      return NextResponse.json(
        { error: 'Gasto não encontrado' },
        { status: 404 }
      );
    }

    logDatabase('findUnique', 'expense', id, undefined, undefined);
    logResponse(
      'GET',
      `/api/expenses/${id}`,
      200,
      undefined,
      requestId,
      Date.now() - startTime
    );
    return NextResponse.json(expense);
  } catch (error) {
    const { id } = await params;
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    logDatabase('findUnique', 'expense', id, undefined, errorMessage);
    logError(
      error instanceof Error ? error : new Error('Unknown expense GET error'),
      'Expense API GET',
      undefined,
      { requestId, expenseId: id }
    );
    logResponse(
      'GET',
      `/api/expenses/${id}`,
      500,
      undefined,
      requestId,
      Date.now() - startTime
    );
    return NextResponse.json(
      { error: 'Falha ao buscar gasto' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    const { id } = await params;
    logRequest('PUT', `/api/expenses/${id}`, undefined, requestId);

    const body = await request.json();
    const validatedData = expenseSchema.parse(body);

    logBusinessLogic('update_expense', 'expense', id, undefined, {
      amount: validatedData.amount,
      categoryId: validatedData.categoryId,
    });

    logDatabase('update', 'expense', id, undefined);
    const expense = await prisma.expense.update({
      where: { id: parseInt(id) },
      data: {
        date: new Date(validatedData.date),
        description: validatedData.description,
        amount: parseFloat(validatedData.amount),
        categoryId: parseInt(validatedData.categoryId),
      },
      include: { category: true },
    });

    logDatabase('update', 'expense', id, undefined, undefined);
    logBusinessLogic('expense_updated', 'expense', id, undefined, {
      amount: expense.amount,
    });
    logResponse(
      'PUT',
      `/api/expenses/${id}`,
      200,
      undefined,
      requestId,
      Date.now() - startTime
    );
    return NextResponse.json(expense);
  } catch (error) {
    const { id } = await params;
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    logDatabase('update', 'expense', id, undefined, errorMessage);
    logError(
      error instanceof Error ? error : new Error('Unknown expense PUT error'),
      'Expense API PUT',
      undefined,
      { requestId, expenseId: id }
    );
    logResponse(
      'PUT',
      `/api/expenses/${id}`,
      500,
      undefined,
      requestId,
      Date.now() - startTime
    );
    return NextResponse.json(
      { error: 'Falha ao atualizar gasto' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    const { id } = await params;
    logRequest('DELETE', `/api/expenses/${id}`, undefined, requestId);

    logBusinessLogic('delete_expense', 'expense', id, undefined);
    logDatabase('delete', 'expense', id, undefined);
    await prisma.expense.delete({
      where: { id: parseInt(id) },
    });

    logDatabase('delete', 'expense', id, undefined, undefined);
    logBusinessLogic('expense_deleted', 'expense', id, undefined);
    logResponse(
      'DELETE',
      `/api/expenses/${id}`,
      200,
      undefined,
      requestId,
      Date.now() - startTime
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    const { id } = await params;
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    logDatabase('delete', 'expense', id, undefined, errorMessage);
    logError(
      error instanceof Error
        ? error
        : new Error('Unknown expense DELETE error'),
      'Expense API DELETE',
      undefined,
      { requestId, expenseId: id }
    );
    logResponse(
      'DELETE',
      `/api/expenses/${id}`,
      500,
      undefined,
      requestId,
      Date.now() - startTime
    );
    return NextResponse.json(
      { error: 'Falha ao excluir gasto' },
      { status: 500 }
    );
  }
}

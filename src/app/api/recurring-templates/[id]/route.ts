import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { RecurringType, Frequency } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID do modelo recorrente inválido' },
        { status: 400 }
      );
    }

    const recurringTemplate = await prisma.recurringTemplate.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!recurringTemplate) {
      return NextResponse.json(
        { error: 'Modelo recorrente não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(recurringTemplate);
  } catch (error) {
    console.error('Error fetching recurring template:', error);
    return NextResponse.json(
      { error: 'Falha ao buscar modelo recorrente' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID do modelo recorrente inválido' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      type,
      amount,
      description,
      categoryId,
      frequency,
      interval,
      startDate,
      endDate,
      isActive,
    } = body;

    // Validate required fields
    if (!type || !amount || !frequency || !startDate) {
      return NextResponse.json(
        { error: 'Campos obrigatórios não preenchidos' },
        { status: 400 }
      );
    }

    // Validate type
    if (!Object.values(RecurringType).includes(type)) {
      return NextResponse.json(
        { error: 'Tipo de recorrência inválido' },
        { status: 400 }
      );
    }

    // Validate frequency
    if (!Object.values(Frequency).includes(frequency)) {
      return NextResponse.json(
        { error: 'Frequência inválida' },
        { status: 400 }
      );
    }

    // For expenses, categoryId is required
    if (type === 'EXPENSE' && !categoryId) {
      return NextResponse.json(
        { error: 'Categoria é obrigatória para despesas' },
        { status: 400 }
      );
    }

    // Calculate next due date
    const nextDueDate = calculateNextDueDate(
      new Date(startDate),
      frequency,
      interval
    );

    const recurringTemplate = await prisma.recurringTemplate.update({
      where: { id },
      data: {
        type,
        amount: parseFloat(amount),
        description,
        categoryId: type === 'EXPENSE' ? categoryId : null,
        frequency,
        interval,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        nextDueDate,
        isActive,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(recurringTemplate);
  } catch (error) {
    console.error('Error updating recurring template:', error);
    return NextResponse.json(
      { error: 'Falha ao atualizar modelo recorrente' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID do modelo recorrente inválido' },
        { status: 400 }
      );
    }

    await prisma.recurringTemplate.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Modelo recorrente excluído com sucesso',
    });
  } catch (error) {
    console.error('Error deleting recurring template:', error);
    return NextResponse.json(
      { error: 'Falha ao excluir modelo recorrente' },
      { status: 500 }
    );
  }
}

function calculateNextDueDate(
  startDate: Date,
  frequency: Frequency,
  interval: number
): Date {
  const nextDate = new Date(startDate);

  switch (frequency) {
    case 'WEEKLY':
      nextDate.setDate(nextDate.getDate() + interval * 7);
      break;
    case 'MONTHLY':
      nextDate.setMonth(nextDate.getMonth() + interval);
      break;
    case 'YEARLY':
      nextDate.setFullYear(nextDate.getFullYear() + interval);
      break;
  }

  return nextDate;
}

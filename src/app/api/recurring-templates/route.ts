import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { RecurringType, Frequency } from '@prisma/client';
import { logRequest, logResponse, logDatabase, logError, logBusinessLogic } from '@/lib/logger';

export async function GET() {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  logRequest('GET', '/api/recurring-templates', undefined, requestId);

  try {
    logDatabase('findMany', 'recurringTemplate', undefined, undefined);
    const recurringTemplates = await prisma.recurringTemplate.findMany({
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    logDatabase('findMany', 'recurringTemplate', undefined, undefined, undefined);
    logResponse('GET', '/api/recurring-templates', 200, undefined, requestId, Date.now() - startTime);
    return NextResponse.json(recurringTemplates);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logDatabase('findMany', 'recurringTemplate', undefined, undefined, errorMessage);
    logError(error instanceof Error ? error : new Error('Unknown recurring templates GET error'), 'Recurring Templates API GET', undefined, { requestId });
    logResponse('GET', '/api/recurring-templates', 500, undefined, requestId, Date.now() - startTime);
    return NextResponse.json(
      { error: 'Failed to fetch recurring templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  logRequest('POST', '/api/recurring-templates', undefined, requestId);

  try {
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
      isActive = true,
    } = body;

    logBusinessLogic('validate_recurring_template', 'recurringTemplate', undefined, undefined, { type, frequency, amount });

    // Validate required fields
    if (!type || !amount || !frequency || !startDate) {
      logBusinessLogic('validation_failed', 'recurringTemplate', undefined, undefined, { error: 'Missing required fields' });
      logResponse('POST', '/api/recurring-templates', 400, undefined, requestId, Date.now() - startTime);
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate type
    if (!Object.values(RecurringType).includes(type)) {
      logBusinessLogic('validation_failed', 'recurringTemplate', undefined, undefined, { error: 'Invalid recurring type' });
      logResponse('POST', '/api/recurring-templates', 400, undefined, requestId, Date.now() - startTime);
      return NextResponse.json(
        { error: 'Invalid recurring type' },
        { status: 400 }
      );
    }

    // Validate frequency
    if (!Object.values(Frequency).includes(frequency)) {
      logBusinessLogic('validation_failed', 'recurringTemplate', undefined, undefined, { error: 'Invalid frequency' });
      logResponse('POST', '/api/recurring-templates', 400, undefined, requestId, Date.now() - startTime);
      return NextResponse.json({ error: 'Invalid frequency' }, { status: 400 });
    }

    // For expenses, categoryId is required
    if (type === 'EXPENSE' && !categoryId) {
      logBusinessLogic('validation_failed', 'recurringTemplate', undefined, undefined, { error: 'Category required for expenses' });
      logResponse('POST', '/api/recurring-templates', 400, undefined, requestId, Date.now() - startTime);
      return NextResponse.json(
        { error: 'Category is required for expenses' },
        { status: 400 }
      );
    }

    // Calculate next due date
    logBusinessLogic('calculate_next_due_date', 'recurringTemplate', undefined, undefined, { frequency, interval, startDate });
    const nextDueDate = calculateNextDueDate(
      new Date(startDate),
      frequency,
      interval
    );

    logDatabase('create', 'recurringTemplate', undefined, undefined);
    const recurringTemplate = await prisma.recurringTemplate.create({
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

    logDatabase('create', 'recurringTemplate', recurringTemplate.id.toString(), undefined, undefined);
    logBusinessLogic('recurring_template_created', 'recurringTemplate', recurringTemplate.id.toString(), undefined, {
      type, frequency, amount, nextDueDate: nextDueDate.toISOString()
    });
    logResponse('POST', '/api/recurring-templates', 201, undefined, requestId, Date.now() - startTime);
    return NextResponse.json(recurringTemplate, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logDatabase('create', 'recurringTemplate', undefined, undefined, errorMessage);
    logError(error instanceof Error ? error : new Error('Unknown recurring template POST error'), 'Recurring Template API POST', undefined, { requestId });
    logResponse('POST', '/api/recurring-templates', 500, undefined, requestId, Date.now() - startTime);
    return NextResponse.json(
      { error: 'Failed to create recurring template' },
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

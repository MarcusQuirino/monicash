import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { RecurringType, Frequency } from '@prisma/client';

export async function GET() {
    try {
        const recurringTemplates = await prisma.recurringTemplate.findMany({
            include: {
                category: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(recurringTemplates);
    } catch (error) {
        console.error('Error fetching recurring templates:', error);
        return NextResponse.json(
            { error: 'Failed to fetch recurring templates' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
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

        // Validate required fields
        if (!type || !amount || !frequency || !startDate) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Validate type
        if (!Object.values(RecurringType).includes(type)) {
            return NextResponse.json(
                { error: 'Invalid recurring type' },
                { status: 400 }
            );
        }

        // Validate frequency
        if (!Object.values(Frequency).includes(frequency)) {
            return NextResponse.json(
                { error: 'Invalid frequency' },
                { status: 400 }
            );
        }

        // For expenses, categoryId is required
        if (type === 'EXPENSE' && !categoryId) {
            return NextResponse.json(
                { error: 'Category is required for expenses' },
                { status: 400 }
            );
        }

        // Calculate next due date
        const nextDueDate = calculateNextDueDate(
            new Date(startDate),
            frequency,
            interval
        );

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

        return NextResponse.json(recurringTemplate, { status: 201 });
    } catch (error) {
        console.error('Error creating recurring template:', error);
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
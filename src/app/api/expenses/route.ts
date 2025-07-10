import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { expenseSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const categoryId = searchParams.get('categoryId');

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

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Erro ao buscar gastos:', error);
    return NextResponse.json(
      { error: 'Falha ao buscar gastos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = expenseSchema.parse(body);

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

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar gasto:', error);
    return NextResponse.json(
      { error: 'Falha ao criar gasto' },
      { status: 500 }
    );
  }
}

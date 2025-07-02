import { NextRequest, NextResponse } from 'next/server'
import { incomeSchema } from '@/lib/validations'
import { prisma } from '@/lib/db'
import { Decimal } from '@prisma/client/runtime/library'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const month = searchParams.get('month')
        const year = searchParams.get('year')

        let whereClause = {}

        if (month && year && month !== 'all' && year !== 'all') {
            const monthNum = parseInt(month)
            const yearNum = parseInt(year)

            whereClause = {
                date: {
                    gte: new Date(yearNum, monthNum - 1, 1),
                    lt: new Date(yearNum, monthNum, 1),
                },
            }
        }

        const incomes = await prisma.income.findMany({
            where: whereClause,
            orderBy: {
                date: 'desc',
            },
        })

        // Convert Decimal to string for JSON serialization
        const serializedIncomes = incomes.map(income => ({
            ...income,
            amount: income.amount.toString(),
            date: income.date.toISOString().split('T')[0],
            createdAt: income.createdAt.toISOString(),
            updatedAt: income.updatedAt.toISOString(),
        }))

        return NextResponse.json(serializedIncomes)
    } catch (error) {
        console.error('Error fetching incomes:', error)
        return NextResponse.json(
            { error: 'Failed to fetch incomes' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const validatedData = incomeSchema.parse(body)

        const income = await prisma.income.create({
            data: {
                date: new Date(validatedData.date),
                description: validatedData.description || null,
                amount: new Decimal(validatedData.amount),
            },
        })

        // Convert Decimal to string for JSON serialization
        const serializedIncome = {
            ...income,
            amount: income.amount.toString(),
            date: income.date.toISOString().split('T')[0],
            createdAt: income.createdAt.toISOString(),
            updatedAt: income.updatedAt.toISOString(),
        }

        return NextResponse.json(serializedIncome, { status: 201 })
    } catch (error) {
        console.error('Error creating income:', error)
        return NextResponse.json(
            { error: 'Failed to create income' },
            { status: 500 }
        )
    }
} 
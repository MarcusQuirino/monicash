import { NextRequest, NextResponse } from 'next/server'
import { incomeSchema } from '@/lib/validations'
import { prisma } from '@/lib/db'
import { Decimal } from '@prisma/client/runtime/library'

type Context = {
    params: Promise<{ id: string }>
}

export async function PUT(request: NextRequest, context: Context) {
    try {
        const { id } = await context.params
        const body = await request.json()
        const validatedData = incomeSchema.parse(body)

        const income = await prisma.income.update({
            where: { id: parseInt(id) },
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

        return NextResponse.json(serializedIncome)
    } catch (error) {
        console.error('Error updating income:', error)
        return NextResponse.json(
            { error: 'Failed to update income' },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest, context: Context) {
    try {
        const { id } = await context.params

        await prisma.income.delete({
            where: { id: parseInt(id) },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting income:', error)
        return NextResponse.json(
            { error: 'Failed to delete income' },
            { status: 500 }
        )
    }
} 
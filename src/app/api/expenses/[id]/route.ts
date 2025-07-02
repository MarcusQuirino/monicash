import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { expenseSchema } from '@/lib/validations'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const expense = await prisma.expense.findUnique({
            where: { id: parseInt(id) },
            include: { category: true }
        })

        if (!expense) {
            return NextResponse.json(
                { error: 'Gasto não encontrado' },
                { status: 404 }
            )
        }

        return NextResponse.json(expense)
    } catch (error) {
        console.error('Erro ao buscar gasto:', error)
        return NextResponse.json(
            { error: 'Falha ao buscar gasto' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const validatedData = expenseSchema.parse(body)

        const expense = await prisma.expense.update({
            where: { id: parseInt(id) },
            data: {
                date: new Date(validatedData.date),
                description: validatedData.description,
                amount: parseFloat(validatedData.amount),
                categoryId: parseInt(validatedData.categoryId)
            },
            include: { category: true }
        })

        return NextResponse.json(expense)
    } catch (error) {
        console.error('Erro ao atualizar gasto:', error)
        return NextResponse.json(
            { error: 'Falha ao atualizar gasto' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        await prisma.expense.delete({
            where: { id: parseInt(id) }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Erro ao excluir gasto:', error)
        return NextResponse.json(
            { error: 'Falha ao excluir gasto' },
            { status: 500 }
        )
    }
} 
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { categorySchema } from '@/lib/validations'

export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            include: {
                _count: {
                    select: { expenses: true }
                }
            },
            orderBy: { name: 'asc' }
        })
        return NextResponse.json(categories)
    } catch (error) {
        console.error('Erro ao buscar categorias:', error)
        return NextResponse.json(
            { error: 'Falha ao buscar categorias' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const validatedData = categorySchema.parse(body)

        const category = await prisma.category.create({
            data: validatedData
        })

        return NextResponse.json(category, { status: 201 })
    } catch (error) {
        console.error('Erro ao criar categoria:', error)
        return NextResponse.json(
            { error: 'Falha ao criar categoria' },
            { status: 500 }
        )
    }
} 
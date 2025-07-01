import { z } from 'zod'

export const expenseSchema = z.object({
    date: z.string().min(1, 'Date is required'),
    description: z.string().optional(),
    amount: z.string().min(1, 'Amount is required').refine(
        (val) => !isNaN(Number(val)) && Number(val) > 0,
        'Amount must be a positive number'
    ),
    categoryId: z.string().min(1, 'Category is required'),
})

export const categorySchema = z.object({
    name: z.string().min(1, 'Category name is required').max(100, 'Name too long'),
    color: z.string().optional(),
})

export type ExpenseFormData = z.infer<typeof expenseSchema>

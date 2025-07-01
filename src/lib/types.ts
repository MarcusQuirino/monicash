export type Category = {
    id: number
    name: string
    color?: string
    _count?: {
        expenses: number
    }
}

export type Expense = {
    id: number
    amount: string
    date: string
    description?: string
    categoryId: number
    category: Category
    createdAt: string
    updatedAt: string
} 
# Monicash Architecture & Tech Stack

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [Neon](https://neon.tech/) (Serverless PostgreSQL)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) & [Radix UI](https://www.radix-ui.com/)
- **State Management**: [TanStack Query (React Query)](https://tanstack.com/query) for server state management.
- **Forms**: Controlled components with `useState`.
- **Validation**: [Zod](https://zod.dev/) for schema validation.
- **Charts**: [Recharts](https://recharts.org/) for data visualization.
- **Icons**: [Lucide React](https://lucide.dev/)

## 📁 Project Structure

The project follows a standard Next.js App Router structure.

```
monicash/
├── prisma/
│   ├── migrations/          # Database migrations
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Database seed data
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/             # API routes
│   │   ├── globals.css      # Global styles
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Home page
│   ├── components/          # React components
│   │   ├── ui/              # shadcn/ui components
│   │   └── ...              # Application-specific components
│   └── lib/                 # Utility functions, types, and configs
└── public/                  # Static assets
```

## 🔧 API Endpoints

The application uses a RESTful API for data management.

### Categories

- `GET /api/categories`: Fetch all categories.
- `POST /api/categories`: Create a new category.

### Expenses

- `GET /api/expenses?month=<m>&year=<y>`: Fetch expenses, filterable by month and year. Use `month=all` to get all expenses.
- `POST /api/expenses`: Create a new expense.
- `GET /api/expenses/[id]`: Fetch a single expense.
- `PUT /api/expenses/[id]`: Update an expense.
- `DELETE /api/expenses/[id]`: Delete an expense.

### Incomes

- `GET /api/incomes?month=<m>&year=<y>`: Fetch incomes, filterable by month and year. Use `month=all` to get all incomes.
- `POST /api/incomes`: Create a new income.
- `GET /api/incomes/[id]`: Fetch a single income.
- `PUT /api/incoins/[id]`: Update an income.
- `DELETE /api/incomes/[id]`: Delete an income.

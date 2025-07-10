# Monicash 💰

A modern personal finance tracker built with Next.js 15, TypeScript, Prisma, and Tailwind CSS.

![Monicash Dashboard](https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=Monicash+Dashboard)

## ✨ Features

- **🔐 PIN Authentication**: Secure access with a 6-digit PIN.
- **📊 Interactive Dashboard**: Visualize your finances with dynamic charts and statistics.
- **💸 Expense & Income Management**: Easily add, edit, and delete expenses and incomes.
- **🏷️ Expense Categorization**: Organize expenses with customizable, color-coded categories.
- **📅 Period Filtering**: View transactions by month or for all time.
- **🔍 Transaction Details**: View detailed information for each transaction in a modal.
- **⬇️ Excel Export**: Export your financial data for a selected period to an Excel file.
- **📱 Responsive Design**: Optimized interface for both desktop and mobile devices.
- **🎨 Modern UI**: Clean and intuitive user interface built with Tailwind CSS and shadcn/ui.
- **☁️ Serverless Database**: Utilizes Neon for a scalable, auto-managed PostgreSQL database.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) account (for a serverless PostgreSQL database)
- npm or yarn

### Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/your-username/monicash.git
    cd monicash
    ```

2.  **Install dependencies**

    ```bash
    npm install
    ```

3.  **Set up your database**

    Create a `.env` file in the project root:

    ```bash
    touch .env
    ```

    Add your Neon database connection strings and a secret PIN to the `.env` file. You can get the URLs from your Neon project dashboard.

    ```env
    # Get from Neon Dashboard -> Connection Details
    # Use the "pooled" connection string for DATABASE_URL
    DATABASE_URL="postgresql://username:password@ep-xxx-pooler.region.neon.tech/database?sslmode=require"
    # Use the "direct" connection string for DIRECT_URL (remove '-pooler' from hostname)
    DIRECT_URL="postgresql://username:password@ep-xxx.region.neon.tech/database?sslmode=require"

    # Set your 6-digit authentication PIN
    AUTH_PIN=123456
    ```

4.  **Run database migrations**

    This will set up the database schema based on `prisma/schema.prisma`.

    ```bash
    npx prisma migrate dev
    ```

5.  **Seed the database**

    This will populate the database with initial categories.

    ```bash
    npx prisma db seed
    ```

6.  **Start the development server**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) to view the application.

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
- `PUT /api/incomes/[id]`: Update an income.
- `DELETE /api/incomes/[id]`: Delete an income.

## 🚧 Future Improvements

- **Inline Editing**: Complete the functionality for inline editing in the transaction table.
- **Custom Date Filters**: Implement a date range picker for custom time periods.
- **Budgeting**: Add features to set and track monthly budgets.
- **Recurring Transactions**: Support for automatic logging of recurring expenses and incomes.
- **Multi-currency Support**: Add the ability to track finances in different currencies.
- **User Accounts**: Implement full user authentication for a multi-user system.

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for more details.

---

Built with ❤️ using Next.js and TypeScript.

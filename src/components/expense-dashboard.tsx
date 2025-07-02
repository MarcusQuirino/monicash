"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Expense, Income, Category, Transaction } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Plus, Download, TrendingUp } from "lucide-react";
import { ExpenseForm } from "./expense-form";
import { IncomeForm } from "./income-form";
import { ExpenseTable } from "./expense-table";
import { ExpenseDetailModal } from "./expense-detail-modal";

import { CategoryChart } from "./category-chart";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { exportTransactionsToExcel } from "@/lib/utils";

export function ExpenseDashboard() {
  const [showAddExpenseForm, setShowAddExpenseForm] = useState(false);
  const [showAddIncomeForm, setShowAddIncomeForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [viewingTransaction, setViewingTransaction] =
    useState<Transaction | null>(null);
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // State for month/year filter
  const [selectedPeriod, setSelectedPeriod] = useState(
    `${currentYear}-${currentMonth.toString().padStart(2, "0")}`
  );

  // Generate month options for the last 12 months plus current month
  const generateMonthOptions = () => {
    const options = [{ value: "all", label: "Todos os Períodos" }];
    const now = new Date();

    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const value = `${year}-${month.toString().padStart(2, "0")}`;
      const label = date.toLocaleDateString("pt-BR", {
        year: "numeric",
        month: "long",
      });
      options.push({ value, label });
    }

    return options;
  };

  const monthOptions = generateMonthOptions();

  // Parse selected period
  const isAllTime = selectedPeriod === "all";
  const [selectedYear, selectedMonth] = isAllTime
    ? [null, null]
    : selectedPeriod.split("-").map(Number);

  const { data: expenses = [], isLoading: isLoadingExpenses } = useQuery<
    Expense[]
  >({
    queryKey: ["expenses", selectedMonth, selectedYear, isAllTime],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (isAllTime) {
        params.append("month", "all");
        params.append("year", "all");
      } else {
        params.append("month", selectedMonth!.toString());
        params.append("year", selectedYear!.toString());
      }

      const response = await fetch(`/api/expenses?${params.toString()}`);
      if (!response.ok) throw new Error("Falha ao buscar gastos");
      return response.json();
    },
  });

  const { data: incomes = [], isLoading: isLoadingIncomes } = useQuery<
    Income[]
  >({
    queryKey: ["incomes", selectedMonth, selectedYear, isAllTime],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (isAllTime) {
        params.append("month", "all");
        params.append("year", "all");
      } else {
        params.append("month", selectedMonth!.toString());
        params.append("year", selectedYear!.toString());
      }

      const response = await fetch(`/api/incomes?${params.toString()}`);
      if (!response.ok) throw new Error("Falha ao buscar entradas");
      return response.json();
    },
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Falha ao buscar categorias");
      return response.json();
    },
  });

  const isLoading = isLoadingExpenses || isLoadingIncomes;

  // Combine expenses and incomes into transactions
  const transactions: Transaction[] = [
    ...expenses.map(
      (expense): Transaction => ({
        ...expense,
        type: "expense" as const,
      })
    ),
    ...incomes.map(
      (income): Transaction => ({
        ...income,
        type: "income" as const,
      })
    ),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calculate stats based on selected period
  const calculateStats = () => {
    const totalExpenses = expenses.reduce(
      (sum: number, e: Expense) => sum + parseFloat(e.amount),
      0
    );
    const totalIncome = incomes.reduce(
      (sum: number, i: Income) => sum + parseFloat(i.amount),
      0
    );
    const netAmount = totalIncome - totalExpenses;

    return { totalExpenses, totalIncome, netAmount };
  };

  const { totalExpenses, totalIncome, netAmount } = calculateStats();

  const calculateAvgPerDay = () => {
    if (expenses.length === 0) return "0";

    if (isAllTime) {
      // For all time, calculate average per day based on the range of dates
      const dates = expenses.map((e) => new Date(e.date));
      const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
      const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));
      const daysDiff =
        Math.ceil(
          (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1;
      return (totalExpenses / daysDiff).toFixed(0);
    } else {
      // For specific month, use days in that month
      const daysInMonth = new Date(selectedYear!, selectedMonth!, 0).getDate();
      return (totalExpenses / daysInMonth).toFixed(0);
    }
  };

  const handleEditExpense = (transaction: Transaction) => {
    if (transaction.type === "expense") {
      setEditingExpense(transaction as Expense);
      setViewingTransaction(null);
    }
  };

  const handleEditIncome = (transaction: Transaction) => {
    if (transaction.type === "income") {
      setEditingIncome(transaction as Income);
      setViewingTransaction(null);
    }
  };

  const handleCloseEditForms = () => {
    setEditingExpense(null);
    setEditingIncome(null);
  };

  const handleEditSuccess = () => {
    setEditingExpense(null);
    setEditingIncome(null);
  };

  const handleViewDetails = (transaction: Transaction) => {
    setViewingTransaction(transaction);
  };

  const handleCloseDetailModal = () => {
    setViewingTransaction(null);
  };

  const handleNavigateTransaction = (transaction: Transaction) => {
    setViewingTransaction(transaction);
  };

  const handleExportToExcel = () => {
    const periodLabel = isAllTime
      ? "Todos os Períodos"
      : monthOptions.find((opt) => opt.value === selectedPeriod)?.label;

    exportTransactionsToExcel(expenses, incomes, periodLabel);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-gray-600">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with Month Filter - Mobile Optimized */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:justify-between sm:items-center">
        <h1 className="text-xl sm:text-2xl font-bold">Painel Financeiro</h1>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:items-center sm:gap-2">
          <span className="text-sm text-gray-600 sm:inline">Período:</span>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Selecionar período" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Financial Overview - Mobile Optimized Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total de Gastos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-red-600">
              R$ {totalExpenses.toFixed(2).replace(".", ",")}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total de Entradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              R$ {totalIncome.toFixed(2).replace(".", ",")}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Saldo Líquido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-xl sm:text-2xl font-bold ${
                netAmount >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {netAmount >= 0 ? "+" : ""}R${" "}
              {Math.abs(netAmount).toFixed(2).replace(".", ",")}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Gasto Médio/Dia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              R$ {calculateAvgPerDay()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons - Mobile Optimized */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:justify-between sm:items-center">
        <h2 className="text-lg sm:text-xl font-semibold">
          {isAllTime ? "Todas as Transações" : "Transações Recentes"}
        </h2>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:gap-2">
          {transactions.length > 0 && (
            <Button
              variant="outline"
              onClick={handleExportToExcel}
              className="w-full sm:w-auto"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar Excel
            </Button>
          )}
          <Button
            onClick={() => setShowAddIncomeForm(true)}
            variant="outline"
            className="w-full sm:w-auto border-green-200 text-green-700 hover:bg-green-50"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Nova Entrada
          </Button>
          <Button
            onClick={() => setShowAddExpenseForm(true)}
            variant="outline"
            className="w-full sm:w-auto border-red-200 text-red-700 hover:bg-red-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Gasto
          </Button>
        </div>
      </div>

      {/* Category Chart - Only show for expenses */}
      {expenses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Gastos por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryChart expenses={expenses} />
          </CardContent>
        </Card>
      )}

      {/* Transaction Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Lista de Transações</CardTitle>
            {transactions.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleExportToExcel}>
                <Download className="w-4 h-4 mr-2" />
                Exportar Excel
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ExpenseTable
            transactions={transactions}
            onEditExpense={handleEditExpense}
            onEditIncome={handleEditIncome}
            onViewDetails={handleViewDetails}
          />
        </CardContent>
      </Card>

      {/* Add Expense Form */}
      {showAddExpenseForm && (
        <ExpenseForm
          categories={categories}
          onClose={() => setShowAddExpenseForm(false)}
          onSuccess={() => setShowAddExpenseForm(false)}
        />
      )}

      {/* Add Income Form */}
      {showAddIncomeForm && (
        <IncomeForm
          onClose={() => setShowAddIncomeForm(false)}
          onSuccess={() => setShowAddIncomeForm(false)}
        />
      )}

      {/* Edit Expense Form */}
      {editingExpense && (
        <ExpenseForm
          categories={categories}
          expense={editingExpense}
          onClose={handleCloseEditForms}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Edit Income Form */}
      {editingIncome && (
        <IncomeForm
          income={editingIncome}
          onClose={handleCloseEditForms}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Transaction Detail Modal - Only for expenses for now */}
      {viewingTransaction && viewingTransaction.type === "expense" && (
        <ExpenseDetailModal
          expense={viewingTransaction as Expense}
          expenses={expenses}
          onClose={handleCloseDetailModal}
          onEdit={(expense: Expense) =>
            handleEditExpense({ ...expense, type: "expense" as const })
          }
          onNavigate={(expense: Expense) =>
            handleNavigateTransaction({ ...expense, type: "expense" as const })
          }
        />
      )}
    </div>
  );
}

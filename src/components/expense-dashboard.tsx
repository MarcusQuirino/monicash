"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Expense, Category } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ExpenseForm } from "./expense-form";
import { ExpenseTable } from "./expense-table";
import { ExpenseDetailModal } from "./expense-detail-modal";
import { MonthlyTotal } from "./monthly-total";
import { CategoryChart } from "./category-chart";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ExpenseDashboard() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [viewingExpense, setViewingExpense] = useState<Expense | null>(null);
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

  const { data: expenses = [], isLoading } = useQuery<Expense[]>({
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

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Falha ao buscar categorias");
      return response.json();
    },
  });

  // Calculate stats based on selected period
  const calculateAvgPerDay = () => {
    if (expenses.length === 0) return "0";

    const totalAmount = expenses.reduce(
      (sum: number, e: Expense) => sum + parseFloat(e.amount),
      0
    );

    if (isAllTime) {
      // For all time, calculate average per day based on the range of dates
      const dates = expenses.map((e) => new Date(e.date));
      const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
      const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));
      const daysDiff =
        Math.ceil(
          (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1;
      return (totalAmount / daysDiff).toFixed(0);
    } else {
      // For specific month, use days in that month
      const daysInMonth = new Date(selectedYear!, selectedMonth!, 0).getDate();
      return (totalAmount / daysInMonth).toFixed(0);
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setViewingExpense(null);
  };

  const handleCloseEditForm = () => {
    setEditingExpense(null);
  };

  const handleEditSuccess = () => {
    setEditingExpense(null);
  };

  const handleViewDetails = (expense: Expense) => {
    setViewingExpense(expense);
  };

  const handleCloseDetailModal = () => {
    setViewingExpense(null);
  };

  const handleNavigateExpense = (expense: Expense) => {
    setViewingExpense(expense);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-gray-600">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Month Filter */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Painel de Gastos</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Período:</span>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
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

      {/* Monthly Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MonthlyTotal
          expenses={expenses}
          isAllTime={isAllTime}
          period={
            isAllTime
              ? undefined
              : monthOptions.find((opt) => opt.value === selectedPeriod)?.label
          }
        />
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Transações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expenses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Categorias Usadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(expenses.map((e) => e.categoryId)).size}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Média por Dia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {calculateAvgPerDay()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Action Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {isAllTime ? "Todos os Gastos" : "Gastos Recentes"}
        </h2>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Gasto
        </Button>
      </div>

      {/* Category Chart */}
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

      {/* Expense Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Gastos</CardTitle>
        </CardHeader>
        <CardContent>
          <ExpenseTable
            expenses={expenses}
            onEdit={handleEditExpense}
            onViewDetails={handleViewDetails}
          />
        </CardContent>
      </Card>

      {/* Add Expense Form */}
      {showAddForm && (
        <ExpenseForm
          categories={categories}
          onClose={() => setShowAddForm(false)}
          onSuccess={() => setShowAddForm(false)}
        />
      )}

      {/* Edit Expense Form */}
      {editingExpense && (
        <ExpenseForm
          categories={categories}
          expense={editingExpense}
          onClose={handleCloseEditForm}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Expense Detail Modal */}
      {viewingExpense && (
        <ExpenseDetailModal
          expense={viewingExpense}
          expenses={expenses}
          onClose={handleCloseDetailModal}
          onEdit={handleEditExpense}
          onNavigate={handleNavigateExpense}
        />
      )}
    </div>
  );
}

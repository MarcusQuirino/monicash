"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Expense } from "@/lib/types";

type MonthlyTotalProps = {
  expenses: Expense[];
  title?: string;
  period?: string;
  isAllTime?: boolean;
};

export function MonthlyTotal({
  expenses,
  title = "Total Mensal",
  period,
  isAllTime = false,
}: MonthlyTotalProps) {
  const total = expenses.reduce(
    (sum, expense) => sum + parseFloat(expense.amount),
    0
  );

  const displayTitle = isAllTime ? "Total de Gastos" : title;
  const displayPeriod =
    period ||
    new Date().toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-blue-600">
          {displayTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-blue-900">
          R$ {total.toFixed(2).replace(".", ",")}
        </div>
        <p className="text-xs text-blue-600 mt-1">
          {isAllTime ? "Todos os Períodos" : displayPeriod}
        </p>
      </CardContent>
    </Card>
  );
}

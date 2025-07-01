"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import type { Expense } from "@/lib/types";

type CategoryChartProps = {
  expenses: Expense[];
};

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC658",
  "#FF7C7C",
];

export function CategoryChart({ expenses }: CategoryChartProps) {
  // Group expenses by category
  const categoryData = expenses.reduce((acc, expense) => {
    const categoryName = expense.category.name;
    const amount = parseFloat(expense.amount);

    if (acc[categoryName]) {
      acc[categoryName] += amount;
    } else {
      acc[categoryName] = amount;
    }

    return acc;
  }, {} as Record<string, number>);

  // Convert to chart data format
  const chartData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value: Number(value.toFixed(2)),
    percentage: (
      (value / expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0)) *
      100
    ).toFixed(1),
  }));

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{
      payload: {
        name: string;
        percentage: string;
      };
      value: number;
    }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.payload.name}</p>
          <p className="text-blue-600">
            R$ {data.value.toFixed(2).replace(".", ",")}
          </p>
          <p className="text-gray-500">{data.payload.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhum dado para exibir
      </div>
    );
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) => `${name} (${percentage}%)`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

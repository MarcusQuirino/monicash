'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import type { Expense } from '@/lib/types';

type CategoryChartProps = {
  expenses: Expense[];
};

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#82CA9D',
  '#FFC658',
  '#FF7C7C',
];

export function CategoryChart({ expenses }: CategoryChartProps) {
  // Group expenses by category
  const categoryData = expenses.reduce(
    (acc, expense) => {
      const categoryName = expense.category.name;
      const amount = parseFloat(expense.amount);

      if (acc[categoryName]) {
        acc[categoryName] += amount;
      } else {
        acc[categoryName] = amount;
      }

      return acc;
    },
    {} as Record<string, number>
  );

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
        <div className="rounded-lg border bg-white p-2 text-sm shadow-lg sm:p-3">
          <p className="text-xs font-medium sm:text-sm">{data.payload.name}</p>
          <p className="text-xs text-blue-600 sm:text-sm">
            R$ {data.value.toFixed(2).replace('.', ',')}
          </p>
          <p className="text-xs text-gray-500">{data.payload.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: {
    cx?: number;
    cy?: number;
    midAngle?: number;
    innerRadius?: number;
    outerRadius?: number;
    percent?: number;
  }) => {
    // Guard clause to ensure all required values are present
    if (
      !cx ||
      !cy ||
      midAngle === undefined ||
      !innerRadius ||
      !outerRadius ||
      percent === undefined
    ) {
      return null;
    }

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return percent > 0.05 ? (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  if (chartData.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        Nenhum dado para exibir
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={CustomLabel}
              outerRadius="85%"
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
            <Legend
              wrapperStyle={{
                fontSize: '12px',
                paddingTop: '10px',
              }}
              iconSize={12}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Mobile Legend Alternative */}
      <div className="mt-4 block sm:hidden">
        <div className="grid grid-cols-1 gap-2">
          {chartData.map((entry, index) => (
            <div
              key={entry.name}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center space-x-2">
                <div
                  className="h-3 w-3 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="truncate text-gray-700">{entry.name}</span>
              </div>
              <div className="flex flex-shrink-0 space-x-2">
                <span className="font-medium text-gray-900">
                  R$ {entry.value.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-gray-500">({entry.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

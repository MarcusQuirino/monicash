import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import * as XLSX from "xlsx"
import type { Expense, Income } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to darken a hex color for better contrast
export function darkenColor(color: string, amount: number = 0.3): string {
  // Remove # if present
  const hex = color.replace('#', '');

  // Parse RGB values
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Darken each component
  const newR = Math.round(r * (1 - amount));
  const newG = Math.round(g * (1 - amount));
  const newB = Math.round(b * (1 - amount));

  // Convert back to hex
  const toHex = (n: number) => n.toString(16).padStart(2, '0');

  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}

// Generate category badge styles with better contrast
export function getCategoryBadgeStyles(color?: string) {
  if (!color) {
    return {
      backgroundColor: "#f3f4f6",
      color: "#374151",
    };
  }

  return {
    backgroundColor: `${color}30`, // Slightly more opaque background (30% instead of 20%)
    color: darkenColor(color, 0.4), // Darker text for better contrast
  };
}

export function exportTransactionsToExcel(expenses: Expense[], incomes: Income[], periodLabel?: string) {
  // Prepare data for Excel export - combine expenses and incomes
  const transactionData: Array<{
    Tipo: string;
    Data: string;
    Descrição: string;
    Categoria: string;
    Valor: string;
    "Valor Numérico": number | string;
    "Criado em": string;
  }> = [];

  // Add expenses
  expenses.forEach((expense) => {
    transactionData.push({
      Tipo: "Gasto",
      Data: new Date(expense.date).toLocaleDateString("pt-BR"),
      Descrição: expense.description || "",
      Categoria: expense.category.name,
      Valor: `R$ ${parseFloat(expense.amount).toFixed(2).replace(".", ",")}`,
      "Valor Numérico": -parseFloat(expense.amount), // Negative for expenses
      "Criado em": new Date(expense.createdAt).toLocaleDateString("pt-BR"),
    });
  });

  // Add incomes
  incomes.forEach((income) => {
    transactionData.push({
      Tipo: "Entrada",
      Data: new Date(income.date).toLocaleDateString("pt-BR"),
      Descrição: income.description || "",
      Categoria: "-",
      Valor: `R$ ${parseFloat(income.amount).toFixed(2).replace(".", ",")}`,
      "Valor Numérico": parseFloat(income.amount), // Positive for incomes
      "Criado em": new Date(income.createdAt).toLocaleDateString("pt-BR"),
    });
  });

  // Sort by date (newest first)
  transactionData.sort((a, b) => new Date(b.Data).getTime() - new Date(a.Data).getTime());

  // Calculate totals
  const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
  const totalIncome = incomes.reduce((sum, income) => sum + parseFloat(income.amount), 0);
  const netAmount = totalIncome - totalExpenses;

  // Add summary rows
  transactionData.push(
    {
      Tipo: "",
      Data: "",
      Descrição: "",
      Categoria: "",
      Valor: "",
      "Valor Numérico": "",
      "Criado em": "",
    },
    {
      Tipo: "RESUMO",
      Data: "",
      Descrição: "Total de Gastos:",
      Categoria: "",
      Valor: `R$ ${totalExpenses.toFixed(2).replace(".", ",")}`,
      "Valor Numérico": -totalExpenses,
      "Criado em": "",
    },
    {
      Tipo: "",
      Data: "",
      Descrição: "Total de Entradas:",
      Categoria: "",
      Valor: `R$ ${totalIncome.toFixed(2).replace(".", ",")}`,
      "Valor Numérico": totalIncome,
      "Criado em": "",
    },
    {
      Tipo: "",
      Data: "",
      Descrição: "Saldo Líquido:",
      Categoria: "",
      Valor: `${netAmount >= 0 ? '+' : ''}R$ ${Math.abs(netAmount).toFixed(2).replace(".", ",")}`,
      "Valor Numérico": netAmount,
      "Criado em": "",
    }
  );

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(transactionData);

  // Style the header row
  const headerRange = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
  for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (worksheet[cellAddress]) {
      worksheet[cellAddress].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "EEEEEE" } },
      };
    }
  }

  // Style the summary rows
  const summaryStartRow = transactionData.length - 4; // Start of summary section
  for (let row = summaryStartRow; row < transactionData.length; row++) {
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row + 1, c: col });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: "DDDDDD" } },
        };
      }
    }
  }

  // Set column widths
  worksheet["!cols"] = [
    { width: 10 }, // Tipo
    { width: 12 }, // Data
    { width: 30 }, // Descrição
    { width: 15 }, // Categoria
    { width: 15 }, // Valor
    { width: 15 }, // Valor Numérico
    { width: 15 }, // Criado em
  ];

  // Add worksheet to workbook
  const sheetName = periodLabel ? `Transações - ${periodLabel}` : "Transações";
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Generate filename with current date and period
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  const filename = periodLabel
    ? `transacoes_${periodLabel.replace(/\s+/g, "_")}_${dateStr}.xlsx`
    : `transacoes_${dateStr}.xlsx`;

  // Write and download file
  XLSX.writeFile(workbook, filename);
}

// Keep the old function for backward compatibility
export function exportExpensesToExcel(expenses: Expense[], periodLabel?: string) {
  // Prepare data for Excel export
  const excelData = expenses.map((expense) => ({
    Data: new Date(expense.date).toLocaleDateString("pt-BR"),
    Descrição: expense.description || "",
    Categoria: expense.category.name,
    Valor: `R$ ${parseFloat(expense.amount).toFixed(2).replace(".", ",")}`,
    "Valor Numérico": parseFloat(expense.amount),
    "Criado em": new Date(expense.createdAt).toLocaleDateString("pt-BR"),
  }));

  // Add summary row
  const totalAmount = expenses.reduce(
    (sum, expense) => sum + parseFloat(expense.amount),
    0
  );

  excelData.push({
    Data: "",
    Descrição: "",
    Categoria: "TOTAL:",
    Valor: `R$ ${totalAmount.toFixed(2).replace(".", ",")}`,
    "Valor Numérico": totalAmount,
    "Criado em": "",
  });

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Style the header row
  const headerRange = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
  for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (worksheet[cellAddress]) {
      worksheet[cellAddress].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "EEEEEE" } },
      };
    }
  }

  // Style the total row
  const totalRowIndex = excelData.length - 1;
  for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: totalRowIndex + 1, c: col });
    if (worksheet[cellAddress]) {
      worksheet[cellAddress].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "DDDDDD" } },
      };
    }
  }

  // Set column widths
  worksheet["!cols"] = [
    { width: 12 }, // Data
    { width: 30 }, // Descrição
    { width: 15 }, // Categoria
    { width: 15 }, // Valor
    { width: 15 }, // Valor Numérico
    { width: 15 }, // Criado em
  ];

  // Add worksheet to workbook
  const sheetName = periodLabel ? `Gastos - ${periodLabel}` : "Gastos";
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Generate filename with current date and period
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  const filename = periodLabel
    ? `gastos_${periodLabel.replace(/\s+/g, "_")}_${dateStr}.xlsx`
    : `gastos_${dateStr}.xlsx`;

  // Write and download file
  XLSX.writeFile(workbook, filename);
}

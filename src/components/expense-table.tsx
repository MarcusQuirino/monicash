"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Transaction } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Edit,
  Trash2,
  Calendar,
  Tag,
  FileText,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getCategoryBadgeStyles } from "@/lib/utils";

type TransactionTableProps = {
  transactions: Transaction[];
  onEditExpense: (transaction: Transaction) => void;
  onEditIncome: (transaction: Transaction) => void;
  onViewDetails: (transaction: Transaction) => void;
};

export function ExpenseTable({
  transactions,
  onEditExpense,
  onEditIncome,
  onViewDetails,
}: TransactionTableProps) {
  const queryClient = useQueryClient();

  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Falha ao excluir gasto");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });

  const deleteIncomeMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/incomes/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Falha ao excluir entrada");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incomes"] });
      queryClient.invalidateQueries({ queryKey: ["expenses"] }); // Refresh combined view
    },
  });

  const handleDelete = (transaction: Transaction) => {
    if (transaction.type === "expense") {
      deleteExpenseMutation.mutate(transaction.id);
    } else {
      deleteIncomeMutation.mutate(transaction.id);
    }
  };

  const handleEdit = (transaction: Transaction) => {
    if (transaction.type === "expense") {
      onEditExpense(transaction);
    } else {
      onEditIncome(transaction);
    }
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhuma transação registrada para este período.
      </div>
    );
  }

  return (
    <>
      {/* Mobile Card Layout */}
      <div className="block sm:hidden space-y-4">
        {transactions.map((transaction) => (
          <div
            key={`${transaction.type}-${transaction.id}`}
            className={`border rounded-lg p-4 cursor-pointer hover:opacity-90 active:opacity-80 transition-opacity ${
              transaction.type === "income"
                ? "bg-green-50 border-green-200"
                : "bg-white border-gray-200"
            }`}
            onClick={() => onViewDetails(transaction)}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <span className="text-sm text-gray-600">
                    {new Date(transaction.date).toLocaleDateString("pt-BR")}
                  </span>
                  {transaction.type === "income" ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <div
                  className={`text-lg font-bold ${
                    transaction.type === "income"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {transaction.type === "income" ? "+" : "-"}R${" "}
                  {parseFloat(transaction.amount).toFixed(2).replace(".", ",")}
                </div>
              </div>
              <div
                className="flex-shrink-0 ml-2"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(transaction)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Excluir{" "}
                          {transaction.type === "income" ? "Entrada" : "Gasto"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir esta{" "}
                          {transaction.type === "income" ? "entrada" : "gasto"}?
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(transaction)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {transaction.type === "expense" && transaction.category && (
                <div className="flex items-center space-x-2">
                  <Tag className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <span
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                    style={getCategoryBadgeStyles(transaction.category.color)}
                  >
                    {transaction.category.name}
                  </span>
                </div>
              )}

              {transaction.description && (
                <div className="flex items-start space-x-2">
                  <FileText className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 line-clamp-2">
                    {truncateText(transaction.description, 80)}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden sm:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow
                key={`${transaction.type}-${transaction.id}`}
                className={`cursor-pointer hover:opacity-90 ${
                  transaction.type === "income"
                    ? "bg-green-50 hover:bg-green-100"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => onViewDetails(transaction)}
              >
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {transaction.type === "income" ? (
                      <>
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">
                          Entrada
                        </span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-red-600">
                          Gasto
                        </span>
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(transaction.date).toLocaleDateString("pt-BR")}
                </TableCell>
                <TableCell
                  className="max-w-[200px]"
                  title={transaction.description || ""}
                >
                  {transaction.description
                    ? truncateText(transaction.description)
                    : "-"}
                </TableCell>
                <TableCell>
                  {transaction.type === "expense" && transaction.category ? (
                    <span
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                      style={getCategoryBadgeStyles(transaction.category.color)}
                    >
                      {transaction.category.name}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">-</span>
                  )}
                </TableCell>
                <TableCell
                  className={`text-right font-medium ${
                    transaction.type === "income"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {transaction.type === "income" ? "+" : "-"}R${" "}
                  {parseFloat(transaction.amount).toFixed(2).replace(".", ",")}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(transaction)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Excluir{" "}
                            {transaction.type === "income"
                              ? "Entrada"
                              : "Gasto"}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir esta{" "}
                            {transaction.type === "income"
                              ? "entrada"
                              : "gasto"}
                            ? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(transaction)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

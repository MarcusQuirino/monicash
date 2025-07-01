"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Expense } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
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

type ExpenseTableProps = {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onViewDetails: (expense: Expense) => void;
};

export function ExpenseTable({
  expenses,
  onEdit,
  onViewDetails,
}: ExpenseTableProps) {
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
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

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  if (expenses.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhum gasto registrado para este período.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow
              key={expense.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => onViewDetails(expense)}
            >
              <TableCell>
                {new Date(expense.date).toLocaleDateString("pt-BR")}
              </TableCell>
              <TableCell
                className="max-w-[200px]"
                title={expense.description || ""}
              >
                {expense.description ? truncateText(expense.description) : "-"}
              </TableCell>
              <TableCell>
                <span
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  style={getCategoryBadgeStyles(expense.category.color)}
                >
                  {expense.category.name}
                </span>
              </TableCell>
              <TableCell className="text-right font-medium">
                R$ {parseFloat(expense.amount).toFixed(2).replace(".", ",")}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(expense)}
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
                        <AlertDialogTitle>Excluir Gasto</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir este gasto? Esta ação
                          não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(expense.id)}
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
  );
}

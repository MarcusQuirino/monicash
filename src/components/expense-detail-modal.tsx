"use client";

import { useState } from "react";
import type { Expense } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Edit, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getCategoryBadgeStyles } from "@/lib/utils";

type ExpenseDetailModalProps = {
  expense: Expense | null;
  expenses: Expense[];
  onClose: () => void;
  onEdit: (expense: Expense) => void;
  onNavigate: (expense: Expense) => void;
};

export function ExpenseDetailModal({
  expense,
  expenses,
  onClose,
  onEdit,
  onNavigate,
}: ExpenseDetailModalProps) {
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
      onClose();
    },
  });

  if (!expense) return null;

  // Sort expenses by date (newest first) to match table order
  const sortedExpenses = [...expenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const currentIndex = sortedExpenses.findIndex((e) => e.id === expense.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < sortedExpenses.length - 1;

  const handlePrevious = () => {
    if (hasPrevious) {
      const previousExpense = sortedExpenses[currentIndex - 1];
      // We need to update the expense prop, but since this is controlled by parent,
      // we'll need to pass this up. For now, let's create a callback.
      onNavigate?.(previousExpense);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      const nextExpense = sortedExpenses[currentIndex + 1];
      onNavigate?.(nextExpense);
    }
  };

  const handleDelete = () => {
    deleteMutation.mutate(expense.id);
  };

  return (
    <>
      <Dialog open={!!expense} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg max-w-[95vw] max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between pr-8">
              <span className="truncate">Detalhes do Gasto</span>
              <div className="flex items-center space-x-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={!hasPrevious}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-500 px-2 whitespace-nowrap">
                  {currentIndex + 1} de {sortedExpenses.length}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNext}
                  disabled={!hasNext}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 overflow-y-auto flex-1 min-h-0">
            <div>
              <label className="text-sm font-medium text-gray-500">Data</label>
              <p className="text-lg">
                {new Date(expense.date).toLocaleDateString("pt-BR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Valor</label>
              <p className="text-2xl font-bold text-green-600">
                R$ {parseFloat(expense.amount).toFixed(2).replace(".", ",")}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
                Categoria
              </label>
              <div className="mt-1">
                <span
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                  style={getCategoryBadgeStyles(expense.category.color)}
                >
                  {expense.category.name}
                </span>
              </div>
            </div>

            {expense.description && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Descrição
                </label>
                <div className="mt-1 max-h-32 overflow-y-auto bg-gray-50 rounded-md p-3 border">
                  <p className="text-gray-900 whitespace-pre-wrap break-words text-sm leading-relaxed">
                    {expense.description}
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-500">
                Criado em
              </label>
              <p className="text-sm text-gray-600">
                {new Date(expense.createdAt).toLocaleDateString("pt-BR", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            {expense.updatedAt !== expense.createdAt && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Última Atualização
                </label>
                <p className="text-sm text-gray-600">
                  {new Date(expense.updatedAt).toLocaleDateString("pt-BR", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between gap-3 pt-4 border-t">
            <div className="flex space-x-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(expense)}
                className="flex items-center space-x-1"
              >
                <Edit className="w-4 h-4" />
                <span>Editar</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600 hover:text-red-700 flex items-center space-x-1"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir</span>
              </Button>
            </div>
            <Button
              variant="outline"
              onClick={onClose}
              className="sm:flex-shrink-0"
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Gasto</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este gasto? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

'use client';

import { useState } from 'react';
import type { Expense } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Edit, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategoryBadgeStyles } from '@/lib/utils';

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
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Falha ao excluir gasto');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
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
        <DialogContent className="max-h-[90vh] max-w-[95vw] overflow-hidden sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between pr-8">
              <span className="truncate text-base sm:text-lg">
                Detalhes do Gasto
              </span>
              <div className="flex flex-shrink-0 items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={!hasPrevious}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="whitespace-nowrap px-2 text-xs text-gray-500 sm:text-sm">
                  {currentIndex + 1} de {sortedExpenses.length}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNext}
                  disabled={!hasNext}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-1">
            <div>
              <label className="text-xs font-medium text-gray-500 sm:text-sm">
                Data
              </label>
              <p className="text-base sm:text-lg">
                {new Date(expense.date).toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 sm:text-sm">
                Valor
              </label>
              <p className="text-xl font-bold text-green-600 sm:text-2xl">
                R$ {parseFloat(expense.amount).toFixed(2).replace('.', ',')}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 sm:text-sm">
                Categoria
              </label>
              <div className="mt-1">
                <span
                  className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium sm:px-3 sm:text-sm"
                  style={getCategoryBadgeStyles(expense.category.color)}
                >
                  {expense.category.name}
                </span>
              </div>
            </div>

            {expense.description && (
              <div>
                <label className="text-xs font-medium text-gray-500 sm:text-sm">
                  Descrição
                </label>
                <div className="mt-1 max-h-32 overflow-y-auto rounded-md border bg-gray-50 p-2 sm:p-3">
                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-900">
                    {expense.description}
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-gray-500 sm:text-sm">
                Criado em
              </label>
              <p className="text-xs text-gray-600 sm:text-sm">
                {new Date(expense.createdAt).toLocaleDateString('pt-BR', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            {expense.updatedAt !== expense.createdAt && (
              <div>
                <label className="text-xs font-medium text-gray-500 sm:text-sm">
                  Última Atualização
                </label>
                <p className="text-xs text-gray-600 sm:text-sm">
                  {new Date(expense.updatedAt).toLocaleDateString('pt-BR', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 border-t pt-4">
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(expense)}
                className="flex w-full items-center justify-center space-x-1 sm:w-auto"
              >
                <Edit className="h-4 w-4" />
                <span>Editar</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="flex w-full items-center justify-center space-x-1 text-red-600 hover:text-red-700 sm:w-auto"
              >
                <Trash2 className="h-4 w-4" />
                <span>Excluir</span>
              </Button>
            </div>
            <Button variant="outline" onClick={onClose} className="w-full">
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

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Pencil,
  Trash2,
  Plus,
  Calendar,
  DollarSign,
  Repeat,
  AlertCircle,
} from 'lucide-react';
import { RecurringForm } from './recurring-form';
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
import type { RecurringTemplate, Category } from '@/lib/types';

type RecurringManagementProps = {
  categories: Category[];
};

export function RecurringManagement({ categories }: RecurringManagementProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<RecurringTemplate | null>(null);
  const [deletingTemplate, setDeletingTemplate] =
    useState<RecurringTemplate | null>(null);

  const queryClient = useQueryClient();

  const { data: recurringTemplates = [], isLoading } = useQuery<
    RecurringTemplate[]
  >({
    queryKey: ['recurring-templates'],
    queryFn: async () => {
      const response = await fetch('/api/recurring-templates');
      if (!response.ok) throw new Error('Failed to fetch recurring templates');
      return response.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/recurring-templates/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete recurring template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-templates'] });
      setDeletingTemplate(null);
    },
  });

  const formatFrequency = (frequency: string, interval: number) => {
    const freqMap = {
      WEEKLY: interval === 1 ? 'Semanal' : `A cada ${interval} semanas`,
      MONTHLY: interval === 1 ? 'Mensal' : `A cada ${interval} meses`,
      YEARLY: interval === 1 ? 'Anual' : `A cada ${interval} anos`,
    };
    return freqMap[frequency as keyof typeof freqMap] || frequency;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getNextDueDate = (template: RecurringTemplate) => {
    const nextDue = new Date(template.nextDueDate);
    const today = new Date();
    const diffTime = nextDue.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `${Math.abs(diffDays)} dias em atraso`, isOverdue: true };
    } else if (diffDays === 0) {
      return { text: 'Vence hoje', isOverdue: false };
    } else if (diffDays === 1) {
      return { text: 'Vence amanhã', isOverdue: false };
    } else {
      return { text: `Vence em ${diffDays} dias`, isOverdue: false };
    }
  };

  const handleEdit = (template: RecurringTemplate) => {
    setEditingTemplate(template);
  };

  const handleDelete = (template: RecurringTemplate) => {
    setDeletingTemplate(template);
  };

  const confirmDelete = () => {
    if (deletingTemplate) {
      deleteMutation.mutate(deletingTemplate.id);
    }
  };

  const handleFormClose = () => {
    setShowAddForm(false);
    setEditingTemplate(null);
  };

  const handleFormSuccess = () => {
    setShowAddForm(false);
    setEditingTemplate(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-base text-gray-600 sm:text-lg">
          Carregando transações recorrentes...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Mobile Optimized */}
      <div className="space-y-3 sm:flex sm:items-center sm:justify-between sm:space-y-0">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-gray-900 sm:text-xl lg:text-2xl">
            Transações Recorrentes
          </h2>
          <p className="text-xs text-gray-600 sm:text-sm lg:text-base">
            Gerencie suas assinaturas e pagamentos recorrentes
          </p>
        </div>
        <div className="flex-shrink-0">
          <Button
            onClick={() => setShowAddForm(true)}
            className="w-full justify-center sm:w-auto"
            size="sm"
          >
            <Plus className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
            <span className="sm:hidden">Adicionar</span>
            <span className="hidden sm:inline">Adicionar Transação</span>
          </Button>
        </div>
      </div>

      {recurringTemplates.length === 0 ? (
        <Card className="overflow-hidden">
          <CardContent className="py-6 text-center sm:py-8">
            <Repeat className="mx-auto h-10 w-10 text-gray-400 sm:h-12 sm:w-12" />
            <h3 className="mt-3 text-base font-medium sm:mt-4 sm:text-lg">
              Nenhuma transação recorrente
            </h3>
            <p className="mt-1 text-xs text-gray-500 sm:mt-2 sm:text-sm">
              Comece criando sua primeira transação recorrente
            </p>
            <Button
              className="mt-3 w-full sm:mt-4 sm:w-auto"
              onClick={() => setShowAddForm(true)}
              size="sm"
            >
              <Plus className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
              Adicionar Transação Recorrente
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-6">
          {recurringTemplates.map((template) => {
            const nextDue = getNextDueDate(template);
            return (
              <Card key={template.id} className="relative overflow-hidden">
                <CardHeader className="pb-2 sm:pb-3">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <DollarSign className="h-3 w-3 text-gray-500 sm:h-4 sm:w-4" />
                        <CardTitle className="text-sm font-semibold sm:text-base lg:text-lg">
                          R${' '}
                          {parseFloat(template.amount)
                            .toFixed(2)
                            .replace('.', ',')}
                        </CardTitle>
                      </div>
                      {template.description && (
                        <p className="mt-1 text-xs text-gray-600 sm:text-sm">
                          {template.description}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-0.5 sm:space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(template)}
                        className="h-7 w-7 p-0 sm:h-8 sm:w-8"
                      >
                        <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(template)}
                        className="h-7 w-7 p-0 sm:h-8 sm:w-8"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={
                        template.type === 'EXPENSE' ? 'destructive' : 'default'
                      }
                      className="text-xs"
                    >
                      {template.type === 'EXPENSE' ? 'Despesa' : 'Receita'}
                    </Badge>
                    <Badge
                      variant={template.isActive ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {template.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>

                  {template.category && (
                    <div className="flex items-center space-x-2">
                      <div
                        className="h-2 w-2 rounded-full sm:h-3 sm:w-3"
                        style={{
                          backgroundColor: template.category.color || '#gray',
                        }}
                      />
                      <span className="text-xs text-gray-600 sm:text-sm">
                        {template.category.name}
                      </span>
                    </div>
                  )}

                  <div className="space-y-1.5 text-xs sm:space-y-2 sm:text-sm">
                    <div className="flex items-center space-x-2">
                      <Repeat className="h-3 w-3 text-gray-500 sm:h-4 sm:w-4" />
                      <span>
                        {formatFrequency(template.frequency, template.interval)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Calendar className="h-3 w-3 text-gray-500 sm:h-4 sm:w-4" />
                      <span>Iniciado: {formatDate(template.startDate)}</span>
                    </div>

                    {template.endDate && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-3 w-3 text-gray-500 sm:h-4 sm:w-4" />
                        <span>Termina: {formatDate(template.endDate)}</span>
                      </div>
                    )}

                    {template.isActive && (
                      <div
                        className={`flex items-center space-x-2 ${nextDue.isOverdue ? 'text-red-600' : 'text-blue-600'}`}
                      >
                        {nextDue.isOverdue && (
                          <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                        )}
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="font-medium">{nextDue.text}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Form */}
      {(showAddForm || editingTemplate) && (
        <RecurringForm
          categories={categories}
          recurringTemplate={editingTemplate || undefined}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingTemplate}
        onOpenChange={() => setDeletingTemplate(null)}
      >
        <AlertDialogContent className="mx-3 max-w-sm sm:mx-auto sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg">
              Excluir Transação Recorrente
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">
              Tem certeza de que deseja excluir esta transação recorrente? Esta
              ação não pode ser desfeita.
            </AlertDialogDescription>
            {deletingTemplate && (
              <div className="mt-2 rounded bg-gray-50 p-2 sm:p-3">
                <p className="text-sm font-medium sm:text-base">
                  {deletingTemplate.type === 'EXPENSE' ? 'Despesa' : 'Receita'}:
                  R${' '}
                  {parseFloat(deletingTemplate.amount)
                    .toFixed(2)
                    .replace('.', ',')}
                </p>
                {deletingTemplate.description && (
                  <p className="text-xs text-gray-600 sm:text-sm">
                    {deletingTemplate.description}
                  </p>
                )}
              </div>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-3">
            <AlertDialogCancel className="text-xs sm:text-sm">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 text-xs hover:bg-red-700 sm:text-sm"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

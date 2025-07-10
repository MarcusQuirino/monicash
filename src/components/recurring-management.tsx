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
      WEEKLY: interval === 1 ? 'Weekly' : `Every ${interval} weeks`,
      MONTHLY: interval === 1 ? 'Monthly' : `Every ${interval} months`,
      YEARLY: interval === 1 ? 'Yearly' : `Every ${interval} years`,
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
      return { text: `${Math.abs(diffDays)} days overdue`, isOverdue: true };
    } else if (diffDays === 0) {
      return { text: 'Due today', isOverdue: false };
    } else if (diffDays === 1) {
      return { text: 'Due tomorrow', isOverdue: false };
    } else {
      return { text: `Due in ${diffDays} days`, isOverdue: false };
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
        <div className="text-lg text-gray-600">
          Loading recurring transactions...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Recurring Transactions</h2>
          <p className="text-gray-600">
            Manage your subscriptions and recurring payments
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Recurring Transaction
        </Button>
      </div>

      {recurringTemplates.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Repeat className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium">
              No recurring transactions
            </h3>
            <p className="mt-2 text-gray-500">
              Get started by creating your first recurring transaction
            </p>
            <Button className="mt-4" onClick={() => setShowAddForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Recurring Transaction
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recurringTemplates.map((template) => {
            const nextDue = getNextDueDate(template);
            return (
              <Card key={template.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <CardTitle className="text-lg">
                        R${' '}
                        {parseFloat(template.amount)
                          .toFixed(2)
                          .replace('.', ',')}
                      </CardTitle>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(template)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(template)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {template.description && (
                    <p className="text-sm text-gray-600">
                      {template.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={
                        template.type === 'EXPENSE' ? 'destructive' : 'default'
                      }
                    >
                      {template.type === 'EXPENSE' ? 'Expense' : 'Income'}
                    </Badge>
                    <Badge
                      variant={template.isActive ? 'default' : 'secondary'}
                    >
                      {template.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  {template.category && (
                    <div className="flex items-center space-x-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{
                          backgroundColor: template.category.color || '#gray',
                        }}
                      />
                      <span className="text-sm text-gray-600">
                        {template.category.name}
                      </span>
                    </div>
                  )}

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Repeat className="h-4 w-4 text-gray-500" />
                      <span>
                        {formatFrequency(template.frequency, template.interval)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>Started: {formatDate(template.startDate)}</span>
                    </div>

                    {template.endDate && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>Ends: {formatDate(template.endDate)}</span>
                      </div>
                    )}

                    {template.isActive && (
                      <div
                        className={`flex items-center space-x-2 ${nextDue.isOverdue ? 'text-red-600' : 'text-blue-600'}`}
                      >
                        {nextDue.isOverdue && (
                          <AlertCircle className="h-4 w-4" />
                        )}
                        <Calendar className="h-4 w-4" />
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Recurring Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this recurring transaction? This
              action cannot be undone.
            </AlertDialogDescription>
            {deletingTemplate && (
              <div className="mt-2 rounded bg-gray-50 p-3">
                <p className="font-medium">
                  {deletingTemplate.type === 'EXPENSE' ? 'Expense' : 'Income'}:
                  R$ {parseFloat(deletingTemplate.amount).toFixed(2)}
                </p>
                {deletingTemplate.description && (
                  <p className="text-sm text-gray-600">
                    {deletingTemplate.description}
                  </p>
                )}
              </div>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

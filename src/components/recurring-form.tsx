'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type {
  Category,
  RecurringTemplate,
  RecurringType,
  Frequency,
} from '@/lib/types';

type RecurringFormProps = {
  categories: Category[];
  recurringTemplate?: RecurringTemplate;
  onClose: () => void;
  onSuccess: () => void;
};

export function RecurringForm({
  categories,
  recurringTemplate,
  onClose,
  onSuccess,
}: RecurringFormProps) {
  const [formData, setFormData] = useState({
    type: (recurringTemplate?.type || 'EXPENSE') as RecurringType,
    amount: recurringTemplate?.amount || '',
    description: recurringTemplate?.description || '',
    categoryId: recurringTemplate?.categoryId
      ? recurringTemplate.categoryId.toString()
      : '',
    frequency: (recurringTemplate?.frequency || 'MONTHLY') as Frequency,
    interval: recurringTemplate?.interval || 1,
    startDate: recurringTemplate?.startDate
      ? new Date(recurringTemplate.startDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    endDate: recurringTemplate?.endDate
      ? new Date(recurringTemplate.endDate).toISOString().split('T')[0]
      : '',
    isActive: recurringTemplate?.isActive ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await fetch('/api/recurring-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create recurring template');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-templates'] });
      onSuccess();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await fetch(
        `/api/recurring-templates/${recurringTemplate!.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update recurring template');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-templates'] });
      onSuccess();
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'O valor deve ser maior que 0';
    }

    if (formData.type === 'EXPENSE' && !formData.categoryId) {
      newErrors.categoryId = 'Categoria é obrigatória para despesas';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Data de início é obrigatória';
    }

    if (
      formData.endDate &&
      new Date(formData.endDate) <= new Date(formData.startDate)
    ) {
      newErrors.endDate = 'Data de fim deve ser posterior à data de início';
    }

    if (formData.interval < 1) {
      newErrors.interval = 'Intervalo deve ser pelo menos 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const submitData = {
      ...formData,
      amount: parseFloat(formData.amount),
      categoryId:
        formData.type === 'EXPENSE' ? parseInt(formData.categoryId) : null,
      endDate: formData.endDate || null,
    };

    try {
      if (recurringTemplate) {
        await updateMutation.mutateAsync(submitData);
      } else {
        await createMutation.mutateAsync(submitData);
      }
    } catch (error) {
      console.error('Error saving recurring template:', error);
    }
  };

  const handleInputChange = (
    field: string,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {recurringTemplate
              ? 'Editar Transação Recorrente'
              : 'Criar Transação Recorrente'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select
              value={formData.type}
              onValueChange={(value: RecurringType) =>
                handleInputChange('type', value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EXPENSE">Despesa</SelectItem>
                <SelectItem value="INCOME">Receita</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              placeholder="0,00"
              className={errors.amount ? 'border-red-500' : ''}
            />
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Digite a descrição..."
              rows={3}
            />
          </div>

          {formData.type === 'EXPENSE' && (
            <div className="space-y-2">
              <Label htmlFor="categoryId">Categoria</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) =>
                  handleInputChange('categoryId', value)
                }
              >
                <SelectTrigger
                  className={errors.categoryId ? 'border-red-500' : ''}
                >
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id.toString()}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-sm text-red-500">{errors.categoryId}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequência</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value: Frequency) =>
                  handleInputChange('frequency', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a frequência" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WEEKLY">Semanal</SelectItem>
                  <SelectItem value="MONTHLY">Mensal</SelectItem>
                  <SelectItem value="YEARLY">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interval">A cada</Label>
              <Input
                id="interval"
                type="number"
                min="1"
                value={formData.interval}
                onChange={(e) =>
                  handleInputChange('interval', parseInt(e.target.value))
                }
                className={errors.interval ? 'border-red-500' : ''}
              />
              {errors.interval && (
                <p className="text-sm text-red-500">{errors.interval}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Data de Início</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className={errors.startDate ? 'border-red-500' : ''}
              />
              {errors.startDate && (
                <p className="text-sm text-red-500">{errors.startDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Data de Fim (Opcional)</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className={errors.endDate ? 'border-red-500' : ''}
              />
              {errors.endDate && (
                <p className="text-sm text-red-500">{errors.endDate}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
            />
            <Label htmlFor="isActive">Ativo</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? 'Salvando...'
                : recurringTemplate
                  ? 'Atualizar'
                  : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

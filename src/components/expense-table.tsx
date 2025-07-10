"use client";

import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import type { Transaction, Category } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Edit,
  Trash2,
  Calendar,
  Tag,
  FileText,
  TrendingUp,
  TrendingDown,
  Check,
  X,
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

type EditingState = {
  transactionId: number;
  transactionType: "expense" | "income";
  field: "date" | "description" | "amount" | "category";
  value: string;
} | null;

export function ExpenseTable({
  transactions,
  onEditExpense,
  onEditIncome,
  onViewDetails,
}: TransactionTableProps) {
  const queryClient = useQueryClient();
  const [editingState, setEditingState] = useState<EditingState>(null);

  // Fetch categories for inline editing
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Falha ao buscar categorias");
      return response.json();
    },
  });

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

  const updateExpenseMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<Transaction>;
    }) => {
      const response = await fetch(`/api/expenses/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Falha ao atualizar gasto");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      setEditingState(null);
    },
  });

  const updateIncomeMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<Transaction>;
    }) => {
      const response = await fetch(`/api/incomes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Falha ao atualizar entrada");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incomes"] });
      queryClient.invalidateQueries({ queryKey: ["expenses"] }); // Refresh combined view
      setEditingState(null);
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

  const startInlineEdit = (
    transaction: Transaction,
    field: "date" | "description" | "amount" | "category"
  ) => {
    let value = "";
    switch (field) {
      case "date":
        value = new Date(transaction.date).toISOString().split("T")[0];
        break;
      case "description":
        value = transaction.description || "";
        break;
      case "amount":
        value = transaction.amount;
        break;
      case "category":
        value = transaction.type === "expense" && transaction.category 
          ? transaction.category.id.toString() 
          : "";
        break;
    }

    setEditingState({
      transactionId: transaction.id,
      transactionType: transaction.type,
      field,
      value,
    });
  };

  const saveInlineEdit = () => {
    if (!editingState) return;

    const { transactionId, transactionType, field, value } = editingState;
    
    let updateData: any = {};
    
    switch (field) {
      case "date":
        updateData.date = value;
        break;
      case "description":
        updateData.description = value;
        break;
      case "amount":
        const numericValue = parseFloat(value);
        if (isNaN(numericValue) || numericValue <= 0) {
          alert("Por favor, insira um valor válido maior que zero");
          return;
        }
        updateData.amount = value;
        break;
      case "category":
        if (transactionType === "expense") {
          const categoryId = parseInt(value);
          if (isNaN(categoryId)) {
            alert("Por favor, selecione uma categoria válida");
            return;
          }
          updateData.categoryId = categoryId;
        }
        break;
    }

    if (transactionType === "expense") {
      updateExpenseMutation.mutate({ id: transactionId, data: updateData });
    } else {
      updateIncomeMutation.mutate({ id: transactionId, data: updateData });
    }
  };

  const cancelInlineEdit = () => {
    setEditingState(null);
  };

  const isEditing = (transaction: Transaction, field: string) => {
    return (
      editingState &&
      editingState.transactionId === transaction.id &&
      editingState.transactionType === transaction.type &&
      editingState.field === field
    );
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

      {/* Desktop Table Layout with Inline Editing */}
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
                className={`${
                  transaction.type === "income"
                    ? "bg-green-50 hover:bg-green-100"
                    : "hover:bg-gray-50"
                }`}
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
                
                {/* Date Cell - Inline Editable */}
                <TableCell
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => startInlineEdit(transaction, "date")}
                >
                  {isEditing(transaction, "date") ? (
                    <div className="flex items-center space-x-2">
                      <Input
                        type="date"
                        value={editingState?.value || ""}
                        onChange={(e) =>
                          setEditingState(prev => prev ? { ...prev, value: e.target.value } : null)
                        }
                        className="w-36"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveInlineEdit();
                          if (e.key === "Escape") cancelInlineEdit();
                        }}
                        autoFocus
                      />
                      <Button size="sm" variant="ghost" onClick={saveInlineEdit}>
                        <Check className="w-4 h-4 text-green-600" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={cancelInlineEdit}>
                        <X className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  ) : (
                    <span className="hover:underline">
                      {new Date(transaction.date).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                </TableCell>

                {/* Description Cell - Inline Editable */}
                <TableCell
                  className="max-w-[200px] cursor-pointer hover:bg-gray-100"
                  title={transaction.description || ""}
                  onClick={() => startInlineEdit(transaction, "description")}
                >
                  {isEditing(transaction, "description") ? (
                    <div className="flex items-center space-x-2">
                      <Input
                        value={editingState?.value || ""}
                        onChange={(e) =>
                          setEditingState(prev => prev ? { ...prev, value: e.target.value } : null)
                        }
                        className="min-w-[150px]"
                        placeholder="Descrição..."
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveInlineEdit();
                          if (e.key === "Escape") cancelInlineEdit();
                        }}
                        autoFocus
                      />
                      <Button size="sm" variant="ghost" onClick={saveInlineEdit}>
                        <Check className="w-4 h-4 text-green-600" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={cancelInlineEdit}>
                        <X className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  ) : (
                    <span className="hover:underline">
                      {transaction.description
                        ? truncateText(transaction.description)
                        : "-"}
                    </span>
                  )}
                </TableCell>

                {/* Category Cell - Inline Editable (only for expenses) */}
                <TableCell
                  className={transaction.type === "expense" ? "cursor-pointer hover:bg-gray-100" : ""}
                  onClick={() => transaction.type === "expense" && startInlineEdit(transaction, "category")}
                >
                  {transaction.type === "expense" && isEditing(transaction, "category") ? (
                    <div className="flex items-center space-x-2">
                      <Select
                        value={editingState?.value || ""}
                        onValueChange={(value) =>
                          setEditingState(prev => prev ? { ...prev, value } : null)
                        }
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button size="sm" variant="ghost" onClick={saveInlineEdit}>
                        <Check className="w-4 h-4 text-green-600" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={cancelInlineEdit}>
                        <X className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  ) : transaction.type === "expense" && transaction.category ? (
                    <span
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium hover:opacity-80"
                      style={getCategoryBadgeStyles(transaction.category.color)}
                    >
                      {transaction.category.name}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">-</span>
                  )}
                </TableCell>

                {/* Amount Cell - Inline Editable */}
                <TableCell
                  className="text-right cursor-pointer hover:bg-gray-100"
                  onClick={() => startInlineEdit(transaction, "amount")}
                >
                  {isEditing(transaction, "amount") ? (
                    <div className="flex items-center justify-end space-x-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editingState?.value || ""}
                        onChange={(e) =>
                          setEditingState(prev => prev ? { ...prev, value: e.target.value } : null)
                        }
                        className="w-24 text-right"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveInlineEdit();
                          if (e.key === "Escape") cancelInlineEdit();
                        }}
                        autoFocus
                      />
                      <Button size="sm" variant="ghost" onClick={saveInlineEdit}>
                        <Check className="w-4 h-4 text-green-600" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={cancelInlineEdit}>
                        <X className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  ) : (
                    <span
                      className={`font-medium hover:underline ${
                        transaction.type === "income"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}R${" "}
                      {parseFloat(transaction.amount).toFixed(2).replace(".", ",")}
                    </span>
                  )}
                </TableCell>

                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(transaction)}
                      title="Ver detalhes"
                    >
                      <FileText className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(transaction)}
                      title="Editar em modal"
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

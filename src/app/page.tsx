import { Suspense } from "react";
import { ExpenseDashboard } from "@/components/expense-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Monicash</h1>
          <p className="text-gray-600 mt-2">Controle de Gastos Pessoais</p>
        </div>

        <Suspense
          fallback={
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      Carregando...
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          }
        >
          <ExpenseDashboard />
        </Suspense>
      </div>
    </div>
  );
}

import { Suspense } from 'react';
import { prisma } from '@/lib/db';
import { RecurringManagement } from '@/components/recurring-management';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

async function getCategories() {
  try {
    const categoriesFromDb = await prisma.category.findMany({
      include: {
        _count: {
          select: { expenses: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Convert database types to application types
    const categories = categoriesFromDb.map((category) => ({
      id: category.id,
      name: category.name,
      color: category.color || undefined,
      _count: category._count,
    }));

    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Failed to fetch categories');
  }
}

export default async function RecurringPage() {
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl">
            Transações Recorrentes
          </h1>
          <p className="mt-1 text-xs text-gray-600 sm:mt-2 sm:text-sm lg:text-base">
            Gerencie suas assinaturas e pagamentos recorrentes
          </p>
        </div>

        <div className="mb-4 sm:mb-6">
          <Navigation />
        </div>

        <Suspense
          fallback={
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      Carregando...
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-16 animate-pulse rounded bg-gray-200 sm:h-20"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          }
        >
          <RecurringManagement categories={categories} />
        </Suspense>
      </div>
    </div>
  );
}

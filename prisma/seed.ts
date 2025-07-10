import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Populando banco de dados...');

  const categories = [
    { name: 'Alimentação', color: '#FF6B6B' },
    { name: 'Transporte', color: '#4ECDC4' },
    { name: 'Saúde', color: '#45B7D1' },
    { name: 'Compras', color: '#96CEB4' },
    { name: 'Entretenimento', color: '#FFEAA7' },
    { name: 'Contas e Serviços', color: '#DDA0DD' },
    { name: 'Outros', color: '#95A5A6' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

  console.log('✅ Dados inseridos com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

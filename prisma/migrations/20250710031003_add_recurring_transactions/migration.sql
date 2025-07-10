-- CreateEnum
CREATE TYPE "RecurringType" AS ENUM ('EXPENSE', 'INCOME');

-- CreateEnum
CREATE TYPE "Frequency" AS ENUM ('WEEKLY', 'MONTHLY', 'YEARLY');

-- AlterTable
ALTER TABLE "expenses" ADD COLUMN     "is_auto_generated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "recurring_template_id" INTEGER;

-- AlterTable
ALTER TABLE "incomes" ADD COLUMN     "is_auto_generated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "recurring_template_id" INTEGER;

-- CreateTable
CREATE TABLE "recurring_templates" (
    "id" SERIAL NOT NULL,
    "type" "RecurringType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "category_id" INTEGER,
    "frequency" "Frequency" NOT NULL,
    "interval" INTEGER NOT NULL DEFAULT 1,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "next_due_date" DATE NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recurring_templates_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_recurring_template_id_fkey" FOREIGN KEY ("recurring_template_id") REFERENCES "recurring_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incomes" ADD CONSTRAINT "incomes_recurring_template_id_fkey" FOREIGN KEY ("recurring_template_id") REFERENCES "recurring_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_templates" ADD CONSTRAINT "recurring_templates_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

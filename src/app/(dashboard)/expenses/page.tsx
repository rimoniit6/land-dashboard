import { prisma } from "@/lib/prisma";
import { ExpenseList } from "@/components/expenses/ExpenseList";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const expenses = await prisma.expense.findMany({
    orderBy: { date: "desc" }
  });

  return <ExpenseList initialExpenses={expenses} />;
}

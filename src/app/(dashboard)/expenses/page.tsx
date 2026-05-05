import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ExpenseList } from "@/components/expenses/ExpenseList";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const [expenses, session] = await Promise.all([
    prisma.expense.findMany({ orderBy: { date: "desc" } }),
    getServerSession(authOptions)
  ]);

  const isViewer = (session?.user as any)?.role === "VIEWER";

  return <ExpenseList initialExpenses={expenses} isViewer={isViewer} />;
}

"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";

interface OverviewChartProps {
  transactions: any[];
}

export function OverviewChart({ transactions }: OverviewChartProps) {
  const chartData = useMemo(() => {
    // Group transactions by month
    const grouped = transactions.reduce((acc, tx) => {
      const date = new Date(tx.date);
      // Format: "Jan 2024"
      const monthYear = date.toLocaleString('default', { month: 'short' }) + " " + date.getFullYear();
      
      if (!acc[monthYear]) {
        acc[monthYear] = {
          name: monthYear,
          timestamp: date.getTime(), // for sorting
          inflow: 0,
          outflow: 0
        };
      }

      if (["CONTRIBUTION", "FINE", "LOAN_REPAYMENT", "PROFIT", "DEPOSIT"].includes(tx.type)) {
        acc[monthYear].inflow += tx.amount;
      } else if (["LOAN", "INVESTMENT", "EXPENSE", "DISTRIBUTION"].includes(tx.type)) {
        acc[monthYear].outflow += tx.amount;
      }

      return acc;
    }, {} as Record<string, any>);

    // Convert to array and sort chronologically
    return Object.values(grouped).sort((a: any, b: any) => a.timestamp - b.timestamp).slice(-6); // Last 6 months
  }, [transactions]);

  if (chartData.length === 0) {
      return (
        <div className="h-[350px] flex items-center justify-center text-slate-500">
            No transaction data available yet.
        </div>
      )
  }

  return (
    <div className="h-[350px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} tickFormatter={(value) => `৳${value}`} />
          <Tooltip 
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value: any) => [`৳${Number(value).toLocaleString()}`, "Amount"]}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Bar dataKey="inflow" name="Total Inflow" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
          <Bar dataKey="outflow" name="Total Outflow" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

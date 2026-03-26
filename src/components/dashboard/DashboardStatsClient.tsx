"use client";

import { useState } from "react";
import { Users, Wallet, AlertTriangle, PiggyBank, Banknote, TrendingUp, HandCoins, Receipt, X, Calculator } from "lucide-react";

export function DashboardStatsClient({ data, recentActivities = [] }: { data: any, recentActivities?: any[] }) {
  const [selectedStat, setSelectedStat] = useState<any>(null);

  const stats = [
    { 
      id: "members",
      name: "Total Members", 
      value: data.members.toString(), 
      icon: Users, color: "text-blue-600", bg: "bg-blue-100",
      formula: "Count of all ACTIVE members currently in the system.",
      breakdown: []
    },
    { 
      id: "companyBalance",
      name: "Company Balance", 
      value: `৳${data.companyBalance.toLocaleString()}`, 
      icon: PiggyBank, color: "text-emerald-600", bg: "bg-emerald-100",
      formula: "(Contributions + Fines + Company Profit + Member Profit) - (Expenses + Active Investments + Active Loans + Withdrawals) = Company Balance",
      breakdown: [
        { label: "Total Contributions", value: `+ ৳${data.totalContributions.toLocaleString()}`, isPositive: true },
        { label: "Total Fines Collected", value: `+ ৳${data.totalFines.toLocaleString()}`, isPositive: true },
        { label: "Total Company Profit", value: `+ ৳${data.totalCompanyProfit.toLocaleString()}`, isPositive: true },
        { label: "Total Profit Given to Members", value: `+ ৳${data.totalProfitGiven.toLocaleString()}`, isPositive: true },
        { label: "Total Expenses", value: `- ৳${data.totalExpenses.toLocaleString()}`, isPositive: false },
        { label: "Active Investments", value: `- ৳${data.activeInvestments.toLocaleString()}`, isPositive: false },
        { label: "Active Loans Given", value: `- ৳${data.activeLoans.toLocaleString()}`, isPositive: false },
        { label: "Total Withdrawals", value: `- ৳${data.totalWithdrawals.toLocaleString()}`, isPositive: false },
        { label: "Net Company Balance", value: `= ৳${data.companyBalance.toLocaleString()}`, isTotal: true }
      ]
    },
    { 
      id: "totalContributions",
      name: "Total Contributions", 
      value: `৳${data.totalContributions.toLocaleString()}`, 
      icon: Wallet, color: "text-indigo-600", bg: "bg-indigo-100",
      formula: "Sum of all contributions made by all members.",
      breakdown: []
    },
    { 
      id: "totalFines",
      name: "Total Fines Collected", 
      value: `৳${data.totalFines.toLocaleString()}`, 
      icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-100",
      formula: "Sum of all fines collected from members.",
      breakdown: []
    },
    { 
      id: "activeLoans",
      name: "Active Loans Given", 
      value: `৳${data.activeLoans.toLocaleString()}`, 
      icon: Banknote, color: "text-rose-600", bg: "bg-rose-100",
      formula: "Sum of remaining balances of all ongoing active loans.",
      breakdown: []
    },
    { 
      id: "activeInvestments",
      name: "Active Investments", 
      value: `৳${data.activeInvestments.toLocaleString()}`, 
      icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-100",
      formula: "Sum of all active investments that have not been returned yet.",
      breakdown: []
    },
    { 
      id: "netCompanyProfit",
      name: "Total Company Profit", 
      value: `৳${(data.totalFines + data.totalCompanyProfit - data.totalExpenses - data.totalDistributed).toLocaleString()}`, 
      icon: HandCoins, color: "text-teal-600", bg: "bg-teal-100",
      formula: "Total Fines + Investment Company Profit - Total Expenses - Total Distributed = Net Company Profit",
      breakdown: [
        { label: "Total Fines Collected", value: `+ ৳${data.totalFines.toLocaleString()}`, isPositive: true },
        { label: "Investment Company Profit", value: `+ ৳${data.totalCompanyProfit.toLocaleString()}`, isPositive: true },
        { label: "Total Expenses", value: `- ৳${data.totalExpenses.toLocaleString()}`, isPositive: false },
        { label: "Total Distributed (Distributions)", value: `- ৳${data.totalDistributed.toLocaleString()}`, isPositive: false },
        { label: "Net Company Profit", value: `= ৳${(data.totalFines + data.totalCompanyProfit - data.totalExpenses - data.totalDistributed).toLocaleString()}`, isTotal: true }
      ]
    },
    { 
      id: "totalExpenses",
      name: "Total Expenses", 
      value: `৳${data.totalExpenses.toLocaleString()}`, 
      icon: Receipt, color: "text-red-600", bg: "bg-red-100",
      formula: "Sum of all recorded company expenses.",
      breakdown: []
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div 
            key={stat.name} 
            onClick={() => setSelectedStat(stat)}
            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition hover:shadow-md cursor-pointer hover:border-blue-300 hover:ring-2 hover:ring-blue-100 select-none"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.name}</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">{stat.value}</p>
              </div>
              <div className={`h-12 w-12 rounded-full flex items-center justify-center ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedStat && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-6"
          onClick={() => setSelectedStat(null)}
        >
          <div 
            className="bg-white rounded-xl shadow-xl w-full max-w-lg sm:max-w-xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-zinc-100 bg-slate-50 shrink-0">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${selectedStat.bg}`}>
                  <selectedStat.icon className={`h-5 w-5 ${selectedStat.color}`} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900">{selectedStat.name}</h2>
                  <p className="text-sm text-zinc-500">Activity & Calculation Details</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedStat(null)} 
                className="text-zinc-400 hover:text-zinc-600 transition p-1 hover:bg-zinc-200 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="bg-blue-50/50 rounded-lg p-3 sm:p-4 border border-blue-100 flex gap-3">
                <Calculator className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-sm text-blue-900 leading-relaxed font-medium">
                  {selectedStat.formula}
                </p>
              </div>

              {selectedStat.breakdown.length > 0 && (
                <div className="space-y-3 shrink-0">
                  <h3 className="text-sm font-semibold text-slate-900">Variables & Calculation</h3>
                  <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden divide-y divide-slate-100">
                    {selectedStat.breakdown.map((item: any, idx: number) => (
                      <div key={idx} className={`flex justify-between items-center p-3 text-sm flex-wrap gap-2 ${item.isTotal ? 'bg-slate-100 font-bold border-t-2 border-slate-200' : ''}`}>
                        <span className="text-slate-600 break-words">{item.label}</span>
                        <span className={`whitespace-nowrap ${
                          item.isTotal ? 'text-slate-900 text-base' :
                          item.isPositive ? 'text-emerald-600 font-medium' : 
                          'text-rose-600 font-medium'
                        }`}>
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedStat.id === "companyBalance" && recentActivities.length > 0 && (
                <div className="space-y-3 mt-6">
                  <h3 className="text-sm font-semibold text-slate-900">Recent Company Activity History</h3>
                  <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-4">
                    {recentActivities.map((log: any) => (
                      <div key={log.id} className="flex gap-4">
                        <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-slate-800">{log.actionType}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{log.description}</p>
                          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">
                            {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
              <button 
                onClick={() => setSelectedStat(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg transition text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

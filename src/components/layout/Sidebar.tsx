"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart3, 
  Users, 
  Wallet, 
  AlertTriangle, 
  Banknote, 
  TrendingUp, 
  Receipt, 
  PiggyBank, 
  ArrowRightLeft, 
  FileText, 
  Settings,
  LogOut 
} from "lucide-react";
import { signOut } from "next-auth/react";

const navItems = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Members", href: "/members", icon: Users },
  { name: "Contributions", href: "/contributions", icon: Wallet },
  { name: "Fines", href: "/fines", icon: AlertTriangle },
  { name: "Loans", href: "/loans", icon: Banknote },
  { name: "Investments", href: "/investments", icon: TrendingUp },
  { name: "Expenses", href: "/expenses", icon: Receipt },
  { name: "Company Account", href: "/company", icon: PiggyBank },
  { name: "Distributions", href: "/distributions", icon: ArrowRightLeft },
  { name: "Activities & Ledger", href: "/transactions", icon: FileText },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 bg-slate-900 border-r border-slate-800 h-screen transition-all select-none hidden md:flex">
      <div className="flex items-center justify-center h-16 bg-blue-600 shrink-0">
        <h1 className="text-white text-xl font-bold tracking-widest">LAND PRO</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1 scrollbar-thin scrollbar-thumb-slate-700">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? "bg-blue-600/10 text-blue-400" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? "text-blue-400" : "opacity-70"}`} />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 w-full"
        >
          <LogOut className="h-5 w-5 opacity-70" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

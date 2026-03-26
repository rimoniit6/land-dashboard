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
  LogOut,
  X
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useSidebar } from "@/components/layout/SidebarContext";

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
  const { isOpen, setIsOpen } = useSidebar();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 h-screen transition-transform duration-300 ease-in-out md:relative md:translate-x-0 select-none flex flex-col
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="flex items-center justify-between h-16 bg-blue-600 shrink-0 px-4 md:justify-center">
          <h1 className="text-white text-xl font-bold tracking-widest mt-1">LAND PRO</h1>
          <button 
            onClick={() => setIsOpen(false)}
            className="md:hidden text-blue-100 hover:text-white hover:bg-blue-700 p-1.5 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
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
    </>
  );
}

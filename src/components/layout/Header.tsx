"use client";

import { useSession } from "next-auth/react";
import { User, Bell, Menu, Eye } from "lucide-react";
import { useSidebar } from "@/components/layout/SidebarContext";
import Link from "next/link";

export function Header() {
  const { data: session } = useSession();
  const { toggle } = useSidebar();
  const isAuthenticated = !!session?.user;

  return (
    <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-10 w-full">
      <div className="flex items-center gap-2 md:gap-4">
        <button 
          onClick={toggle}
          className="md:hidden p-2 -ml-2 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
        
        {!isAuthenticated && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
            <Eye className="h-4 w-4 text-amber-600" />
            <span className="text-sm text-amber-700 font-medium">View Mode</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        {!isAuthenticated ? (
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Login to Edit
          </Link>
        ) : (
          <>
            <button className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600 border-2 border-white"></span>
            </button>
            
            <div className="flex items-center gap-3 pl-4 border-l border-zinc-200">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-medium text-zinc-900">{session?.user?.name || "Admin"}</span>
                <span className="text-xs text-zinc-500">
                  {(session?.user as any)?.role === "VIEWER" ? "Viewer (Read-only)" : "System Administrator"}
                </span>
              </div>
              <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                <User className="h-5 w-5" />
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

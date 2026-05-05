import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { SidebarProvider } from "@/components/layout/SidebarContext";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const userName = (session?.user as any)?.name || "Admin";
  const userRole = (session?.user as any)?.role === "VIEWER" ? "Read Only Viewer" : "System Administrator";

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-zinc-50 overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden w-full">
          <Header userName={userName} userRole={userRole} />
          
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 relative p-4 md:p-6">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

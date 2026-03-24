import { prisma } from "@/lib/prisma";
import { Activity } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ActivityLogPage() {
  const logs = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 500, // Fetch last 500 events
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Activity Log</h1>
        <p className="text-slate-500 mt-1">A detailed audit trail of actions performed within the system.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2 text-slate-500 font-medium">
            <Activity className="h-5 w-5" />
            <span>Recent Events (Showing up to 500)</span>
        </div>
        <div className="divide-y divide-slate-100">
          {logs.length > 0 ? (
            logs.map(log => (
              <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50">
                <div>
                  <h4 className="font-semibold text-slate-900">{log.actionType}</h4>
                  <p className="text-sm text-slate-600 mt-1">{log.description}</p>
                </div>
                <div className="text-xs text-slate-400 font-medium shrink-0 whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500">
              No activity logs available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

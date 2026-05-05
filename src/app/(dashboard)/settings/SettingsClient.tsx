"use client";

import { useState } from "react";
import { Download, AlertTriangle, ShieldAlert, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsClient() {
  const [resetCount, setResetCount] = useState(0);
  const [isResetting, setIsResetting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const router = useRouter();
  const [isImporting, setIsImporting] = useState(false);

  const handleDownload = () => {
    window.open("/api/settings/db/download", "_blank");
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm("WARNING: This will instantly replace all current data with the uploaded database backup. This action cannot be undone. Do you want to continue?")) {
      e.target.value = ""; // Reset input
      return;
    }

    setIsImporting(true);
    setMessage({ text: "", type: "" });
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/settings/db/import", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to import database");
      }

      setMessage({ text: "Database has been successfully restored!", type: "success" });
      setTimeout(() => {
        router.refresh();
      }, 1500);
    } catch (error: any) {
      setMessage({ text: error.message || "An error occurred while importing.", type: "error" });
    } finally {
      setIsImporting(false);
      e.target.value = ""; 
    }
  };

  const handleReset = async () => {
    if (resetCount < 3) {
      setResetCount((prev) => prev + 1);
      setMessage({
        text: `Warning: This will delete almost all data! Click ${3 - resetCount} more times to confirm.`,
        type: "error"
      });
      return;
    }

    setIsResetting(true);
    setMessage({ text: "", type: "" });
    try {
      const res = await fetch("/api/settings/db/reset", {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to reset database");
      }

      setMessage({ text: "Database has been successfully reset!", type: "success" });
      setResetCount(0);
      router.refresh();
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (error) {
      setMessage({ text: "An error occurred while resetting the database.", type: "error" });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Database Management</h2>
            <p className="text-sm text-slate-500">Backup or clear your entire system database</p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {message.text && (
            <div className={`p-4 rounded-lg border ${message.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
              {message.text}
            </div>
          )}

          {/* Download DB */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
            <div>
              <h3 className="font-medium text-slate-900">Download Database</h3>
              <p className="text-sm text-slate-500 mt-1">
                Download a complete copy of the SQLite database file for backup purposes.
              </p>
            </div>
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shrink-0 font-medium text-sm"
            >
              <Download className="w-4 h-4" />
              Download Backup
            </button>
          </div>

          {/* Import DB */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-orange-50 rounded-lg border border-orange-100">
            <div>
              <h3 className="font-medium text-orange-900">Import / Restore Database</h3>
              <p className="text-sm text-orange-700 mt-1">
                Upload a backup `.db` file to completely restore your system history to that snapshot.
              </p>
            </div>
            <div>
              <input 
                type="file" 
                id="db-upload" 
                accept=".db" 
                className="hidden" 
                onChange={handleImport} 
                disabled={isImporting}
              />
              <label 
                htmlFor="db-upload"
                className={`flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg transition-colors shrink-0 font-medium text-sm cursor-pointer hover:bg-orange-700 ${isImporting ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <Upload className="w-4 h-4" />
                {isImporting ? "Restoring..." : "Restore Backup"}
              </label>
            </div>
          </div>

          {/* Reset DB */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-red-50 rounded-lg border border-red-100">
            <div>
              <h3 className="font-medium text-red-900">Danger Zone: Reset Database</h3>
              <p className="text-sm text-red-700 mt-1">
                This will permanently delete all transactional records, members, loans, and settings except the core company rules. This action cannot be undone!
              </p>
            </div>
            <button
              onClick={handleReset}
              disabled={isResetting}
              className={`flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg transition-colors shrink-0 font-medium text-sm ${
                resetCount > 0 ? "bg-red-700 hover:bg-red-800 animate-pulse" : "bg-red-600 hover:bg-red-700"
              } disabled:opacity-50 disabled:animate-none`}
            >
              <AlertTriangle className="w-4 h-4" />
              {isResetting 
                ? "Resetting..." 
                : resetCount === 0 
                  ? "Reset Database" 
                  : `Click ${4 - resetCount} times to confirm`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

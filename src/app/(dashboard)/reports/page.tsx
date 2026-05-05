"use client";

import { useState } from "react";
import { FileSpreadsheet, FileText, Download } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);

  const downloadExcel = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/transactions?type=all");
      const data = await res.json();
      
       const formattedData = data.map((tx: { date: string, type: string, member?: { fullName: string, memberId: string }, description: string, amount: number }) => ({
        Date: new Date(tx.date).toLocaleDateString(),
        Type: tx.type,
        Member: tx.member ? `${tx.member.fullName} (${tx.member.memberId})` : "Company",
        Description: tx.description,
        Amount: tx.amount,
      }));

      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
      XLSX.writeFile(workbook, `Transactions_Ledger_${new Date().toISOString().split("T")[0]}.xlsx`);
    } catch (error) {
       console.error(error);
       alert("Error generating Excel report.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/transactions?type=all");
      const data = await res.json();
      
      const doc = new jsPDF();
      doc.text("Company Financial Ledger", 14, 15);
      
       const tableData = data.map((tx: { date: string, type: string, member?: { fullName: string }, description: string, amount: number }) => [
        new Date(tx.date).toLocaleDateString(),
        tx.type ? tx.type.replace('_', ' ') : '',
        tx.member ? tx.member.fullName : "Company",
        tx.description || "-",
        `TK ${tx.amount?.toLocaleString() || '0'}`
      ]);

      autoTable(doc, {
        head: [['Date', 'Type', 'Entity', 'Description', 'Amount']],
        body: tableData,
        startY: 20,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] }
      });

      doc.save(`Ledger_Report_${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (error) {
       console.error(error);
       alert("Error generating PDF report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reports & Exports</h1>
        <p className="text-slate-500 mt-1">Generate and download financial data for accounting and archiving.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
            <div>
                <div className="h-12 w-12 bg-green-100 text-green-700 rounded-xl flex items-center justify-center mb-4">
                    <FileSpreadsheet className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Excel Export</h2>
                <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                    Download the complete transaction ledger in `.xlsx` format. Best for data analysis and filtering in Microsoft Excel or Google Sheets.
                </p>
            </div>
            
            <button 
                onClick={downloadExcel}
                disabled={loading}
                className="mt-6 w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50"
            >
                <Download className="h-4 w-4" />
                Download Excel File
            </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
            <div>
                <div className="h-12 w-12 bg-red-100 text-red-700 rounded-xl flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">PDF Document</h2>
                <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                    Download a formatted, ready-to-print PDF version of the transaction ledger. Best for official records and meetings.
                </p>
            </div>
            
            <button 
                onClick={downloadPDF}
                disabled={loading}
                className="mt-6 w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50"
            >
                <Download className="h-4 w-4" />
                Download PDF Report
            </button>
        </div>
      </div>
    </div>
  );
}

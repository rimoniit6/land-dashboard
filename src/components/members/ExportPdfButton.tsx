"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export function ExportPdfButton({ memberId }: { memberId: number }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await fetch(`/api/members/${memberId}/export`);
      if (!res.ok) throw new Error("Failed to fetch member data");
      
      const member = await res.json();
      
      // Calculate totals
      const totalContributions = member.contributions.reduce((acc: number, curr: any) => acc + curr.amount, 0);
      const totalFines = member.fines.reduce((acc: number, curr: any) => acc + curr.fineAmount, 0);
      const totalLoans = member.loans.reduce((acc: number, curr: any) => acc + curr.remainingBalance, 0);
      const totalInvestments = member.investments.reduce((acc: number, curr: any) => acc + curr.investmentAmount, 0);
      const totalProfitGiven = member.investments.reduce((acc: number, curr: any) => acc + (curr.memberProfit || 0), 0);
      const totalDistributions = member.distributions.reduce((acc: number, curr: any) => acc + curr.amount, 0);
      const totalWithdrawals = member.transactions.filter((tx: any) => tx.type === "WITHDRAWAL").reduce((acc: number, curr: any) => acc + curr.amount, 0);
      const totalAmount = (totalContributions + totalProfitGiven + totalDistributions) - totalLoans - totalWithdrawals;

      // Start PDF Generate
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(30, 58, 138); // blue-900
      doc.text("LAND Group - Member Activity Report", 14, 22);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
      
      // Profile Info
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text(`Name: ${member.fullName}`, 14, 45);
      doc.text(`ID: ${member.memberId}`, 14, 52);
      doc.text(`Phone: ${member.phone || "N/A"}`, 14, 59);
      doc.text(`Address: ${member.address || "N/A"}`, 100, 45);
      doc.text(`Joined: ${new Date(member.joinDate).toLocaleDateString()}`, 100, 52);
      doc.text(`Status: ${member.status}`, 100, 59);

      // Financial Summary
      doc.setFontSize(14);
      doc.text("Financial Summary", 14, 75);
      
      autoTable(doc, {
        startY: 80,
        headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42] }, // slate-100 / slate-900
        body: [
          ["Total Contributions", `Tk ${totalContributions.toLocaleString()}`],
          ["Total Fines", `Tk ${totalFines.toLocaleString()}`],
          ["Loans Remaining", `Tk ${totalLoans.toLocaleString()}`],
          ["Investments", `Tk ${totalInvestments.toLocaleString()}`],
          ["Profit Given", `Tk ${totalProfitGiven.toLocaleString()}`],
          ["Distributions Received", `Tk ${totalDistributions.toLocaleString()}`],
          ["Net Balance", `Tk ${totalAmount.toLocaleString()}`]
        ],
        theme: 'grid',
        tableWidth: 'wrap'
      });

      const finalY = (doc as any).lastAutoTable.finalY || 80;

      // Transactions Table
      doc.setFontSize(14);
      doc.text("Activity Ledger (All Transactions)", 14, finalY + 15);

      const tableData = member.transactions.map((tx: any) => [
        new Date(tx.date).toLocaleDateString(),
        tx.type.replace(/_/g, " "),
        tx.description || "-",
        (tx.type === "WITHDRAWAL" || tx.type === "LOAN" || tx.type === "EXPENSE" ? "-" : "+") + `Tk ${tx.amount.toLocaleString()}`
      ]);

      if (tableData.length === 0) {
        doc.setFontSize(10);
        doc.text("No transactions found.", 14, finalY + 25);
      } else {
        autoTable(doc, {
          startY: finalY + 20,
          head: [["Date", "Type", "Notes", "Amount"]],
          body: tableData,
          headStyles: { fillColor: [59, 130, 246] }, // blue-500
          styles: { fontSize: 9 },
          alternateRowStyles: { fillColor: [248, 250, 252] }, // slate-50
        });
      }

      // Download
      doc.save(`${member.fullName.replace(/\s+/g, "_")}_Activity_Report.pdf`);

    } catch (error) {
      console.error(error);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button 
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition font-medium text-sm disabled:opacity-50"
    >
      <Download className="h-4 w-4 shrink-0" />
      {isExporting ? "Generating..." : "Export PDF"}
    </button>
  );
}

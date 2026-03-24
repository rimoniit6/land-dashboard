"use client";

import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import { useRouter } from "next/navigation";

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member?: any; // If member exists, it's edit mode
}

export function MemberModal({ isOpen, onClose, member }: MemberModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    memberId: "",
    fullName: "",
    phone: "",
    address: "",
    status: "ACTIVE",
    joinDate: new Date().toISOString().split("T")[0],
    nomineeName: "",
    nomineeRelation: "",
    nomineePhone: "",
  });

  useEffect(() => {
    if (member) {
      setFormData({
        memberId: member.memberId,
        fullName: member.fullName,
        phone: member.phone || "",
        address: member.address || "",
        status: member.status,
        joinDate: new Date(member.joinDate).toISOString().split("T")[0],
        nomineeName: member.nomineeName || "",
        nomineeRelation: member.nomineeRelation || "",
        nomineePhone: member.nomineePhone || "",
      });
    } else {
      setFormData({
        memberId: `M-${Math.floor(Math.random() * 10000)}`, // Auto-generate random ID
        fullName: "",
        phone: "",
        address: "",
        status: "ACTIVE",
        joinDate: new Date().toISOString().split("T")[0],
        nomineeName: "",
        nomineeRelation: "",
        nomineePhone: "",
      });
    }
  }, [member, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (member && member.status === "ACTIVE" && formData.status === "INACTIVE") {
      if (!confirm("Warning: Manually marking this member as INACTIVE will NOT deduct their balance from the company. To properly withdraw their funds and adjust the Company Balance, please use the 'Withdraw & Deactivate' button on their profile instead. Do you still want to proceed manually?")) {
        return;
      }
    }

    setLoading(true);

    try {
      const url = member ? `/api/members/${member.id}` : "/api/members";
      const method = member ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save member");
      
      router.refresh();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Error saving member.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-zinc-100">
          <h2 className="text-xl font-semibold text-zinc-900">
            {member ? "Edit Member" : "Add New Member"}
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">Member ID</label>
              <input
                type="text"
                required
                disabled={!!member}
                value={formData.memberId}
                onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-zinc-100"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">Join Date</label>
              <input
                type="date"
                required
                disabled={!!member}
                value={formData.joinDate}
                onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-zinc-100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">Full Name</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. John Doe"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">Phone Number</label>
            <input
              type="tel"
              pattern="^01[3-9]\d{8}$"
              title="Must be a valid 11-digit Bangladeshi phone number (e.g., 01712345678)"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 01712345678"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">Address</label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Residential address"
            />
          </div>

          <div className="pt-2 border-t border-zinc-100">
            <h3 className="text-sm font-semibold text-zinc-800 mb-3">Nominee Information (Optional)</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-700">Nominee Name</label>
                  <input
                    type="text"
                    value={formData.nomineeName}
                    onChange={(e) => setFormData({ ...formData, nomineeName: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Full Name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-700">Relationship</label>
                  <input
                    type="text"
                    value={formData.nomineeRelation}
                    onChange={(e) => setFormData({ ...formData, nomineeRelation: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Spouse, Son, Father"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-700">Nominee Phone</label>
                <input
                  type="tel"
                  value={formData.nomineePhone}
                  onChange={(e) => setFormData({ ...formData, nomineePhone: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 0171..."
                />
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-zinc-100">
            <label className="text-sm font-medium text-zinc-700">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            <p className="text-xs text-zinc-500">Note: Modifying this manually does not deduct the Company Balance. Use 'Withdraw & Deactivate' on the profile page to clear funds.</p>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {loading ? "Saving..." : "Save Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

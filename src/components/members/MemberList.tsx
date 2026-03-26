"use client";

import { useState } from "react";
import { MemberModal } from "./MemberModal";
import { Edit, Eye, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export function MemberList({ initialMembers }: { initialMembers: any[] }) {
  const [members, setMembers] = useState(initialMembers);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const router = useRouter();
  const { data: session } = useSession();
  const isViewer = (session?.user as any)?.role === "VIEWER";

  // Basic client-side search
  const filteredMembers = members.filter(
    (m) =>
      m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.memberId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.phone && m.phone.includes(searchTerm))
  );

  const handleEdit = (member: any) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedMember(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/members/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setMembers(members.filter((m) => m.id !== id));
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Error deleting member");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Members</h1>
          <p className="text-slate-500 mt-1">Manage all group members and their details.</p>
        </div>
        {!isViewer && (
          <button
            onClick={handleAddNew}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Member
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search members by name, ID, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Join Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{member.memberId}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{member.fullName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {member.phone || <span className="text-slate-400">-</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          member.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(member.joinDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      <Link
                        href={`/members/${member.id}`}
                        className="inline-flex p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="View Profile"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      {!isViewer && (
                        <>
                          <button
                            onClick={() => handleEdit(member)}
                            className="inline-flex p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(member.id, member.fullName)}
                            className="inline-flex p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <MemberModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          // Reload page to get fresh server data
          window.location.reload(); 
        }} 
        member={selectedMember} 
      />
    </div>
  );
}

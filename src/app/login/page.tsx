"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      id,
      password,
    });

    if (res?.error) {
      setError("Invalid ID or Password");
      setLoading(false);
    } else {
      router.replace("/");
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-zinc-100 overflow-hidden">
        <div className="p-8 text-center bg-blue-600">
          <h1 className="text-3xl font-bold text-white tracking-tight">LAND Group</h1>
          <p className="text-blue-100 mt-2 text-sm">Financial Management System</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">User ID</label>
              <input
                type="text"
                required
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Enter User ID"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Enter Password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>
        </div>
        
        <div className="p-4 text-center bg-zinc-50 border-t border-zinc-100">
          <p className="text-xs text-zinc-500">&copy; {new Date().getFullYear()} LAND Group. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

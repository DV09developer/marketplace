'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { adminApi } from '@/features/admin/api';
import { AdminUser } from '@/features/admin/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  Search,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserX,
  Loader2,
  Building2,
  Inbox,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

function UsersAdminComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [role, setRole] = useState(searchParams.get('role') || 'all');
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await adminApi.getUsers({
      search: search || undefined,
      role: role !== 'all' ? role : undefined,
      status: status !== 'all' ? status : undefined,
      page,
      limit: 12,
    });

    if (res.success && res.data?.users) {
      setUsers(res.data.users);
      setMeta({
        total: res.meta?.total || res.data.users.length,
        totalPages: res.meta?.totalPages || 1,
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [role, status, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleUpdateStatus = async (
    userId: string,
    data: { status?: 'active' | 'suspended'; role?: 'user' | 'admin' }
  ) => {
    setActionLoadingId(userId);
    setFeedback(null);
    const res = await adminApi.updateUserStatus(userId, data);
    setActionLoadingId(null);

    if (res.success) {
      setFeedback({ type: 'success', text: 'User account updated successfully.' });
      fetchUsers();
    } else {
      setFeedback({ type: 'error', text: res.message || 'Failed to update user.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">User Governance & Directory</h1>
        <p className="text-xs text-slate-500 mt-1">
          Inspect registered dual-role accounts, manage privileges, and govern platform access.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs font-medium flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Role Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium">Role:</span>
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setPage(1);
              }}
              className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 outline-none"
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium">Status:</span>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="w-full md:w-80 flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent w-full outline-none text-slate-800 placeholder:text-slate-400"
            />
          </div>
          <Button type="submit" size="sm" className="h-8 text-xs bg-slate-800 hover:bg-slate-900">
            Search
          </Button>
        </form>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="text-xs text-slate-500">Loading user accounts...</p>
        </div>
      ) : users.length === 0 ? (
        <Card className="bg-white border-slate-200 p-12 text-center max-w-lg mx-auto">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-900 text-base">No Users Found</h3>
          <p className="text-xs text-slate-500 mt-1">
            No registered accounts match the selected filters.
          </p>
        </Card>
      ) : (
        <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4">Businesses</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-slate-900">{u.full_name}</p>
                        <p className="text-slate-500">{u.email}</p>
                        {u.phone_number && (
                          <p className="text-[11px] text-slate-400 mt-0.5">{u.phone_number}</p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          u.account_status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {u.account_status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-slate-700 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {u.businesses_count}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {u.account_status === 'active' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={actionLoadingId === u.id}
                            onClick={() => handleUpdateStatus(u.id, { status: 'suspended' })}
                            className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <UserX className="w-3 h-3 mr-1" /> Suspend
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={actionLoadingId === u.id}
                            onClick={() => handleUpdateStatus(u.id, { status: 'active' })}
                            className="h-7 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          >
                            <UserCheck className="w-3 h-3 mr-1" /> Reactivate
                          </Button>
                        )}

                        {u.role === 'user' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={actionLoadingId === u.id}
                            onClick={() => handleUpdateStatus(u.id, { role: 'admin' })}
                            className="h-7 text-xs text-purple-700 border-purple-200 hover:bg-purple-50"
                          >
                            Make Admin
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={actionLoadingId === u.id}
                            onClick={() => handleUpdateStatus(u.id, { role: 'user' })}
                            className="h-7 text-xs text-slate-600"
                          >
                            Revoke Admin
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="gap-1 text-xs"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </Button>
          <span className="text-xs font-semibold text-slate-600">
            Page {page} of {meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= meta.totalPages}
            onClick={() => setPage(page + 1)}
            className="gap-1 text-xs"
          >
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default function UsersAdminPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-500">Loading user governance...</div>}>
      <UsersAdminComponent />
    </Suspense>
  );
}

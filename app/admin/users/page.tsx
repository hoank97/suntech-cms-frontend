'use client';

import { useEffect, useState } from 'react';
import { useRequest } from "@/hooks/use-request";
import { APIS } from "@/api/const";
import { User } from "./types";

export default function UsersPage() {
  const { request: getUsers, data: usersData, loading } = useRequest({ hideToast: true });
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    getUsers(APIS.USER.LIST(), { method: 'GET' });
  }, []);

  useEffect(() => {
    if (usersData) {
      // Handle array directly or data property
      const list = Array.isArray(usersData) ? usersData : (usersData.data || []);
      setUsers(list);
    }
  }, [usersData]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground mt-1">View list of all users in the system</p>
      </div>

      {/* Table */}
      <div className="flex-1 bg-card rounded-md border border-border overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="bg-secondary border-b border-border sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-secondary-foreground w-20">Avatar</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-secondary-foreground">Full Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-secondary-foreground">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-secondary-foreground">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-secondary-foreground">Last Login</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-secondary-foreground">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Loading...</td>
                </tr>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-secondary/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-border bg-secondary flex items-center justify-center">
                        {user.avatar ? (
                          <img
                            src={user.avatar.startsWith('http') ? user.avatar : APIS.IMAGE.SMALL(user.avatar)}
                            alt={user.fullName}
                            crossOrigin="anonymous"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-semibold text-muted-foreground">
                            {user.fullName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-foreground font-medium">{user.fullName}</td>
                    <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-green-800 bg-green-100">
                        ✓ Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      {formatDate(user.lastLogin)}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      {formatDate(user.createdAt)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

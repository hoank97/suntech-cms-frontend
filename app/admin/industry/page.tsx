'use client';

import { useState } from 'react';
import { Plus, Search, ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Industry {
  id: number;
  name: string;
  slug: string;
  status: 'active' | 'inactive';
  image_url?: string;
}

// Mock data
const mockIndustries: Industry[] = [
  { id: 1, name: 'Technology', slug: 'technology', status: 'active' },
  { id: 2, name: 'Healthcare', slug: 'healthcare', status: 'active' },
  { id: 3, name: 'Finance', slug: 'finance', status: 'inactive' },
  { id: 4, name: 'Manufacturing', slug: 'manufacturing', status: 'active' },
  { id: 5, name: 'Retail', slug: 'retail', status: 'active' },
  { id: 6, name: 'Education', slug: 'education', status: 'active' },
  { id: 7, name: 'Transportation', slug: 'transportation', status: 'inactive' },
  { id: 8, name: 'Agriculture', slug: 'agriculture', status: 'active' },
  { id: 9, name: 'Manufacturing', slug: 'manufacturing', status: 'active' },
  { id: 10, name: 'Retail', slug: 'retail', status: 'active' },
  { id: 11, name: 'Education', slug: 'education', status: 'active' },
  { id: 12, name: 'Transportation', slug: 'transportation', status: 'inactive' },
  { id: 13, name: 'Agriculture', slug: 'agriculture', status: 'active' },
];

const ITEMS_PER_PAGE = 10;

export default function IndustryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filteredIndustries = mockIndustries.filter((industry) => {
    const matchesSearch = industry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      industry.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || industry.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredIndustries.length / ITEMS_PER_PAGE);
  const paginatedIndustries = filteredIndustries.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleDelete = (id: number) => {
    console.log('[v0] Deleting industry:', id);
    setDeleteId(null);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Industry Management</h1>
          <p className="text-muted-foreground mt-1">Manage your industry categories</p>
        </div>
        <Link
          href="/admin/industry/create"
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add New Industry
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-card p-4 rounded-md border border-border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or slug..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as 'all' | 'active' | 'inactive');
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 bg-card rounded-md border border-border overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="bg-secondary border-b border-border sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-secondary-foreground">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-secondary-foreground">Slug</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-secondary-foreground">Status</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-secondary-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedIndustries.length > 0 ? (
                paginatedIndustries.map((industry) => (
                  <tr key={industry.id} className="hover:bg-secondary/50 transition-colors">
                    <td className="px-6 py-4 text-foreground">{industry.name}</td>
                    <td className="px-6 py-4 text-muted-foreground font-mono text-sm">{industry.slug}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${industry.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                          }`}
                      >
                        {industry.status === 'active' ? '✓ Active' : '○ Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/industry/${industry.id}/edit`}
                          className="p-2 hover:bg-secondary rounded-md transition-colors text-primary hover:text-primary/80"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteId(industry.id)}
                          className="p-2 hover:bg-secondary rounded-md transition-colors text-destructive hover:text-destructive/80"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                    No industries found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {
        totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-md border border-border hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-md text-sm ${currentPage === page
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border hover:bg-secondary'
                    }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md border border-border hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )
      }

      {/* Delete Modal */}
      {
        deleteId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card p-6 rounded-md max-w-sm">
              <h3 className="text-lg font-semibold text-foreground mb-2">Delete Industry</h3>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to delete this industry? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteId(null)}
                  className="px-4 py-2 rounded-md border border-border hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteId)}
                  className="px-4 py-2 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}

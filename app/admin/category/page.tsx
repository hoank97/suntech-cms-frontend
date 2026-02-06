'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Category, CategoryType } from './types';
import { useRequest } from '@/hooks/use-request';
import { APIS } from '@/api/const';
import { useToast } from '@/hooks/use-toast';

const ITEMS_PER_PAGE = 10;

export default function CategoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | CategoryType>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [categories, setCategory] = useState<Category[]>([]);
  const [totalPage, setTotalPage] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);

  const [isDeleting, setIsDeleting] = useState(false);

  const { request, data: categoriesData } = useRequest();
  const { request: deleteRequest, data: deleteData } = useRequest({ hideToast: false });
  const { toast } = useToast();

  useEffect(() => {
    if (categoriesData) {
      setCategory(categoriesData.data);
      setTotalPage(categoriesData.totalPages);
      setTotalItems(categoriesData.totalItems);
    }
  }, [categoriesData])

  useEffect(() => {
    request(
      APIS.CATEGORY.LIST({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        q: searchTerm,
        type: typeFilter === 'all' ? undefined : typeFilter
      }),
      {
        method: 'GET'
      }
    )
  }, [currentPage, searchTerm, typeFilter]);

  const handleDelete = async (id: number) => {
    setIsDeleting(true);
    const res = await deleteRequest(APIS.CATEGORY.DELETE(id), { method: 'DELETE' });
    setIsDeleting(false);
    if (res) {
      toast({
        title: 'Success',
        description: 'Category deleted successfully',
      });
      setDeleteId(null);
      request(
        APIS.CATEGORY.LIST({
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          q: searchTerm,
          type: typeFilter === 'all' ? undefined : typeFilter
        }),
        { method: 'GET' }
      );
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Category Management</h1>
          <p className="text-muted-foreground mt-1">Manage product and industry categories</p>
        </div>
        <Link
          href="/admin/category/create"
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add New Category
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-card p-4 rounded-md border border-border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as 'all' | CategoryType);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Types</option>
            <option value={CategoryType.PRODUCT}>Product</option>
            <option value={CategoryType.INDUSTRY}>Industry</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 bg-card rounded-md border border-border overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 overflow-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-secondary border-b border-border sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-secondary-foreground">Image</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-secondary-foreground">English Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-secondary-foreground">Vietnamese Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-secondary-foreground">Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-secondary-foreground">Status</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-secondary-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories?.length > 0 ? (
                categories.map((category) => (
                  <tr key={category.id} className="hover:bg-secondary/50 transition-colors">
                    <td className="px-6 py-4">
                      {category.img_url ? (
                        <img crossOrigin={'anonymous'} src={APIS.IMAGE.MEDIUM(category.img_url)} alt={category.name_en} className="w-8 h-8 rounded-md object-cover border border-border" />
                      ) :
                        <img src='/dummy.png' alt={category.name_en} className="w-8 h-8 rounded-md object-cover border border-border" />}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-foreground">{category.name_en}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-foreground">{category.name_vi}</span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-sm capitalize">{category.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-green-800 bg-green-100`}
                      >
                        ✓ Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/category/${category.id}/edit`}
                          className="p-2 hover:bg-secondary rounded-md transition-colors text-primary hover:text-primary/80"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteId(category.id)}
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
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No categories found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {
        totalPage > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-md border border-border hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPage }, (_, i) => i + 1).map((page) => (
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
              onClick={() => setCurrentPage((p) => Math.min(totalPage, p + 1))}
              disabled={currentPage === totalPage}
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
              <h3 className="text-lg font-semibold text-foreground mb-2">Delete Category</h3>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to delete this category? This action cannot be undone.
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
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:bg-destructive/50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}

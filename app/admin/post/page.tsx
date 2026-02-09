'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRequest } from "@/hooks/use-request";
import { APIS } from "@/api/const";
import { useToast } from "@/hooks/use-toast";
import { Post } from "./types";

const ITEMS_PER_PAGE = 10;

export default function PostPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [totalPages, setTotalPages] = useState(0);

  const { request: getPosts, data: postsData, loading } = useRequest({ hideToast: true });
  const { request: deletePost, data: deleteData } = useRequest({ hideToast: false });
  const { toast } = useToast();

  const fetchPosts = () => {
    getPosts(APIS.POST.LIST({ page: currentPage, limit: ITEMS_PER_PAGE, q: searchTerm }), { method: 'GET' });
  };

  useEffect(() => {
    fetchPosts();
  }, [currentPage, searchTerm]);

  useEffect(() => {
    if (postsData) {
      setTotalPages(postsData.totalPages || 0);
    }
  }, [postsData]);

  const handleDelete = async (id: number) => {
    setIsDeleting(true);
    const res = await deletePost(APIS.POST.DELETE(id), { method: 'DELETE' });
    setIsDeleting(false);
    if (res) {
      setDeleteId(null);
      toast({
        title: 'Success',
        description: 'Post deleted successfully',
      });
      fetchPosts();
    }
  };

  const posts: Post[] = Array.isArray(postsData?.data || postsData)
    ? (postsData?.data || postsData)
    : [];

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Post Management</h1>
          <p className="text-muted-foreground mt-1">Manage your blog posts</p>
        </div>
        <Link
          href="/admin/post/create"
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add New Post
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-card p-4 rounded-md border border-border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 bg-card rounded-md border border-border overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 overflow-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-secondary border-b border-border sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-secondary-foreground w-20">Image</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-secondary-foreground">Title (EN)</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-secondary-foreground">Title (VI)</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-secondary-foreground">Author</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-secondary-foreground">Published At</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-secondary-foreground">Views</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-secondary-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">Loading...</td>
                </tr>
              ) : posts.length > 0 ? (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-secondary/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-10 h-10 rounded overflow-hidden border border-border bg-background">
                        {post.thumbnail_url ? (
                          <img
                            src={post.thumbnail_url.startsWith('http') ? post.thumbnail_url : APIS.IMAGE.MEDIUM(post.thumbnail_url)}
                            alt={post.title_en}
                            crossOrigin="anonymous"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                            N/A
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-foreground">{post.title_en}</td>
                    <td className="px-6 py-4 text-foreground">{post.title_vi}</td>
                    <td className="px-6 py-4 text-foreground">{post.author}</td>
                    <td className="px-6 py-4 text-foreground">
                      {post.published_at ? new Date(post.published_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-foreground">{post.views}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/post/${post.id}/edit`}
                          className="p-2 hover:bg-secondary rounded-md transition-colors text-primary hover:text-primary/80"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteId(post.id)}
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
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                    No posts found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
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
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-md max-w-sm">
            <h3 className="text-lg font-semibold text-foreground mb-2">Delete Post</h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete this post? This action cannot be undone.
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
      )}
    </div>
  );
}

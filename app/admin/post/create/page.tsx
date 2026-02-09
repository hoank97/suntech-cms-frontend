'use client';

import React, { useEffect, useRef, useState } from "react"
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, X, Plus } from 'lucide-react';
import Link from 'next/link';
import { TipTapEditor } from '@/components/admin/tiptap-editor';
import { useRequest } from "@/hooks/use-request";
import { APIS } from "@/api/const";
import { useToast } from "@/hooks/use-toast";
import { LoadingScreen } from "@/components/ui/loading-screen";

export default function CreatePostPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    // Requests
    const { request: createPostRequest, data: createPostData, loading } = useRequest({ hideToast: true });

    useEffect(() => {
        if (createPostData) {
            router.push('/admin/post');
            toast({
                title: 'Success',
                description: 'Post created successfully',
                variant: 'default',
            });
        }
    }, [createPostData]);

    const [formData, setFormData] = useState({
        title_en: '',
        title_vi: '',
        content_en: '',
        content_vi: '',
        thumbnail_url: '',
        published_at: new Date().toISOString().split('T')[0],
        author: '',
        views: 0,
    });

    // Image handling
    const thumbnailInputRef = useRef<HTMLInputElement>(null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setThumbnailFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);

        // Clear previous uploaded url if any (though in create it's initially empty)
        setFormData(prev => ({ ...prev, thumbnail_url: '' }));
    };

    const handleRemoveThumbnail = () => {
        setThumbnailFile(null);
        setPreviewUrl('');
        setFormData(prev => ({ ...prev, thumbnail_url: '' }));
        if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
    }

    // --- Submit ---
    const isSubmittingRef = useRef(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmittingRef.current || loading || isLoading) {
            return;
        }
        isSubmittingRef.current = true;
        setIsLoading(true);

        try {
            let finalThumbnailUrl = formData.thumbnail_url;

            if (thumbnailFile) {
                const uploadFormData = new FormData();
                uploadFormData.append('file', thumbnailFile);
                const token = localStorage.getItem('suntech-x-atk');

                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/${APIS.UPLOAD()}`, {
                        method: 'POST',
                        body: uploadFormData,
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        finalThumbnailUrl = data.id;
                    } else {
                        toast({ title: 'Error', description: 'Failed to upload thumbnail', variant: 'destructive' });
                        setIsLoading(false);
                        isSubmittingRef.current = false;
                        return;
                    }
                } catch (error) {
                    console.error(error);
                    toast({ title: 'Error', description: 'Error uploading thumbnail', variant: 'destructive' });
                    setIsLoading(false);
                    isSubmittingRef.current = false;
                    return;
                }
            }

            await createPostRequest(
                APIS.POST.CREATE(),
                {
                    method: 'POST',
                    body: {
                        ...formData,
                        thumbnail_url: finalThumbnailUrl,
                        views: Number(formData.views),
                    }
                },
            );
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
            isSubmittingRef.current = false;
        }
    };

    return (
        <div className="space-y-6">
            <LoadingScreen isLoading={loading || isLoading} />
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/post"
                    className="p-2 hover:bg-secondary rounded-md transition-colors text-primary"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Create New Post</h1>
                    <p className="text-muted-foreground mt-1">Add a new blog post</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-card rounded-md border border-border p-6 space-y-6">
                {/* Basic Info */}
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Title (EN) *</label>
                        <input
                            type="text"
                            name="title_en"
                            value={formData.title_en}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Title (VI) *</label>
                        <input
                            type="text"
                            name="title_vi"
                            value={formData.title_vi}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Author</label>
                        <input
                            type="text"
                            name="author"
                            value={formData.author}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Views</label>
                        <input
                            type="number"
                            name="views"
                            value={formData.views}
                            onChange={handleInputChange}
                            min="0"
                            className="w-full px-4 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Published At</label>
                        <input
                            type="date"
                            name="published_at"
                            value={formData.published_at}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>

                {/* Thumbnail */}
                <h3 className="text-lg font-semibold text-foreground border-b pb-2 pt-4">Thumbnail</h3>
                <div className="mt-4">
                    <div className="flex-1">
                        <div className="relative border-2 border-dashed border-border rounded-md p-4 hover:bg-secondary/50 transition-colors cursor-pointer text-center h-48 flex flex-col items-center justify-center">
                            <input
                                type="file"
                                ref={thumbnailInputRef}
                                accept="image/*"
                                onChange={handleThumbnailChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                            <p className="text-sm font-medium text-foreground">Click to upload thumbnail</p>
                            <p className="text-xs text-muted-foreground">PNG, JPG, GIF</p>
                        </div>
                    </div>
                    {(previewUrl || formData.thumbnail_url) && (
                        <div className="w-48 h-48 bg-secondary rounded-md overflow-hidden flex items-center justify-center relative border border-border">
                            <img
                                src={previewUrl || (formData.thumbnail_url.startsWith('http') ? formData.thumbnail_url : APIS.IMAGE.MEDIUM(formData.thumbnail_url))}
                                alt="Thumbnail"
                                crossOrigin="anonymous"
                                className="w-full h-full object-cover"
                            />
                            <button
                                type="button"
                                onClick={handleRemoveThumbnail}
                                className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-foreground border-b pb-2 pt-4">Content</h3>
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Content (EN)</label>
                        <TipTapEditor
                            value={formData.content_en}
                            onChange={(content) => setFormData(p => ({ ...p, content_en: content }))}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Content (VI)</label>
                        <TipTapEditor
                            value={formData.content_vi}
                            onChange={(content) => setFormData(p => ({ ...p, content_vi: content }))}
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-4 border-t border-border mt-8">
                    <Link
                        href="/admin/post"
                        className="px-6 py-2 rounded-md border border-border hover:bg-secondary transition-colors text-foreground font-medium"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={loading || isLoading}
                        className="px-6 py-2 bg-accent hover:bg-accent/90 disabled:bg-accent/50 text-accent-foreground rounded-md transition-colors font-medium"
                    >
                        {loading || isLoading ? 'Creating...' : 'Create Post'}
                    </button>
                </div>
            </form >
        </div >
    );
}

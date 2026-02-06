'use client';

import React, { useEffect, useRef, useState, use } from "react";
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, X } from 'lucide-react';
import Link from 'next/link';
import { Category, CategoryType } from '../../types';
import { useRequest } from "@/hooks/use-request";
import { APIS } from "@/api/const";
import { useToast } from "@/hooks/use-toast";

export default function UpdateCategoryPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [uploadImage, setUploadImage] = useState<File | null>(null);
    const { toast } = useToast();

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Request hooks
    const { request: getCategory, data: categoryData } = useRequest({ hideToast: true });
    const { request: getAllCategories, data: allCategoriesData } = useRequest({ hideToast: true });
    const { request: updateCategory, data: updateData, loading: updateLoading } = useRequest({ hideToast: false });

    // Initial Data Fetch
    useEffect(() => {
        if (id) {
            getCategory(APIS.CATEGORY.DETAIL(id), { method: 'GET' });
            getAllCategories(APIS.CATEGORY.GET_ALL(), { method: 'GET' });
        }
    }, [id]);

    const [formData, setFormData] = useState({
        name_en: '',
        name_vi: '',
        img_url: '',
        parent_id: '' as string | number | null,
        type: CategoryType.PRODUCT,
    });

    // Populate form when data is fetched
    useEffect(() => {
        if (categoryData) {
            const cat = categoryData.data || categoryData;
            if (cat) {
                setFormData({
                    name_en: cat.name_en || '',
                    name_vi: cat.name_vi || '',
                    img_url: cat.img_url || '',
                    parent_id: cat.parent_id || null,
                    type: cat.type || CategoryType.PRODUCT,
                });
                if (cat.img_url) {
                    setPreviewImage(APIS.IMAGE.MEDIUM(cat.img_url));
                }
            }
        }
    }, [categoryData]);

    // Handle Update Success
    useEffect(() => {
        if (updateData) {
            toast({
                title: 'Success',
                description: 'Category updated successfully',
                variant: 'default',
            });

            const timeoutCloseToast = setTimeout(() => {
                router.push('/admin/category');
            }, 1000); // Faster redirect

            return () => clearTimeout(timeoutCloseToast);
        }
    }, [updateData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result as string;
                setPreviewImage(result);
                setUploadImage(file);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        let finalImageUrl = formData.img_url;

        // Step 1: Upload new image if selected
        if (uploadImage) {
            const uploadFormData = new FormData();
            uploadFormData.append('file', uploadImage);

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
                    const imageData = await response.json();
                    finalImageUrl = imageData.id;
                } else {
                    toast({
                        title: 'Error',
                        description: 'Failed to upload image',
                        variant: 'destructive',
                    });
                    setIsLoading(false);
                    return;
                }
            } catch (error) {
                console.error('Upload error:', error);
                setIsLoading(false);
                return;
            }
        }

        // Step 2: Update category
        await updateCategory(
            APIS.CATEGORY.UPDATE(id),
            {
                method: 'PATCH',
                body: {
                    ...formData,
                    img_url: finalImageUrl,
                    parent_id: formData.parent_id ? Number(formData.parent_id) : null,
                },
            }
        );
        setIsLoading(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/category"
                    className="p-2 hover:bg-secondary rounded-md transition-colors text-primary"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Edit Category</h1>
                    <p className="text-muted-foreground mt-1">Update category details</p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-card rounded-md border border-border p-6 space-y-6">
                {/* Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="name_en" className="block text-sm font-semibold text-foreground mb-2">
                            Category Name (EN) <span className="text-destructive">*</span>
                        </label>
                        <input
                            type="text"
                            id="name_en"
                            name="name_en"
                            value={formData.name_en}
                            onChange={handleInputChange}
                            placeholder="e.g., Electronics"
                            required
                            className="w-full px-4 py-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label htmlFor="name_vi" className="block text-sm font-semibold text-foreground mb-2">
                            Category Name (VI) <span className="text-destructive">*</span>
                        </label>
                        <input
                            type="text"
                            id="name_vi"
                            name="name_vi"
                            value={formData.name_vi}
                            onChange={handleInputChange}
                            placeholder="e.g., Điện tử"
                            required
                            className="w-full px-4 py-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>

                {/* Type & Parent */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="type" className="block text-sm font-semibold text-foreground mb-2">
                            Category Type <span className="text-destructive">*</span>
                        </label>
                        <select
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value={CategoryType.PRODUCT}>Product</option>
                            <option value={CategoryType.INDUSTRY}>Industry</option>
                        </select>
                    </div>
                    {/* <div>
                        <label htmlFor="parent_id" className="block text-sm font-semibold text-foreground mb-2">
                            Parent Category (Optional)
                        </label>
                        <select
                            id="parent_id"
                            name="parent_id"
                            value={formData.parent_id || ''}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="">Select a parent category...</option>
                            {allCategoriesData && (allCategoriesData.data || allCategoriesData)
                                ? (Array.isArray(allCategoriesData.data || allCategoriesData)
                                    ? (allCategoriesData.data || allCategoriesData)
                                    : [])
                                    .filter((cat: Category) => cat.id !== Number(id))
                                    .map((cat: Category) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name_en}
                                        </option>
                                    ))
                                : null}
                        </select>
                    </div> */}
                </div>

                {/* Image Upload */}
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                        Category Image
                    </label>
                    <div className="flex gap-6">
                        <div className="w-full md:w-1/2">
                            <div className="relative border-2 border-dashed border-border rounded-md p-6 hover:bg-secondary/50 transition-colors cursor-pointer text-center h-40 flex flex-col items-center justify-center">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                                <p className="text-sm font-medium text-foreground">Click/Drag to upload</p>
                                <p className="text-xs text-muted-foreground">PNG, JPG, GIF</p>
                            </div>
                        </div>
                        {previewImage && (
                            <div className="w-40 h-40 bg-secondary rounded-md overflow-hidden flex items-center justify-center relative border border-border">
                                <img crossOrigin="anonymous" src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPreviewImage(null);
                                        setUploadImage(null);
                                        setFormData((prev) => ({ ...prev, img_url: '' }));
                                        if (fileInputRef.current) {
                                            fileInputRef.current.value = '';
                                        }
                                    }}
                                    className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-4 border-t border-border">
                    <Link
                        href="/admin/category"
                        className="px-6 py-2 rounded-md border border-border hover:bg-secondary transition-colors text-foreground font-medium"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={updateLoading || isLoading}
                        className="px-6 py-2 bg-accent hover:bg-accent/90 disabled:bg-accent/50 text-accent-foreground rounded-md transition-colors font-medium"
                    >
                        {updateLoading || isLoading ? 'Updating...' : 'Update Category'}
                    </button>
                </div>
            </form>
        </div>
    );
}

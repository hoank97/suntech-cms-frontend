'use client';

import React, { useEffect, useRef, useState } from "react"
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Upload, X, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { TipTapEditor } from '@/components/admin/tiptap-editor';
import { useRequest } from "@/hooks/use-request";
import { APIS } from "@/api/const";
import { useToast } from "@/hooks/use-toast";
import { Category } from "../../../category/types";
import { Industry } from "../../../industry/types";

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    // Requests
    const { request: updateProductRequest, data: updateProductData, loading } = useRequest({ hideToast: false });
    const { request: getProduct, data: productData } = useRequest({ hideToast: true });
    const { request: getAllCategories, data: allCategoriesData } = useRequest({ hideToast: true });
    const { request: getAllIndustries, data: allIndustriesData } = useRequest({ hideToast: true });

    useEffect(() => {
        if (id) {
            getProduct(APIS.PRODUCT.DETAIL(id), { method: 'GET' });
        }
        getAllCategories(APIS.CATEGORY.GET_ALL(), { method: 'GET' });
        getAllIndustries(APIS.INDUSTRY.GET_ALL(), { method: 'GET' });
    }, [id]);

    useEffect(() => {
        if (updateProductData) {
            toast({
                title: 'Success',
                description: 'Product updated successfully',
                variant: 'default',
            });
            const timeout = setTimeout(() => {
                router.push('/admin/product');
            }, 2000);
            return () => clearTimeout(timeout);
        }
    }, [updateProductData]);

    const [formData, setFormData] = useState({
        name_en: '',
        name_vi: '',
        category_id: '' as string | number,
        industry_ids: [] as string[],
        buy_link: '',
        documentation_link: '',
        product_enquiry_link: '',
        applications_en: [] as string[],
        applications_vi: [] as string[],
        download_links: [] as string[],
        summary_en: '',
        summary_vi: '',
        description_en: '',
        description_vi: '',
        images: [] as string[],
    });

    useEffect(() => {
        if (productData) {
            const data = productData.data || productData;
            setFormData({
                name_en: data.name_en || '',
                name_vi: data.name_vi || '',
                category_id: data.category_id || '',
                industry_ids: Array.isArray(data.industry_ids) ? data.industry_ids : [],
                buy_link: data.buy_link || '',
                documentation_link: data.documentation_link || '',
                product_enquiry_link: data.product_enquiry_link || '',
                applications_en: Array.isArray(data.applications_en) ? data.applications_en : [],
                applications_vi: Array.isArray(data.applications_vi) ? data.applications_vi : [],
                download_links: Array.isArray(data.download_links)
                    ? data.download_links.map((link: any) => typeof link === 'string' ? link : JSON.stringify(link))
                    : [],
                summary_en: data.summary_en || '',
                summary_vi: data.summary_vi || '',
                description_en: data.description_en || '',
                description_vi: data.description_vi || '',
                images: Array.isArray(data.images) ? data.images : [],
            });
        }
    }, [productData]);

    // Helper states for dynamic fields
    const [newAppEn, setNewAppEn] = useState('');
    const [newAppVi, setNewAppVi] = useState('');
    const [selectedIndustry, setSelectedIndustry] = useState('');

    // Image handling
    const fileInputRef = useRef<HTMLInputElement>(null);
    const docInputRef = useRef<HTMLInputElement>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isUploadingDoc, setIsUploadingDoc] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // --- Array Handlers ---
    const handleAddApplication = () => {
        if (newAppEn.trim() && newAppVi.trim()) {
            setFormData(prev => ({
                ...prev,
                applications_en: [...prev.applications_en, newAppEn.trim()],
                applications_vi: [...prev.applications_vi, newAppVi.trim()]
            }));
            setNewAppEn('');
            setNewAppVi('');
        }
    };

    const handleRemoveApplication = (index: number) => {
        setFormData(prev => ({
            ...prev,
            applications_en: prev.applications_en.filter((_, i) => i !== index),
            applications_vi: prev.applications_vi.filter((_, i) => i !== index)
        }));
    };

    const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploadingDoc(true);
        const token = localStorage.getItem('suntech-x-atk');

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const uploadFormData = new FormData();
            uploadFormData.append('file', file);

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/${APIS.UPLOAD_DOCUMENT()}`, {
                    method: 'POST',
                    body: uploadFormData,
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setFormData(prev => ({
                        ...prev,
                        download_links: [...prev.download_links, JSON.stringify({
                            url: data.url,
                            originalName: data.originalName,
                            size: data.size
                        })]
                    }));
                } else {
                    toast({ title: 'Error', description: `Failed to upload ${file.name}`, variant: 'destructive' });
                }
            } catch (error) {
                console.error(error);
                toast({ title: 'Error', description: `Error uploading ${file.name}`, variant: 'destructive' });
            }
        }
        setIsUploadingDoc(false);
        if (docInputRef.current) docInputRef.current.value = '';
    };

    const handleRemoveDownloadLink = (index: number) => {
        setFormData(prev => ({
            ...prev,
            download_links: prev.download_links.filter((_, i) => i !== index)
        }));
    };

    const handleAddIndustry = () => {
        if (selectedIndustry && !formData.industry_ids.includes(selectedIndustry)) {
            setFormData(prev => ({
                ...prev,
                industry_ids: [...prev.industry_ids, selectedIndustry]
            }));
            setSelectedIndustry('');
        }
    };

    const handleRemoveIndustry = (id: string) => {
        setFormData(prev => ({
            ...prev,
            industry_ids: prev.industry_ids.filter(item => item !== id)
        }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploadingImage(true);
        const token = localStorage.getItem('suntech-x-atk');

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const uploadFormData = new FormData();
            uploadFormData.append('file', file);

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
                    setFormData(prev => ({
                        ...prev,
                        images: [...prev.images, data.id]
                    }));
                } else {
                    toast({ title: 'Error', description: `Failed to upload ${file.name}`, variant: 'destructive' });
                }
            } catch (error) {
                console.error(error);
                toast({ title: 'Error', description: `Error uploading ${file.name}`, variant: 'destructive' });
            }
        }
        setIsUploadingImage(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleRemoveImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };



    // --- Submit ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        await updateProductRequest(
            APIS.PRODUCT.UPDATE(id),
            {
                method: 'PATCH', // Assumed PATCH from earlier edits, user might want to check this
                body: {
                    ...formData,
                    category_id: formData.category_id ? Number(formData.category_id) : null,
                }
            }
        );
        setIsLoading(false);
    };

    // Helper to get industry name
    const getIndustryName = (id: string) => {
        const list = Array.isArray(allIndustriesData) ? allIndustriesData : (allIndustriesData?.data || []);
        const found = list.find((i: Industry) => String(i.id) === String(id));
        return found ? found.name_en : id;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/product"
                    className="p-2 hover:bg-secondary rounded-md transition-colors text-primary"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Edit Product</h1>
                    <p className="text-muted-foreground mt-1">Update product information</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-card rounded-md border border-border p-6 space-y-6">
                {/* Basic Info */}
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Name (EN) *</label>
                        <input
                            type="text"
                            name="name_en"
                            value={formData.name_en}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Name (VI) *</label>
                        <input
                            type="text"
                            name="name_vi"
                            value={formData.name_vi}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Category</label>
                        <select
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="">Select Category...</option>
                            {(Array.isArray(allCategoriesData) ? allCategoriesData : (allCategoriesData?.data || [])).map((cat: Category) => (
                                <option key={cat.id} value={cat.id}>{cat.name_en}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Industries</label>
                        <div className="flex gap-2 mb-2">
                            <select
                                value={selectedIndustry}
                                onChange={(e) => setSelectedIndustry(e.target.value)}
                                className="flex-1 px-4 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="">Select Industry...</option>
                                {(Array.isArray(allIndustriesData) ? allIndustriesData : (allIndustriesData?.data || [])).map((ind: Industry) => (
                                    <option key={ind.id} value={ind.id} disabled={formData.industry_ids.includes(String(ind.id))}>
                                        {ind.name_en}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={handleAddIndustry}
                                className="px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.industry_ids.map(id => (
                                <div key={id} className="flex items-center gap-1 bg-secondary px-2 py-1 rounded text-sm">
                                    <span>{getIndustryName(id)}</span>
                                    <button type="button" onClick={() => handleRemoveIndustry(id)} className="text-destructive">
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Links */}
                <h3 className="text-lg font-semibold text-foreground border-b pb-2 pt-4">Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Buy Link</label>
                        <input
                            type="url"
                            name="buy_link"
                            value={formData.buy_link}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Documentation Link</label>
                        <input
                            type="url"
                            name="documentation_link"
                            value={formData.documentation_link}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Product Enquiry Link</label>
                        <input
                            type="url"
                            name="product_enquiry_link"
                            value={formData.product_enquiry_link}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>


                {/* Documents */}
                <div className="mt-4">
                    <label className="block text-sm font-semibold text-foreground mb-2">Documents</label>
                    <div className="flex gap-2 mb-2 items-center">
                        <div className="relative">
                            <input
                                type="file"
                                multiple
                                ref={docInputRef}
                                onChange={handleDocumentUpload}
                                className="hidden"
                                id="doc-upload"
                                disabled={isUploadingDoc}
                            />
                            <label
                                htmlFor="doc-upload"
                                className={`flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 transition-colors ${isUploadingDoc ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <Upload className="w-4 h-4" />
                                {isUploadingDoc ? 'Uploading...' : 'Upload Documents'}
                            </label>
                        </div>
                    </div>
                    <ul className="space-y-1">
                        {formData.download_links.map((linkStr, idx) => {
                            let link;
                            try {
                                link = JSON.parse(linkStr);
                            } catch (e) {
                                link = { originalName: "Invalid Data", size: "", url: "" };
                            }
                            return (
                                <li key={idx} className="flex items-center gap-2 text-sm bg-secondary p-2 rounded">
                                    <span className="truncate flex-1">{link.originalName} ({link.size})</span>
                                    <button type="button" onClick={() => handleRemoveDownloadLink(idx)} className="text-destructive hover:text-destructive/80">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Applications */}
                <h3 className="text-lg font-semibold text-foreground border-b pb-2 pt-4">Applications</h3>
                <div className="flex gap-4 items-end bg-secondary/30 p-4 rounded-md border border-border">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-foreground mb-2">Application (EN)</label>
                        <input
                            type="text"
                            value={newAppEn}
                            onChange={(e) => setNewAppEn(e.target.value)}
                            className="w-full px-4 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-foreground mb-2">Application (VI)</label>
                        <input
                            type="text"
                            value={newAppVi}
                            onChange={(e) => setNewAppVi(e.target.value)}
                            className="w-full px-4 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleAddApplication}
                        className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md transition-colors"
                    >
                        Add
                    </button>
                </div>
                {formData.applications_en.length > 0 && (
                    <div className="grid gap-2 mt-2">
                        {formData.applications_en.map((app, index) => (
                            <div key={index} className="flex items-center gap-4 bg-secondary p-3 rounded-md">
                                <div className="flex-1 text-sm"><span className="font-semibold text-muted-foreground mr-2">EN:</span>{app}</div>
                                <div className="flex-1 text-sm"><span className="font-semibold text-muted-foreground mr-2">VI:</span>{formData.applications_vi[index]}</div>
                                <button type="button" onClick={() => handleRemoveApplication(index)} className="text-destructive p-1">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Images */}
                <h3 className="text-lg font-semibold text-foreground border-b pb-2 pt-4">Images</h3>
                <div className="space-y-4">
                    {/* Product Images Section */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Product Images</label>
                        <div className="flex gap-4 flex-wrap">
                            {formData.images.map((img, idx) => (
                                <div key={idx} className="relative w-32 h-32 border border-border rounded overflow-hidden group">
                                    <img
                                        src={img.startsWith('http') ? img : APIS.IMAGE.MEDIUM(img)}
                                        alt="Product"
                                        crossOrigin="anonymous"
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveImage(idx)}
                                        className="absolute top-1 right-1 bg-destructive text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                            <div className="w-32 h-32 border-2 border-dashed border-border rounded flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/50 relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    disabled={isUploadingImage}
                                />
                                {isUploadingImage ? (
                                    <span className="text-xs">Uploading...</span>
                                ) : (
                                    <>
                                        <Plus className="w-8 h-8 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground mt-1">Add Images</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-foreground border-b pb-2 pt-4">Content</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Summary (EN)</label>
                        <TipTapEditor
                            value={formData.summary_en}
                            onChange={(content) => setFormData(p => ({ ...p, summary_en: content }))}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Summary (VI)</label>
                        <TipTapEditor
                            value={formData.summary_vi}
                            onChange={(content) => setFormData(p => ({ ...p, summary_vi: content }))}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Description (EN)</label>
                        <TipTapEditor
                            value={formData.description_en}
                            onChange={(content) => setFormData(p => ({ ...p, description_en: content }))}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Description (VI)</label>
                        <TipTapEditor
                            value={formData.description_vi}
                            onChange={(content) => setFormData(p => ({ ...p, description_vi: content }))}
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-4 border-t border-border mt-8">
                    <Link
                        href="/admin/product"
                        className="px-6 py-2 rounded-md border border-border hover:bg-secondary transition-colors text-foreground font-medium"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={loading || isUploadingImage}
                        className="px-6 py-2 bg-accent hover:bg-accent/90 disabled:bg-accent/50 text-accent-foreground rounded-md transition-colors font-medium"
                    >
                        {loading ? 'Updating...' : 'Update Product'}
                    </button>
                </div>
            </form >
        </div >
    );
}

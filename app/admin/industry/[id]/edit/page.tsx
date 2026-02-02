'use client';

import React, { useEffect, useRef, useState } from "react"
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Upload, X } from 'lucide-react';
import Link from 'next/link';
import { TipTapEditor } from '@/components/admin/tiptap-editor';
import { useRequest } from "@/hooks/use-request";
import { APIS } from "@/api/const";
import { useToast } from "@/hooks/use-toast";
import { Industry } from "../../types";

export default function EditIndustryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadImage, setUploadImage] = useState<any>(null);
  const [industries, setIndustries] = useState<any>(null);
  const { toast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { request: updateIndustryRequest, data: updateIndustryData, loading } = useRequest({ hideToast: false });
  const { request: getIndustry, data: industryData } = useRequest({ hideToast: true });
  const { request: getAllIndustries, data: allIndustriesData } = useRequest({ hideToast: true });
  const { request: getAllCategories, data: allCategoriesData } = useRequest({ hideToast: true });

  useEffect(() => {
    if (id) {
      getIndustry(APIS.INDUSTRY.DETAIL(id), { method: 'GET' });
    }
    getAllIndustries(APIS.INDUSTRY.GET_ALL(), { method: 'GET' });
    getAllCategories(APIS.CATEGORY.LIST({ page: 1, limit: 1000000, type: 'industry', q: '' }), { method: 'GET' });
  }, [id]);

  useEffect(() => {
    if (allIndustriesData) {
      setIndustries(allIndustriesData);
    }
  }, [allIndustriesData]);

  useEffect(() => {
    if (industryData) {
      const data = industryData.data || industryData;
      setFormData({
        name_en: data.name_en || '',
        name_vi: data.name_vi || '',
        image_url: data.image_url || '',
        introduction_en: data.introduction_en || '',
        introduction_vi: data.introduction_vi || '',
        applications_en: Array.isArray(data.applications_en) ? data.applications_en : [],
        applications_vi: Array.isArray(data.applications_vi) ? data.applications_vi : [],
        solution_link: data.solution_link || '',
        parent_id: data.parent_id || '',
        category_id: data.category_id || '',
      });

      if (data.image_url) {
        if (data.image_url.startsWith('http')) {
          setPreviewImage(data.image_url);
        } else {
          setPreviewImage(APIS.IMAGE.MEDIUM(data.image_url));
        }
      }
    }
  }, [industryData]);

  useEffect(() => {
    if (updateIndustryData) {
      toast({
        title: 'Success',
        description: 'Industry updated successfully',
        variant: 'default',
      });
      const timeoutCloseToast = setTimeout(() => {
        router.push('/admin/industry');
      }, 2000);
      return () => clearTimeout(timeoutCloseToast);
    }
  }, [updateIndustryData]);

  const [formData, setFormData] = useState({
    name_en: '',
    name_vi: '',
    image_url: '',
    introduction_en: '',
    introduction_vi: '',
    applications_en: [] as string[],
    applications_vi: [] as string[],
    solution_link: '',
    parent_id: '' as string | number | null,
    category_id: '' as string | number | null,
  });

  const [newAppEn, setNewAppEn] = useState('');
  const [newAppVi, setNewAppVi] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  const handleAddApplication = () => {
    if (newAppEn.trim() && newAppVi.trim()) {
      setFormData((prev) => ({
        ...prev,
        applications_en: [...prev.applications_en, newAppEn.trim()],
        applications_vi: [...prev.applications_vi, newAppVi.trim()],
      }));
      setNewAppEn('');
      setNewAppVi('');
    }
  };

  const handleRemoveApplication = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      applications_en: prev.applications_en.filter((_, i) => i !== index),
      applications_vi: prev.applications_vi.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    let imageUrl = formData.image_url;

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
          const data = await response.json();
          imageUrl = data.id;
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
        toast({
          title: 'Error',
          description: 'Error uploading image',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }
    }

    await updateIndustryRequest(
      APIS.INDUSTRY.UPDATE(id),
      {
        method: 'PATCH',
        body: {
          ...formData,
          image_url: imageUrl,
          parent_id: formData.parent_id ? Number(formData.parent_id) : null,
          category_id: formData.category_id ? Number(formData.category_id) : null,
        },
      }
    );
    setIsLoading(false);
  };

  const industriesList = (function () {
    if (!allIndustriesData) return [];
    if (Array.isArray(allIndustriesData)) return allIndustriesData;
    if (allIndustriesData.data && Array.isArray(allIndustriesData.data)) return allIndustriesData.data;
    return [];
  })();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/industry"
          className="p-2 hover:bg-secondary rounded-md transition-colors text-primary"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit Industry</h1>
          <p className="text-muted-foreground mt-1">Update industry information</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-card rounded-md border border-border p-6 space-y-6">
        {/* Names */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name_en" className="block text-sm font-semibold text-foreground mb-2">
              Industry Name (EN) <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              id="name_en"
              name="name_en"
              value={formData.name_en}
              onChange={handleInputChange}
              placeholder="e.g., Technology"
              required
              className="w-full px-4 py-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label htmlFor="name_vi" className="block text-sm font-semibold text-foreground mb-2">
              Industry Name (VI) <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              id="name_vi"
              name="name_vi"
              value={formData.name_vi}
              onChange={handleInputChange}
              placeholder="e.g., Công nghệ"
              required
              className="w-full px-4 py-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Category, Parent & Link */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="category_id" className="block text-sm font-semibold text-foreground mb-2">
              Category (Optional)
            </label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id || ''}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select a category...</option>
              {allCategoriesData && allCategoriesData.data
                ? allCategoriesData.data.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name_en}
                  </option>
                ))
                : null}
            </select>
          </div>
          <div>
            <label htmlFor="parent_id" className="block text-sm font-semibold text-foreground mb-2">
              Parent Industry (Optional)
            </label>
            <select
              id="parent_id"
              name="parent_id"
              value={formData.parent_id || ''}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select a parent industry...</option>
              {industries
                ?.filter((ind: Industry) => ind.id !== Number(id))
                .map((ind: Industry) => (
                  <option key={ind.id} value={ind.id}>
                    {ind.name_en}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label htmlFor="solution_link" className="block text-sm font-semibold text-foreground mb-2">
              Solution Link
            </label>
            <input
              type="url"
              id="solution_link"
              name="solution_link"
              value={formData.solution_link}
              onChange={handleInputChange}
              placeholder="https://example.com"
              className="w-full px-4 py-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Industry Image
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
                <img src={previewImage || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" crossOrigin="anonymous" />
                <button
                  type="button"
                  onClick={() => {
                    setPreviewImage(null);
                    setUploadImage(null);
                    setFormData((prev) => ({ ...prev, image_url: '' }));
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

        {/* Applications - MOVED UP */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Applications</h3>
          <div className="flex gap-4 items-end bg-secondary/30 p-4 rounded-md border border-border">
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground mb-2">Application (EN)</label>
              <input
                type="text"
                value={newAppEn}
                onChange={(e) => setNewAppEn(e.target.value)}
                placeholder="e.g., Web Development"
                className="w-full px-4 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground mb-2">Application (VI)</label>
              <input
                type="text"
                value={newAppVi}
                onChange={(e) => setNewAppVi(e.target.value)}
                placeholder="e.g., Lập trình Web"
                className="w-full px-4 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              type="button"
              onClick={handleAddApplication}
              disabled={!newAppEn.trim() || !newAppVi.trim()}
              className="px-4 py-2 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white rounded-md transition-colors"
            >
              Add
            </button>
          </div>

          {formData.applications_en.length > 0 && (
            <div className="grid gap-2">
              {formData.applications_en.map((app, index) => (
                <div key={index} className="flex items-center gap-4 bg-secondary p-3 rounded-md">
                  <div className="flex-1 text-sm"><span className="font-semibold text-muted-foreground mr-2">EN:</span>{app}</div>
                  <div className="flex-1 text-sm"><span className="font-semibold text-muted-foreground mr-2">VI:</span>{formData.applications_vi[index]}</div>
                  <button
                    type="button"
                    onClick={() => handleRemoveApplication(index)}
                    className="text-destructive hover:text-destructive/80 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Introduction - MOVED DOWN */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Introduction</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Introduction (EN)</label>
              <TipTapEditor
                value={formData.introduction_en}
                onChange={(content) => setFormData(p => ({ ...p, introduction_en: content }))}
                placeholder="Introduction in English..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Introduction (VI)</label>
              <TipTapEditor
                value={formData.introduction_vi}
                onChange={(content) => setFormData(p => ({ ...p, introduction_vi: content }))}
                placeholder="Giới thiệu tiếng Việt..."
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t border-border">
          <Link
            href="/admin/industry"
            className="px-6 py-2 rounded-md border border-border hover:bg-secondary transition-colors text-foreground font-medium"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-accent hover:bg-accent/90 disabled:bg-accent/50 text-accent-foreground rounded-md transition-colors font-medium"
          >
            {loading ? 'Updating...' : 'Update Industry'}
          </button>
        </div>
      </form>
    </div>
  );
}

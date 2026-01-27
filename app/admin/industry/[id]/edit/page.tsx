'use client';

import React from "react"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, X } from 'lucide-react';
import Link from 'next/link';
import { TipTapEditor } from '@/components/admin/tiptap-editor';

interface EditIndustryPageProps {
  params: {
    id: string;
  };
}

export default function EditIndustryPage({ params }: EditIndustryPageProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>('https://via.placeholder.com/200');

  const [formData, setFormData] = useState({
    name: 'Technology',
    slug: 'technology',
    image_url: 'https://via.placeholder.com/200',
    introduction: '<p>A comprehensive guide to the technology industry...</p>',
    solution_link: 'https://example.com/solutions',
    applications: ['Web Development', 'Mobile Apps', 'Cloud Computing'],
    parent_id: '',
  });

  const [newApplication, setNewApplication] = useState('');

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
        setFormData((prev) => ({
          ...prev,
          image_url: result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddApplication = () => {
    if (newApplication.trim()) {
      setFormData((prev) => ({
        ...prev,
        applications: [...prev.applications, newApplication.trim()],
      }));
      setNewApplication('');
    }
  };

  const handleRemoveApplication = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      applications: prev.applications.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log('[v0] Updating industry:', params.id, formData);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      router.push('/admin/industry');
    }, 1000);
  };

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
        {/* Name & Slug */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-foreground mb-2">
              Industry Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Technology"
              required
              className="w-full px-4 py-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label htmlFor="slug" className="block text-sm font-semibold text-foreground mb-2">
              Slug <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              placeholder="e.g., technology"
              required
              className="w-full px-4 py-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">URL-friendly identifier (lowercase, no spaces)</p>
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Industry Image
          </label>
          <div className="flex gap-6">
            <div className="flex-1">
              <div className="relative border-2 border-dashed border-border rounded-md p-6 hover:bg-secondary/50 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center gap-2">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
              </div>
            </div>
            {previewImage && (
              <div className="w-40 h-40 bg-secondary rounded-md overflow-hidden flex items-center justify-center relative">
                <img src={previewImage || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setPreviewImage(null);
                    setFormData((prev) => ({ ...prev, image_url: '' }));
                  }}
                  className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Parent Industry */}
        <div>
          <label htmlFor="parent_id" className="block text-sm font-semibold text-foreground mb-2">
            Parent Industry (Optional)
          </label>
          <select
            id="parent_id"
            name="parent_id"
            value={formData.parent_id}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select a parent industry...</option>
            <option value="1">Technology</option>
            <option value="2">Healthcare</option>
            <option value="3">Finance</option>
          </select>
        </div>

        {/* Solution Link */}
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

        {/* Applications */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Applications
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newApplication}
              onChange={(e) => setNewApplication(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddApplication();
                }
              }}
              placeholder="Add an application..."
              className="flex-1 px-4 py-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={handleAddApplication}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors"
            >
              Add
            </button>
          </div>
          {formData.applications.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.applications.map((app, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-secondary text-secondary-foreground px-3 py-1 rounded-full"
                >
                  <span className="text-sm">{app}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveApplication(index)}
                    className="hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Introduction - Rich Text Editor */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Introduction
          </label>
          <TipTapEditor
            value={formData.introduction}
            onChange={(content) =>
              setFormData((prev) => ({
                ...prev,
                introduction: content,
              }))
            }
            placeholder="Write a detailed introduction about this industry..."
          />
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
            disabled={isLoading}
            className="px-6 py-2 bg-accent hover:bg-accent/90 disabled:bg-accent/50 text-accent-foreground rounded-md transition-colors font-medium"
          >
            {isLoading ? 'Updating...' : 'Update Industry'}
          </button>
        </div>
      </form>
    </div>
  );
}

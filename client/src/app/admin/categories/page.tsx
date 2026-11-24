'use client';

import React, { useState, useEffect } from 'react';
import { adminApi } from '@/features/admin/api';
import { AdminCategory } from '@/features/admin/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  FolderTree,
  PlusCircle,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Tag,
  Building2,
  X,
} from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [iconName, setIconName] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    const res = await adminApi.getCategories();
    if (res.success && res.data?.categories) {
      setCategories(res.data.categories);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setIconName('');
    setDisplayOrder('0');
    setIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = (cat: AdminCategory) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setIconName(cat.icon_name || '');
    setDisplayOrder(String(cat.display_order || 0));
    setIsActive(cat.is_active);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    const payload = {
      name,
      slug: slug || undefined,
      description: description || undefined,
      iconName: iconName || undefined,
      displayOrder: parseInt(displayOrder, 10) || 0,
      isActive,
    };

    let res;
    if (editingCategory) {
      res = await adminApi.updateCategory(editingCategory.id, payload);
    } else {
      res = await adminApi.createCategory(payload);
    }

    setIsSubmitting(false);

    if (res.success) {
      setModalOpen(false);
      setFeedback({
        type: 'success',
        text: `Category "${name}" ${editingCategory ? 'updated' : 'created'} successfully!`,
      });
      fetchCategories();
    } else {
      setFeedback({
        type: 'error',
        text: res.message || 'Operation failed. Please try again.',
      });
    }
  };

  const handleDelete = async (cat: AdminCategory) => {
    if (!confirm(`Are you sure you want to delete category "${cat.name}"?`)) return;
    const res = await adminApi.deleteCategory(cat.id);
    if (res.success) {
      setFeedback({ type: 'success', text: `Category "${cat.name}" deleted.` });
      fetchCategories();
    } else {
      setFeedback({ type: 'error', text: res.message || 'Failed to delete category.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Marketplace Categories</h1>
          <p className="text-xs text-slate-500 mt-1">
            Organize industries, sectors, and search hierarchy across businesses, products, and services.
          </p>
        </div>
        <Button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700 text-xs gap-1.5">
          <PlusCircle className="w-3.5 h-3.5" /> Add New Category
        </Button>
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

      {/* Categories Grid / Table */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="text-xs text-slate-500">Loading catalog categories...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => (
            <Card key={c.id} className="bg-white border-slate-200 shadow-sm hover:shadow transition flex flex-col justify-between">
              <CardContent className="pt-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                      <Tag className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{c.name}</h3>
                      <p className="text-[11px] text-slate-400 font-mono">/{c.slug}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      c.is_active
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {c.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {c.description && (
                  <p className="text-xs text-slate-500 line-clamp-2">{c.description}</p>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    {c.businesses_count || 0} Businesses
                  </span>
                  <span>Order: {c.display_order}</span>
                </div>
              </CardContent>

              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditModal(c)}
                  className="h-7 text-xs text-slate-600 hover:text-slate-900"
                >
                  <Edit2 className="w-3 h-3 mr-1" /> Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(c)}
                  className="h-7 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-3 h-3 mr-1" /> Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Dialog for Create/Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="catName" className="text-xs">Category Name</Label>
                <Input
                  id="catName"
                  placeholder="e.g. Industrial Automation"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="catSlug" className="text-xs">Slug (Optional, auto-generated if blank)</Label>
                <Input
                  id="catSlug"
                  placeholder="e.g. industrial-automation"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="catDesc" className="text-xs">Description</Label>
                <textarea
                  id="catDesc"
                  rows={2}
                  placeholder="Brief description of businesses in this category..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-md border border-input text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="catIcon" className="text-xs">Lucide Icon Name</Label>
                  <Input
                    id="catIcon"
                    placeholder="e.g. Cpu, Wrench"
                    value={iconName}
                    onChange={(e) => setIconName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="catOrder" className="text-xs">Display Order</Label>
                  <Input
                    id="catOrder"
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="catActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <Label htmlFor="catActive" className="text-xs font-medium cursor-pointer">
                  Active (Visible on public discovery pages)
                </Label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  size="sm"
                  className="text-xs bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

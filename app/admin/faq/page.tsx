"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getAllFAQs, createFAQ, updateFAQ, deleteFAQ, toggleFAQStatus } from "@/lib/actions/faq";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n/use-translation";

interface FAQ {
  id: string;
  question: string;
  questionEn: string;
  answer: string;
  answerEn: string;
  category: string | null;
  order: number;
  isActive: boolean;
  createdAt: Date;
}

export default function AdminFAQPage() {
  const { locale } = useTranslation();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    question: "",
    questionEn: "",
    answer: "",
    answerEn: "",
    category: "",
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    setIsLoading(true);
    try {
      const data = await getAllFAQs();
      setFaqs((data as { faqs: FAQ[]; total: number }).faqs);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingId) {
        const result = await updateFAQ(editingId, {
          question: formData.question,
          questionEn: formData.questionEn,
          answer: formData.answer,
          answerEn: formData.answerEn,
          category: formData.category || null,
          order: formData.order,
          isActive: formData.isActive,
        });
        if (result.success) {
          toast.success("FAQ updated successfully");
          setEditingId(null);
        } else {
          toast.error(result.error || "Failed to update FAQ");
        }
      } else {
        const result = await createFAQ({
          question: formData.question,
          questionEn: formData.questionEn,
          answer: formData.answer,
          answerEn: formData.answerEn,
          category: formData.category || null,
          order: formData.order,
          isActive: formData.isActive,
        });
        if (result.success) {
          toast.success("FAQ created successfully");
        } else {
          toast.error(result.error || "Failed to create FAQ");
        }
      }

      setFormData({
        question: "",
        questionEn: "",
        answer: "",
        answerEn: "",
        category: "",
        order: 0,
        isActive: true,
      });

      fetchFAQs();
    } catch (error) {
      toast.error("Failed to save FAQ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (faq: FAQ) => {
    setEditingId(faq.id);
    setFormData({
      question: faq.question,
      questionEn: faq.questionEn,
      answer: faq.answer,
      answerEn: faq.answerEn,
      category: faq.category || "",
      order: faq.order,
      isActive: faq.isActive,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;

    try {
      const result = await deleteFAQ(id);
      if (result.success) {
        toast.success("FAQ deleted successfully");
        fetchFAQs();
      } else {
        toast.error(result.error || "Failed to delete FAQ");
      }
    } catch (error) {
      toast.error("Failed to delete FAQ");
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const result = await toggleFAQStatus(id);
      if (result.success) {
        toast.success("FAQ status updated");
        fetchFAQs();
      } else {
        toast.error(result.error || "Failed to update status");
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      question: "",
      questionEn: "",
      answer: "",
      answerEn: "",
      category: "",
      order: 0,
      isActive: true,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">FAQ Management</h1>
          <p className="text-muted-foreground">Manage frequently asked questions</p>
        </div>
      </div>

      {/* Add/Edit Form */}
      <div className="bg-card rounded-lg p-6 border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          {editingId ? "Edit FAQ" : "Add New FAQ"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Question (Bengali) *</Label>
              <Input
                value={formData.question}
                onChange={(e) =>
                  setFormData({ ...formData, question: e.target.value })
                }
                placeholder="প্রশ্ন বাংলায়"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label>Question (English) *</Label>
              <Input
                value={formData.questionEn}
                onChange={(e) =>
                  setFormData({ ...formData, questionEn: e.target.value })
                }
                placeholder="Question in English"
                required
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Answer (Bengali) *</Label>
              <Textarea
                value={formData.answer}
                onChange={(e) =>
                  setFormData({ ...formData, answer: e.target.value })
                }
                placeholder="উত্তর বাংলায়"
                required
                rows={3}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Answer (English) *</Label>
              <Textarea
                value={formData.answerEn}
                onChange={(e) =>
                  setFormData({ ...formData, answerEn: e.target.value })
                }
                placeholder="Answer in English"
                required
                rows={3}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>Category</Label>
              <Input
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="e.g., shipping, payment"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Order</Label>
              <Input
                type="number"
                value={formData.order}
                onChange={(e) =>
                  setFormData({ ...formData, order: parseInt(e.target.value) || 0 })
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label>Active</Label>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="rounded border-border"
                />
                <span className="text-sm text-muted-foreground">
                  Show on public page
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {editingId && (
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : editingId ? (
                "Update FAQ"
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add FAQ
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* FAQ List */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 font-medium text-foreground">Question</th>
              <th className="text-left p-4 font-medium text-foreground">Category</th>
              <th className="text-center p-4 font-medium text-foreground">Order</th>
              <th className="text-center p-4 font-medium text-foreground">Status</th>
              <th className="text-center p-4 font-medium text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {faqs.map((faq) => (
              <tr key={faq.id} className="border-t border-border">
                <td className="p-4">
                  <p className="font-medium text-foreground line-clamp-1">{faq.question}</p>
                  <p className="text-sm text-muted-foreground line-clamp-1">{faq.questionEn}</p>
                </td>
                <td className="p-4 text-muted-foreground">
                  {faq.category || "-"}
                </td>
                <td className="p-4 text-center text-muted-foreground">
                  {faq.order}
                </td>
                <td className="p-4 text-center">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                      faq.isActive
                        ? "bg-success/10 text-success"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {faq.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleStatus(faq.id)}
                      title={faq.isActive ? "Deactivate" : "Activate"}
                    >
                      {faq.isActive ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(faq)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(faq.id)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {faqs.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No FAQs found. Add your first FAQ above.
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ArrowLeft, Plus, X } from "lucide-react";
import InputField from "../../../components/admin/ui/InputField";
import TextArea from "../../../components/admin/ui/TextArea";
import { faqApi } from "../../../services/api";
import toast from "react-hot-toast";
import SelectField from "../../../components/admin/ui/SelectField";
import { toSelectOptions } from "../../../utils/utils";

const faqValidationSchema = z.object({
  question: z.string().min(10, "Question must be at least 10 characters"),
  answer: z.string().min(50, "Answer must be at least 50 characters"),
  category: z.string().min(1, "Category required"),
  keywords: z.array(z.string()).optional().default([]),
  published: z.boolean().default(true),
  order: z.number().optional(),
});

const categories = [
  "General",
  "Services",
  "Projects",
  "Process",
  "Pricing",
  "Timeline",
  "Technical",
];

const FAQForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!id);
  const [submitting, setSubmitting] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState("");

  // Typed off the schema so `errors.x` is a FieldError InputField accepts.
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<z.input<typeof faqValidationSchema>>({
    resolver: zodResolver(faqValidationSchema),
    defaultValues: {
      published: true,
      keywords: [],
    },
  });

  useEffect(() => {
    if (id) {
      const fetchFAQ = async () => {
        try {
          const { data } = await faqApi.getById(id);
          if (data?.success) {
            const faq = data.data;
            reset({
              question: faq.question,
              answer: faq.answer,
              category: faq.category,
              published: faq.published,
              order: faq.order,
            });
            setKeywords(faq.keywords || []);
          }
        } catch (err) {
          toast.error("Failed to load FAQ");
        } finally {
          setLoading(false);
        }
      };
      fetchFAQ();
    }
  }, [id, reset]);

  const onSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        keywords,
      };

      if (id) {
        await faqApi.update(id, payload);
        toast.success("FAQ updated");
      } else {
        await faqApi.create(payload);
        toast.success("FAQ created");
      }

      navigate("/admin/faq");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save FAQ");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-ink">
        Loading...
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/admin/faq")}
          className="p-2 rounded-lg bg-raise hover:bg-line hover:text-ink transition-colors"
        >
          <ArrowLeft size={20} className="text-ink" />
        </button>
        <div>
          <h1 className="text-3xl font-semibold text-ink">
            {id ? "Edit FAQ" : "New FAQ"}
          </h1>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-paper rounded-2xl p-8 space-y-6">
          {/* Question */}
          <TextArea
            label="Question *"
            labelClassName="text-sm font-bold text-ink-soft"
            {...register("question")}
            rows={3}
            className="resize-none"
            placeholder="What is your question?"
            error={Boolean(errors.question)}
            hint={errors.question?.message as string | undefined}
          />

          {/* Answer */}
          <TextArea
            label="Answer *"
            labelClassName="text-sm font-bold text-ink-soft"
            {...register("answer")}
            rows={6}
            className="resize-none"
            placeholder="Detailed answer to the question..."
            error={Boolean(errors.answer)}
            hint={errors.answer?.message as string | undefined}
          />

          {/* Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <SelectField
                  label="Category *"
                  labelClassName="text-sm font-bold text-ink-soft"
                  placeholder="Select category"
                  value={field.value}
                  onValueChange={field.onChange}
                  options={toSelectOptions(categories)}
                  error={!!errors.category}
                  hint={errors.category?.message as string | undefined}
                />
              )}
            />

            <InputField
              label="Order"
              type="number"
              {...register("order", { valueAsNumber: true })}
              error={!!errors.order}
              hint={errors.order?.message as string}
              placeholder="Display order"
            />
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-sm font-bold text-ink-soft mb-2">
              Keywords (SEO)
            </label>
            <div className="flex gap-2 mb-3">
              <div className="flex-1">
                <InputField
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="Add keyword"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (newKeyword) {
                    setKeywords([...keywords, newKeyword]);
                    setNewKeyword("");
                  }
                }}
                className="px-4 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors flex items-center gap-2"
              >
                <Plus size={18} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {keywords.map((kw, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-1 bg-accent/20 text-accent rounded-full"
                >
                  <span>{kw}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setKeywords(keywords.filter((_, idx) => idx !== i))
                    }
                    className="text-accent/60 hover:text-accent"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Status */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register("published")}
              className="w-4 h-4 rounded"
            />
            <span className="text-ink-soft font-medium">Publish this FAQ</span>
          </label>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate("/admin/faq")}
            className="flex-1 px-6 py-3 border border-line text-ink-soft rounded-xl font-bold hover:bg-raise transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-6 py-3 bg-accent text-white rounded-xl font-bold hover:shadow-lg hover:shadow-accent/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 size={18} className="animate-spin" />}
            {id ? "Update FAQ" : "Create FAQ"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FAQForm;

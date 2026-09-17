import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { Loader2, ArrowLeft, Save } from "lucide-react";

import { SectionCard } from "@/components/admin/ui/SectionCard";
import TextArea from "@/components/admin/ui/TextArea";

import { FAQ_LIMITS } from "@/lib/constants/faq";
import { faqApi } from "@/services/api";

// Same limits and same wording as the server, so a field never passes here and
// comes back rejected with a different sentence.
const copy = (label: string, { min, max }: { min: number; max: number }) =>
  z
    .string()
    .trim()
    .min(min, `${label} must be at least ${min} characters`)
    .max(
      max,
      `${label} must be ${max.toLocaleString("en-US")} characters or fewer`,
    );

const faqValidationSchema = z.object({
  question: copy("Question", FAQ_LIMITS.question),
  answer: copy("Answer", FAQ_LIMITS.answer),
});

type FaqFormValues = z.infer<typeof faqValidationSchema>;

const FAQForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(!!id);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<FaqFormValues>({
    resolver: zodResolver(faqValidationSchema),
  });

  useEffect(() => {
    if (!id) return;

    const fetchFAQ = async () => {
      try {
        const { data } = await faqApi.getById(id);
        if (data?.success) {
          reset({ question: data.data.question, answer: data.data.answer });
        }
      } catch {
        toast.error("Failed to load FAQ");
      } finally {
        setLoading(false);
      }
    };
    fetchFAQ();
  }, [id, reset]);

  // A new FAQ is appended to the end of the list by the server; dragging in the
  // list is what moves it.
  const onSubmit = async (values: FaqFormValues) => {
    let message = "Failed to save FAQ";
    let isError = true;

    setSubmitting(true);

    try {
      const response = id
        ? await faqApi.update(id, values)
        : await faqApi.create(values);

      message = response.data?.message || message;

      if (response.data?.success) {
        isError = false;
        navigate("/admin/faq");
      }
    } catch (error) {
      if (isAxiosError(error)) {
        message = error.response?.data?.message || message;
      }
    } finally {
      if (isError) {
        toast.error(message);
      } else {
        toast.success(message);
      }

      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-ink-faint" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate("/admin/faq")}
          aria-label="Back to FAQs"
          className="p-2 rounded-lg bg-raise hover:bg-line transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-ink" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-ink">
            {id ? "Edit FAQ" : "New FAQ"}
          </h2>
          <p className="text-sm text-ink-mute">
            A question and its answer, rendered by every FAQ style.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <SectionCard title="FAQ Content">
          <TextArea
            label="Question"
            required
            {...register("question")}
            value={watch("question") ?? ""}
            rows={2}
            maxChars={FAQ_LIMITS.question.max}
            placeholder="What is your question?"
            error={!!errors.question}
          />

          <TextArea
            label="Answer"
            required
            {...register("answer")}
            value={watch("answer") ?? ""}
            rows={6}
            maxChars={FAQ_LIMITS.answer.max}
            placeholder="Detailed answer to the question..."
            error={!!errors.answer}
          />
        </SectionCard>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2.5 bg-info hover:bg-info text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {id ? "Save Changes" : "Create FAQ"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FAQForm;

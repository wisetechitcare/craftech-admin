import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit2,
  Trash2,
  Palette,
  Loader2,
  RotateCcw,
  Save,
  Plus,
} from "lucide-react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";

import {
  AdminInfoCallout,
  CommonTable,
  PageHeader,
  type Column,
} from "@/components/common";
import {
  DragHandle,
  dragStateClasses,
  useDragItem,
} from "@/components/admin/ui/DragList";
import PreviewPanel from "@/components/admin/ui/PreviewPanel";
import SectionContentCard from "@/components/admin/ui/SectionContentCard";
import { SectionCard } from "@/components/admin/ui/SectionCard";
import { PreviewSection } from "@/components/admin/ui/SitePreview";
import {
  SectionVisibilitySwitch,
  isVisible,
  type VisibilityMap,
} from "@/components/admin/ui/VisibilityToggle";
import { Button } from "@/components/ui/button";

import { DragList } from "@/lib/constants/drag-lists";
import { FAQ_SECTION_FIELDS, FAQ_VISIBILITY_KEY } from "@/lib/constants/faq";
import { appearanceApi, faqApi } from "@/services/api";
import {
  EMPTY_FAQ_SECTION,
  type FaqItem,
  type FaqSectionContent,
} from "@/types/faq";
import { move } from "@/utils/utils";

interface FaqQuestionProps {
  faq: FaqItem;
  index: number;
  count: number;
  onMove: (from: number, to: number) => void;
}

/** The question cell, and the drag for its whole row. CommonTable renders each
 *  <tr> itself and takes no ref, so this claims the row it is drawn inside. */
const FaqQuestion = ({ faq, index, count, onMove }: FaqQuestionProps) => {
  const { ref, handleProps, isDragging, isTarget } =
    useDragItem<HTMLTableRowElement>({
      listId: DragList.FAQ_ITEMS,
      index,
      onMove,
      disabled: count < 2,
    });
  const row = ref as React.MutableRefObject<HTMLTableRowElement | null>;

  // ponytail: the drag highlight is put on the <tr> by hand because CommonTable
  // owns that row's className; a re-render mid-drag clears it until the next
  // drag event. A row-props hook on CommonTable would let React own it.
  useEffect(() => {
    const element = row.current;
    const classes = dragStateClasses(isDragging, isTarget)
      .split(" ")
      .filter(Boolean);
    element?.classList.add(...classes);
    return () => element?.classList.remove(...classes);
  }, [row, isDragging, isTarget]);

  return (
    <div
      ref={(node) => {
        row.current = node?.closest("tr") ?? null;
      }}
      className="flex items-center gap-2"
    >
      <DragHandle {...handleProps} label={faq.question} className="-ml-2" />
      <p className="font-bold text-ink">{faq.question}</p>
    </div>
  );
};

const ids = (faqs: FaqItem[]) => faqs.map((faq) => faq._id);

const FAQManager = () => {
  const navigate = useNavigate();
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  // The order as the server last confirmed it. Dragging only moves `faqs`;
  // this is what "Save order" sends against and what "Reset" restores.
  const [saved, setSaved] = useState<FaqItem[]>([]);
  const [max, setMax] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [savingOrder, setSavingOrder] = useState<boolean>(false);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  // Lifted out of the section card so the preview draws the unsaved copy.
  const [section, setSection] = useState<FaqSectionContent>(EMPTY_FAQ_SECTION);
  const [visibility, setVisibility] = useState<VisibilityMap>({});

  const isFull = max > 0 && faqs.length >= max;
  const isReordered = ids(faqs).join() !== ids(saved).join();
  const sectionVisible = isVisible(visibility, FAQ_VISIBILITY_KEY);

  const fetchFAQs = async () => {
    try {
      const { data } = await faqApi.list();
      if (data?.success) {
        setFaqs(data.data);
        setSaved(data.data);
        setMax(data.limit.max);
      }
    } catch {
      toast.error("Failed to load FAQs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFAQs();

    faqApi
      .getSection()
      .then(({ data }) => data?.success && setSection(data.data))
      .catch(() => toast.error("Failed to load the FAQ section content"));

    appearanceApi
      .get()
      .then(({ data }) => setVisibility(data.data.visibility ?? {}))
      .catch(() => toast.error("Failed to load section visibility"));
  }, []);

  const handleDelete = async (id: string) => {
    let message = "Failed to delete FAQ";
    let isError = true;

    try {
      const response = await faqApi.remove(id);

      message = response.data?.message || message;

      if (response.data?.success) {
        isError = false;
        setDeleteModal(null);
        // An unsaved drag is dropped with the row it may have moved.
        await fetchFAQs();
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
    }
  };

  // Dragging is local: no request until the admin says the arrangement is done.
  const moveFaq = (from: number, to: number) =>
    setFaqs((prev) => move(prev, from, to));

  const columns: Column<FaqItem>[] = [
    {
      id: "index",
      header: "Sr. No.",
      cell: (faq, index) => <p className="text-sm font-bold">{index + 1}</p>,
      widthClassName: "w-30",
    },
    {
      id: "question",
      header: "Question",
      cell: (faq, index) => (
        <FaqQuestion
          faq={faq}
          index={index}
          count={faqs.length}
          onMove={moveFaq}
        />
      ),
    },
    {
      id: "answer",
      header: "Answer",
      cell: (faq) => <p className="truncate text-sm">{faq.answer}</p>,
    },
    {
      id: "actions",
      header: "Actions",
      align: "right",
      isActions: true,
      widthClassName: "w-32",
      cell: (faq) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="none"
            onClick={() => navigate(`/admin/faq/${faq._id}`)}
            className="p-2 rounded-lg bg-info/10 text-info hover:bg-info/15 transition-colors"
            title="Edit"
          >
            <Edit2 size={16} />
          </Button>
          <Button
            variant="none"
            onClick={() => setDeleteModal(faq._id)}
            className="p-2 rounded-lg bg-danger/10 text-danger hover:bg-danger/15 transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
  ];

  const saveOrder = async () => {
    let message = "Failed to save the new FAQ order";
    let isError = true;

    setSavingOrder(true);

    try {
      const response = await faqApi.reorder(ids(faqs));

      message = response.data?.message || message;

      if (response.data?.success) {
        isError = false;
        setSaved(faqs);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        message = error.response?.data?.message || message;
      }
    } finally {
      if (isError) {
        toast.error(message);
        fetchFAQs();
      } else {
        toast.success(message);
      }

      setSavingOrder(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="FAQs"
        count={faqs.length}
        max={max}
        description="Manage frequently asked questions. The switch hides the whole section; nothing is deleted."
        action={
          <SectionVisibilitySwitch
            visible={sectionVisible}
            onChange={(visible) =>
              setVisibility((prev) => ({
                ...prev,
                [FAQ_VISIBILITY_KEY]: visible,
              }))
            }
          />
        }
      />

      <AdminInfoCallout
        icon={Palette}
        description="Every FAQ style renders the same questions and answers below. Which style is shown is set under Appearance → FAQ."
        action={
          <Link
            to="/admin/appearance/faq"
            className="text-xs font-bold text-info underline underline-offset-2"
          >
            Change in Appearance
          </Link>
        }
      />

      <PreviewPanel
        section={PreviewSection.FAQ}
        placement="above"
        draft={{ faqContent: { faqs, section }, appearance: { visibility } }}
        caption="The live FAQ section, rendered by the website itself. Unsaved copy, order and visibility show here before you save them."
        sectionHidden={!isVisible(visibility, "home.faq")}
        onShowSection={() =>
          setVisibility((prev) => ({ ...prev, "home.faq": true }))
        }
      >
        <SectionContentCard
          name="FAQ"
          description="Shown above the questions in every FAQ style. Leave a field empty to keep the text shown as its placeholder."
          fields={FAQ_SECTION_FIELDS}
          content={section}
          onChange={setSection}
          onSave={faqApi.updateSection}
          visibilityKey={FAQ_VISIBILITY_KEY}
          visibility={visibility}
          onVisibilityChange={setVisibility}
        />

        <SectionCard
          title="Questions"
          description="Drag a row by its handle to reorder them."
          controls={
            <Button
              variant="primary"
              disabled={isFull}
              size="sm"
              startIcon={<Plus size={20} />}
              onClick={() => navigate("/admin/faq/new")}
              className="text-sm font-bold"
            >
              Add FAQ
            </Button>
          }
        >
          {isReordered && (
            <div className="flex items-center justify-between gap-4 rounded-xl border border-line bg-info/10 px-6 py-3">
              <p className="text-sm font-medium text-ink">
                The order has changed. Save it to publish the new arrangement.
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="none"
                  size="xs"
                  onClick={() => setFaqs(saved)}
                  disabled={savingOrder}
                  startIcon={<RotateCcw size={14} />}
                  className="gap-1.5 text-sm font-medium text-ink-soft hover:bg-raise"
                >
                  Reset
                </Button>
                <Button
                  variant="none"
                  size="xs"
                  onClick={saveOrder}
                  disabled={savingOrder}
                  startIcon={
                    savingOrder ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Save size={14} />
                    )
                  }
                  className="gap-1.5 bg-info px-4 py-2 text-sm font-medium text-white"
                >
                  Save order
                </Button>
              </div>
            </div>
          )}

          <CommonTable
            columns={columns}
            data={faqs}
            rowKey={(faq) => faq._id}
            loading={loading}
            showEmptyMessage
            emptyMessage="No FAQs yet. Create your first one!"
          />
        </SectionCard>
      </PreviewPanel>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink/40 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-paper rounded-2xl p-8 max-w-sm"
            >
              <h3 className="text-xl font-semibold text-ink mb-4">
                Delete FAQ?
              </h3>
              <p className="text-ink-mute mb-8">
                This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteModal(null)}
                  className="flex-1 font-bold"
                >
                  Cancel
                </Button>
                <Button
                  variant="none"
                  size="sm"
                  onClick={() => handleDelete(deleteModal)}
                  className="flex-1 bg-danger font-bold text-white"
                >
                  Delete
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FAQManager;

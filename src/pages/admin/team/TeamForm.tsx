import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ArrowLeft, Plus, X } from "lucide-react";
import InputField from "../../../components/admin/ui/InputField";
import TextArea from "../../../components/admin/ui/TextArea";
import { teamApi } from "../../../services/api";
import toast from "react-hot-toast";
import SelectField from "../../../components/admin/ui/SelectField";
import { toSelectOptions } from "../../../utils/utils";

const teamValidationSchema = z.object({
  name: z.string().min(2, "Name required"),
  role: z.string().min(2, "Role required"),
  department: z.string().min(1, "Department required"),
  bio: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  linkedin: z.string().optional(),
  twitter: z.string().optional(),
  yearsOfExperience: z.number().optional(),
  expertise: z.array(z.string()).optional().default([]),
  certifications: z.array(z.string()).optional().default([]),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
});

// Must match the backend department enum (routes/cms/team.js).
const departments = [
  "Leadership",
  "Projects",
  "Design",
  "Engineering",
  "Finance",
  "Operations",
];

const TeamForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!id);
  const [submitting, setSubmitting] = useState(false);
  const [expertise, setExpertise] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [newExpertise, setNewExpertise] = useState("");
  const [newCert, setNewCert] = useState("");

  // Typed off the schema so `errors.x` is a FieldError, not the loose union
  // `useForm<any>` produces — the fields read `.message` off it.
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<z.input<typeof teamValidationSchema>>({
    resolver: zodResolver(teamValidationSchema),
    defaultValues: {
      active: true,
      featured: false,
      expertise: [],
      certifications: [],
    },
  });

  useEffect(() => {
    if (id) {
      const fetchMember = async () => {
        try {
          const { data } = await teamApi.getById(id);
          if (data?.success) {
            const member = data.data;
            reset({
              name: member.name,
              role: member.role,
              department: member.department,
              bio: member.bio,
              description: member.description,
              image: member.image,
              email: member.contact?.email,
              phone: member.contact?.phone,
              linkedin: member.social?.linkedin,
              twitter: member.social?.twitter,
              yearsOfExperience: member.yearsOfExperience,
              active: member.active,
              featured: member.featured,
            });
            setExpertise(member.expertise || []);
            setCertifications(member.certifications || []);
          }
        } catch (err) {
          toast.error("Failed to load team member");
        } finally {
          setLoading(false);
        }
      };
      fetchMember();
    }
  }, [id, reset]);

  const onSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      // Drop empty strings / NaN so optional format-validated fields (email, urls)
      // are omitted rather than rejected by the backend schema.
      const clean = (obj: any) =>
        Object.fromEntries(
          Object.entries(obj).filter(
            ([, v]) =>
              v !== "" &&
              v !== undefined &&
              v !== null &&
              !(typeof v === "number" && Number.isNaN(v)),
          ),
        );

      const contact = clean({ email: values.email, phone: values.phone });
      const social = clean({
        linkedin: values.linkedin,
        twitter: values.twitter,
      });
      const payload: any = clean({
        name: values.name,
        role: values.role,
        department: values.department,
        bio: values.bio,
        description: values.description,
        image: values.image,
        yearsOfExperience: values.yearsOfExperience,
        active: values.active,
        featured: values.featured,
      });
      if (Object.keys(contact).length) payload.contact = contact;
      if (Object.keys(social).length) payload.social = social;
      payload.expertise = expertise;
      payload.certifications = certifications;

      if (id) {
        await teamApi.update(id, payload);
        toast.success("Team member updated");
      } else {
        await teamApi.create(payload);
        toast.success("Team member created");
      }

      navigate("/admin/team");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save team member");
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
          onClick={() => navigate("/admin/team")}
          className="p-2 rounded-lg bg-raise hover:bg-line hover:text-ink transition-colors"
        >
          <ArrowLeft size={20} className="text-ink" />
        </button>
        <div>
          <h1 className="text-3xl font-semibold text-ink">
            {id ? "Edit Team Member" : "New Team Member"}
          </h1>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-paper rounded-2xl p-8 space-y-6">
          {/* Name & Role */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Name"
              required
              type="text"
              {...register("name")}
              error={!!errors.name}
              hint={errors.name?.message as string}
              placeholder="Full name"
            />

            <InputField
              label="Role"
              required
              type="text"
              {...register("role")}
              error={!!errors.role}
              hint={errors.role?.message as string}
              placeholder="Job title"
            />
          </div>

          {/* Department */}
          <Controller
            name="department"
            control={control}
            render={({ field }) => (
              <SelectField
                label="Department *"
                labelClassName="text-sm font-bold text-ink-soft"
                placeholder="Select department"
                value={field.value}
                onValueChange={field.onChange}
                options={toSelectOptions(departments)}
                error={!!errors.department}
                hint={errors.department?.message as string | undefined}
              />
            )}
          />

          {/* Bio & Description */}
          <TextArea
            label="Bio"
            labelClassName="text-sm font-bold text-ink-soft"
            {...register("bio")}
            rows={3}
            className="resize-none"
            placeholder="Short bio"
          />

          <TextArea
            label="Description"
            labelClassName="text-sm font-bold text-ink-soft"
            {...register("description")}
            rows={4}
            className="resize-none"
            placeholder="Detailed description"
          />

          {/* Image */}
          <InputField
            label="Image URL"
            type="url"
            {...register("image")}
            error={!!errors.image}
            hint={errors.image?.message as string}
            placeholder="https://..."
          />

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Email"
              type="email"
              {...register("email")}
              error={!!errors.email}
              hint={errors.email?.message as string}
              placeholder="email@example.com"
            />

            <InputField
              label="Phone"
              type="tel"
              {...register("phone")}
              error={!!errors.phone}
              hint={errors.phone?.message as string}
              placeholder="+91 93248 77493"
            />
          </div>

          {/* Social Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="LinkedIn URL"
              type="url"
              {...register("linkedin")}
              error={!!errors.linkedin}
              hint={errors.linkedin?.message as string}
              placeholder="https://linkedin.com/in/..."
            />

            <InputField
              label="Twitter URL"
              type="url"
              {...register("twitter")}
              error={!!errors.twitter}
              hint={errors.twitter?.message as string}
              placeholder="https://twitter.com/..."
            />
          </div>

          {/* Experience */}
          <InputField
            label="Years of Experience"
            type="number"
            {...register("yearsOfExperience", { valueAsNumber: true })}
            error={!!errors.yearsOfExperience}
            hint={errors.yearsOfExperience?.message as string}
            placeholder="10"
          />

          {/* Expertise */}
          <div>
            <label className="block text-sm font-bold text-ink-soft mb-2">
              Expertise
            </label>
            <div className="flex gap-2 mb-3">
              <div className="flex-1">
                <InputField
                  type="text"
                  value={newExpertise}
                  onChange={(e) => setNewExpertise(e.target.value)}
                  placeholder="Add expertise skill"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (newExpertise) {
                    setExpertise([...expertise, newExpertise]);
                    setNewExpertise("");
                  }
                }}
                className="px-4 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors flex items-center gap-2"
              >
                <Plus size={18} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {expertise.map((exp, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-1 bg-accent/20 text-accent rounded-full"
                >
                  <span>{exp}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setExpertise(expertise.filter((_, idx) => idx !== i))
                    }
                    className="text-accent/60 hover:text-accent"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div>
            <label className="block text-sm font-bold text-ink-soft mb-2">
              Certifications
            </label>
            <div className="flex gap-2 mb-3">
              <div className="flex-1">
                <InputField
                  type="text"
                  value={newCert}
                  onChange={(e) => setNewCert(e.target.value)}
                  placeholder="Add certification"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (newCert) {
                    setCertifications([...certifications, newCert]);
                    setNewCert("");
                  }
                }}
                className="px-4 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors flex items-center gap-2"
              >
                <Plus size={18} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {certifications.map((cert, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-1 bg-accent/20 text-accent rounded-full"
                >
                  <span>{cert}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setCertifications(
                        certifications.filter((_, idx) => idx !== i),
                      )
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
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register("active")}
                className="w-4 h-4 rounded"
              />
              <span className="text-ink-soft font-medium">Active</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register("featured")}
                className="w-4 h-4 rounded"
              />
              <span className="text-ink-soft font-medium">Featured</span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate("/admin/team")}
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
            {id ? "Update Member" : "Create Member"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TeamForm;

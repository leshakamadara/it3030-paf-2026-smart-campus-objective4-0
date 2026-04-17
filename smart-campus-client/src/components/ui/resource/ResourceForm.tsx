import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  useForm,
  useWatch,
  type SubmitHandler,
  type UseFormRegisterReturn,
} from "react-hook-form";
import { z } from "zod";
import type {
  ResourceRequest,
  ResourceStatus,
  ResourceType,
} from "../../../types/resource";

// ─── Constants ───────────────────────────────────────────────────────────────

const RESOURCE_TYPES: ResourceType[] = [
  "LECTURE_HALL",
  "LAB",
  "MEETING_ROOM",
  "PROJECTOR",
  "CAMERA",
];

const RESOURCE_STATUSES: ResourceStatus[] = ["ACTIVE", "OUT_OF_SERVICE"];

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ACCEPTED_IMAGE_EXTENSIONS = ".jpg, .jpeg, .png, .webp, .gif";

const FIELD_LIMITS = {
  resourceCode: 50,
  name: 100,
  building: 100,
  description: 500,
} as const;

const TYPE_LABELS: Record<ResourceType, string> = {
  LECTURE_HALL: "Lecture Hall",
  LAB: "Lab",
  MEETING_ROOM: "Meeting Room",
  PROJECTOR: "Projector",
  CAMERA: "Camera",
};

// ─── Schema ───────────────────────────────────────────────────────────────────

const resourceFormSchema = z
  .object({
    resourceCode: z
      .string()
      .min(1, "Resource code is required")
      .max(FIELD_LIMITS.resourceCode, `Max ${FIELD_LIMITS.resourceCode} characters`),
    name: z
      .string()
      .min(1, "Name is required")
      .max(FIELD_LIMITS.name, `Max ${FIELD_LIMITS.name} characters`),
    type: z.enum(RESOURCE_TYPES as [ResourceType, ...ResourceType[]], {
      error: "Type is required",
    }),
    building: z
      .string()
      .min(1, "Building is required")
      .max(FIELD_LIMITS.building, `Max ${FIELD_LIMITS.building} characters`),
    status: z.enum(RESOURCE_STATUSES as [ResourceStatus, ...ResourceStatus[]], {
      error: "Status is required",
    }),
    availableFrom: z.string().min(1, "Start time is required"),
    availableTo: z.string().min(1, "End time is required"),
    isBookable: z.boolean(),
    isUnderMaintenance: z.boolean(),
    description: z
      .string()
      .max(FIELD_LIMITS.description, `Max ${FIELD_LIMITS.description} characters`),
    capacity: z.string(),
    imageUrl: z.string(),
    hasProjector: z.boolean(),
    hasAc: z.boolean(),
    hasWhiteboard: z.boolean(),
    hasWifi: z.boolean(),
    hasComputers: z.boolean(),
    hasWindows: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.availableFrom && data.availableTo && data.availableFrom >= data.availableTo) {
      ctx.addIssue({
        code: "custom",
        path: ["availableTo"],
        message: "End time must be later than start time",
      });
    }

    if (data.capacity.trim() !== "") {
      const parsed = Number(data.capacity);
      if (Number.isNaN(parsed) || !Number.isInteger(parsed)) {
        ctx.addIssue({ code: "custom", path: ["capacity"], message: "Capacity must be a whole number" });
      } else if (parsed < 0) {
        ctx.addIssue({ code: "custom", path: ["capacity"], message: "Capacity must be 0 or greater" });
      } else if (parsed > 99999) {
        ctx.addIssue({ code: "custom", path: ["capacity"], message: "Capacity must be less than 100,000" });
      }
    }

    if (data.imageUrl.trim() !== "" && !data.imageUrl.trim().startsWith("data:")) {
      try {
        new URL(data.imageUrl.trim());
      } catch {
        ctx.addIssue({ code: "custom", path: ["imageUrl"], message: "Must be a valid URL" });
      }
    }

    if (data.status === "OUT_OF_SERVICE" && data.isBookable) {
      ctx.addIssue({
        code: "custom",
        path: ["isBookable"],
        message: "An out-of-service resource cannot be bookable",
      });
    }

    if (data.isBookable && data.isUnderMaintenance) {
      ctx.addIssue({
        code: "custom",
        path: ["isUnderMaintenance"],
        message: "A bookable resource cannot be under maintenance",
      });
    }
  });

type ResourceFormValues = z.input<typeof resourceFormSchema>;
type ResourceFormOutput = z.output<typeof resourceFormSchema>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const normalizeTime = (value?: string) => (value?.length >= 5 ? value.slice(0, 5) : value ?? "");

const toBackendTime = (value: string) => (value.length === 5 ? `${value}:00` : value);

const toFormValues = (initial?: Partial<ResourceRequest>): ResourceFormValues => ({
  resourceCode: initial?.resourceCode ?? "",
  name: initial?.name ?? "",
  type: initial?.type ?? "LAB",
  building: initial?.building ?? "",
  status: initial?.status ?? "ACTIVE",
  availableFrom: normalizeTime(initial?.availableFrom) || "08:00",
  availableTo: normalizeTime(initial?.availableTo) || "17:00",
  isBookable: initial?.isBookable ?? true,
  isUnderMaintenance: initial?.isUnderMaintenance ?? false,
  description: initial?.description ?? "",
  capacity: initial?.capacity == null ? "" : String(initial.capacity),
  imageUrl: initial?.imageUrl ?? "",
  hasProjector: initial?.hasProjector ?? false,
  hasAc: initial?.hasAc ?? false,
  hasWhiteboard: initial?.hasWhiteboard ?? false,
  hasWifi: initial?.hasWifi ?? false,
  hasComputers: initial?.hasComputers ?? false,
  hasWindows: initial?.hasWindows ?? false,
});

const toResourceRequest = (values: ResourceFormOutput): ResourceRequest => ({
  resourceCode: values.resourceCode.trim(),
  name: values.name.trim(),
  type: values.type,
  building: values.building.trim(),
  status: values.status,
  availableFrom: toBackendTime(values.availableFrom),
  availableTo: toBackendTime(values.availableTo),
  isBookable: values.isBookable,
  isUnderMaintenance: values.isUnderMaintenance,
  description: values.description.trim() || undefined,
  capacity: values.capacity.trim() === "" ? null : Number(values.capacity.trim()),
  imageUrl: values.imageUrl.trim() || undefined,
  hasProjector: values.hasProjector,
  hasAc: values.hasAc,
  hasWhiteboard: values.hasWhiteboard,
  hasWifi: values.hasWifi,
  hasComputers: values.hasComputers,
  hasWindows: values.hasWindows,
});

// ─── Props ────────────────────────────────────────────────────────────────────

interface ResourceFormProps {
  mode: "create" | "edit";
  initialValues?: Partial<ResourceRequest>;
  onSubmit: (values: ResourceRequest) => Promise<void>;
  onDelete?: () => Promise<void>;
  submitLabel?: string;
  formError?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ResourceForm({
  mode,
  initialValues,
  onSubmit,
  onDelete,
  submitLabel,
  formError,
}: ResourceFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>(initialValues?.imageUrl ?? "");
  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mergedDefaults = useMemo(() => toFormValues(initialValues), [initialValues]);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
    trigger,
  } = useForm<ResourceFormValues, unknown, ResourceFormOutput>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: mergedDefaults,
    mode: "onChange",
  });

  const watchedValues = useWatch({ control });

  const isBookable = watchedValues.isBookable ?? false;
  const isUnderMaintenance = watchedValues.isUnderMaintenance ?? false;
  const currentStatus = watchedValues.status ?? "ACTIVE";
  const isOutOfService = currentStatus === "OUT_OF_SERVICE";
  const availableFrom = watchedValues.availableFrom ?? "";

  useEffect(() => {
    if (initialValues?.imageUrl) setImagePreview(initialValues.imageUrl);
  }, [initialValues?.imageUrl]);

  const handleImageFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      setImageError("");
      if (!file) return;
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        setImageError("Only JPEG, PNG, WebP, and GIF images are accepted");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setImageError("Image must be smaller than 5 MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setValue("imageUrl", dataUrl, { shouldValidate: true });
        setImagePreview(dataUrl);
      };
      reader.readAsDataURL(file);
    },
    [setValue],
  );

  const handleRemoveImage = () => {
    setValue("imageUrl", "", { shouldValidate: true });
    setImagePreview("");
    setImageError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    register("status").onChange(e);
    if (e.target.value === "OUT_OF_SERVICE") {
      setValue("isBookable", false, { shouldValidate: true });
      setValue("isUnderMaintenance", false, { shouldValidate: true });
      trigger(["isBookable", "isUnderMaintenance", "status"]);
    }
  };

  const handleBookableChange = (checked: boolean) => {
    setValue("isBookable", checked, { shouldValidate: true });
    if (checked) setValue("isUnderMaintenance", false, { shouldValidate: true });
    trigger(["isBookable", "isUnderMaintenance"]);
  };

  const handleMaintenanceChange = (checked: boolean) => {
    setValue("isUnderMaintenance", checked, { shouldValidate: true });
    if (checked) setValue("isBookable", false, { shouldValidate: true });
    trigger(["isBookable", "isUnderMaintenance"]);
  };

  const submitHandler: SubmitHandler<ResourceFormOutput> = async (values) => {
    try {
      setSubmitting(true);
      await onSubmit(toResourceRequest(values));
    } finally {
      setSubmitting(false);
    }
  };

  const deleteHandler = async () => {
    if (!onDelete) return;
    if (!window.confirm("Are you sure you want to delete this resource? This action cannot be undone.")) return;
    try {
      setDeleting(true);
      await onDelete();
    } finally {
      setDeleting(false);
    }
  };

  const charCount = (field: keyof typeof FIELD_LIMITS) => {
    const val = String(watchedValues[field] ?? "");
    const max = FIELD_LIMITS[field];
    return { len: val.length, max, atLimit: val.length >= max };
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} noValidate className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-white/50 bg-white/80 p-6 shadow-lg backdrop-blur-sm">
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-indigo-100/30 blur-3xl" />
        <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-sky-100/20 blur-3xl" />
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-500">
              {mode === "create" ? "New Entry" : "Editing Entry"}
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-zinc-800">
              {mode === "create" ? "Create Resource" : "Edit Resource"}
            </h2>
            <p className="mt-1.5 text-sm text-zinc-500">
              Fields marked with <span className="text-rose-500">*</span> are required.
            </p>
          </div>
          <span className="rounded-full border border-indigo-200 bg-indigo-50/80 px-3 py-1 text-xs font-medium text-indigo-700 backdrop-blur-sm">
            {mode === "create" ? "Draft" : "Editing"}
          </span>
        </div>
        {formError && (
          <div className="relative z-10 mt-4 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-3 backdrop-blur-sm">
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-rose-700">{formError}</p>
          </div>
        )}
      </div>

      {/* Section 1: Basic Information */}
      <FormSection
        label="01"
        title="Basic Information"
        description="Core identity fields for this resource."
        accentColor="indigo"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Resource Code" required error={errors.resourceCode?.message} counter={charCount("resourceCode")}>
            <input
              type="text"
              {...register("resourceCode")}
              maxLength={FIELD_LIMITS.resourceCode}
              placeholder="e.g. LAB-001"
              className={inputCls(!!errors.resourceCode)}
              autoComplete="off"
            />
          </Field>
          <Field label="Name" required error={errors.name?.message} counter={charCount("name")}>
            <input
              type="text"
              {...register("name")}
              maxLength={FIELD_LIMITS.name}
              placeholder="e.g. Computer Lab 1"
              className={inputCls(!!errors.name)}
              autoComplete="off"
            />
          </Field>
          <Field label="Type" required error={errors.type?.message}>
            <select {...register("type")} className={inputCls(!!errors.type)}>
              {RESOURCE_TYPES.map((t) => (
                <option key={t} value={t}>{TYPE_LABELS[t]}</option>
              ))}
            </select>
          </Field>
          <Field label="Building" required error={errors.building?.message} counter={charCount("building")}>
            <input
              type="text"
              {...register("building")}
              maxLength={FIELD_LIMITS.building}
              placeholder="e.g. Engineering Block A"
              className={inputCls(!!errors.building)}
              autoComplete="off"
            />
          </Field>
          <Field
            label="Status"
            required
            error={errors.status?.message}
            hint={isOutOfService ? "Out-of-service resources are automatically non-bookable" : undefined}
          >
            <select {...register("status")} onChange={handleStatusChange} className={inputCls(!!errors.status)}>
              {RESOURCE_STATUSES.map((s) => (
                <option key={s} value={s}>{s.replaceAll("_", " ")}</option>
              ))}
            </select>
          </Field>
          <Field label="Capacity" error={errors.capacity?.message} hint="Number of people this resource can accommodate">
            <input
              type="number"
              {...register("capacity")}
              min="0"
              max="99999"
              step="1"
              placeholder="e.g. 40"
              className={inputCls(!!errors.capacity)}
              onKeyDown={(e) => { if ([".", "e", "E", "+", "-"].includes(e.key)) e.preventDefault(); }}
              onInput={(e) => { const t = e.target as HTMLInputElement; if (Number(t.value) > 99999) t.value = "99999"; }}
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Description" error={errors.description?.message} counter={charCount("description")}>
              <textarea
                {...register("description")}
                maxLength={FIELD_LIMITS.description}
                rows={4}
                placeholder="Briefly describe this resource..."
                className={`${inputCls(!!errors.description)} resize-none`}
              />
            </Field>
          </div>
        </div>
      </FormSection>

      {/* Section 2: Image Upload */}
      <FormSection
        label="02"
        title="Resource Image"
        description="Upload a representative photo. Accepted formats: JPEG, PNG, WebP, GIF (max 5 MB)."
        accentColor="sky"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_IMAGE_EXTENSIONS}
          onChange={handleImageFile}
          className="sr-only"
          id="image-upload"
        />
        {imagePreview ? (
          <div className="relative overflow-hidden rounded-2xl border border-white/50 shadow-md">
            <img src={imagePreview} alt="Preview" className="h-56 w-full object-cover" />
            <div className="absolute inset-0 flex items-end justify-between gap-3 bg-linear-to-t from-black/40 via-transparent to-transparent p-4">
              <span className="text-xs font-medium text-white/90">Image uploaded</span>
              <div className="flex gap-2">
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer rounded-lg border border-white/30 bg-white/20 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition hover:bg-white/30"
                >
                  Replace
                </label>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="rounded-lg border border-white/30 bg-white/20 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition hover:bg-rose-500/40"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ) : (
          <label
            htmlFor="image-upload"
            className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-zinc-300 bg-linear-to-br from-sky-50/50 to-indigo-50/30 px-6 py-12 text-center transition hover:border-indigo-400 hover:bg-white/50"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-200 bg-white shadow-sm transition group-hover:shadow-md">
              <svg className="h-5 w-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-700">Click to browse image</p>
              <p className="mt-1 text-xs text-zinc-400">JPEG · PNG · WebP · GIF · Max 5 MB</p>
            </div>
          </label>
        )}
        {imageError && <p className="mt-2 flex items-center gap-1.5 text-xs text-rose-500">{imageError}</p>}
        {errors.imageUrl && <p className="mt-2 flex items-center gap-1.5 text-xs text-rose-500">{errors.imageUrl.message}</p>}
      </FormSection>

      {/* Section 3: Availability & State */}
      <FormSection label="03" title="Availability & State" description="Set operational hours and booking status." accentColor="emerald">
        {isOutOfService && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-3 backdrop-blur-sm">
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            <p className="text-sm text-rose-700">
              This resource is <strong>Out of Service</strong> — it cannot be bookable or under maintenance.
            </p>
          </div>
        )}
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Available From" required error={errors.availableFrom?.message} hint="Daily start time">
            <input type="time" {...register("availableFrom", { onChange: () => trigger("availableTo") })} className={inputCls(!!errors.availableFrom)} />
          </Field>
          <Field label="Available To" required error={errors.availableTo?.message} hint="Must be later than start time">
            <input type="time" {...register("availableTo")} min={availableFrom || undefined} className={inputCls(!!errors.availableTo)} />
          </Field>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <ToggleCard
            id="isBookable"
            label="Bookable"
            description="Allow users to make reservations"
            checked={isBookable}
            disabled={isUnderMaintenance || isOutOfService}
            disabledReason={isOutOfService ? "Out-of-service resources cannot be bookable" : "Cannot be bookable while under maintenance"}
            onChange={handleBookableChange}
            error={errors.isBookable?.message}
            accentColor="emerald"
          />
          <ToggleCard
            id="isUnderMaintenance"
            label="Under Maintenance"
            description="Temporarily mark as unavailable for upkeep"
            checked={isUnderMaintenance}
            disabled={isBookable || isOutOfService}
            disabledReason={isOutOfService ? "Out-of-service resources do not use maintenance mode" : "Cannot be under maintenance while bookable"}
            onChange={handleMaintenanceChange}
            error={errors.isUnderMaintenance?.message}
            accentColor="amber"
          />
        </div>
      </FormSection>

      {/* Section 4: Features */}
      <FormSection label="04" title="Features & Facilities" description="Tag the amenities available." accentColor="violet">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURE_ITEMS.map((item) => (
            <FeatureToggle
              key={item.key}
              label={item.label}
              icon={item.icon}
              register={register(item.key as keyof ResourceFormValues as any)}
              checked={!!watchedValues[item.key as keyof ResourceFormValues]}
            />
          ))}
        </div>
      </FormSection>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/50 bg-white/80 p-5 shadow-lg backdrop-blur-sm">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-indigo-500 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:shadow-lg disabled:opacity-60"
        >
          {submitting && <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
          {submitting ? (mode === "create" ? "Creating..." : "Saving...") : (submitLabel ?? (mode === "create" ? "Create Resource" : "Save Changes"))}
        </button>
        {mode === "edit" && onDelete && (
          <button
            type="button"
            onClick={deleteHandler}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-5 py-2.5 text-sm font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-50 disabled:opacity-60"
          >
            {deleting ? "Deleting..." : "Delete Resource"}
          </button>
        )}
      </div>
    </form>
  );
}

// ─── Sub-components (FormSection, Field, ToggleCard, FeatureToggle) ───────────
// (Keep the same but with updated styling for modern look)

function FormSection({ label, title, description, children, accentColor }: { label: string; title: string; description?: string; children: ReactNode; accentColor: string }) {
  const colorMap: Record<string, string> = {
    indigo: "bg-indigo-100 text-indigo-700 border-indigo-200",
    sky: "bg-sky-100 text-sky-700 border-sky-200",
    emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
    violet: "bg-violet-100 text-violet-700 border-violet-200",
  };
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/50 bg-white/80 p-6 shadow-lg backdrop-blur-sm">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-current opacity-5 blur-3xl" style={{ color: `var(--${accentColor}-500)` }} />
      <div className="relative z-10 mb-6 flex items-start gap-4">
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-xs font-bold ${colorMap[accentColor]}`}>{label}</span>
        <div>
          <h3 className="font-semibold text-zinc-800">{title}</h3>
          {description && <p className="mt-0.5 text-sm text-zinc-500">{description}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function Field({ label, required, error, hint, counter, children }: { label: string; required?: boolean; error?: string; hint?: string; counter?: { len: number; max: number; atLimit: boolean }; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-zinc-700">{label}{required && <span className="ml-1 text-rose-500">*</span>}</label>
        {counter && <span className={`text-xs tabular-nums ${counter.atLimit ? "font-semibold text-rose-500" : "text-zinc-400"}`}>{counter.len}/{counter.max}</span>}
      </div>
      {children}
      {error && <p className="flex items-center gap-1 text-xs text-rose-500">{error}</p>}
      {!error && hint && <p className="text-xs text-zinc-400">{hint}</p>}
    </div>
  );
}

function ToggleCard({ id, label, description, checked, disabled, disabledReason, onChange, error, accentColor }: any) {
  const accent = accentColor === "emerald"
    ? { ring: "ring-emerald-500/20", bg: "bg-emerald-50/80", border: "border-emerald-200", dot: "bg-emerald-500" }
    : { ring: "ring-amber-500/20", bg: "bg-amber-50/80", border: "border-amber-200", dot: "bg-amber-500" };
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className={`group flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition backdrop-blur-sm ${
          disabled ? "cursor-not-allowed border-zinc-200 bg-zinc-50/80 opacity-50"
          : checked ? `${accent.bg} ${accent.border} ring-1 ${accent.ring}`
          : "border-zinc-200 bg-white/80 hover:border-zinc-300"
        }`}
      >
        <input id={id} type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
        <div className={`flex h-5 w-5 items-center justify-center rounded border-2 transition ${checked ? `${accent.dot} border-transparent` : "border-zinc-300 bg-white"}`}>
          {checked && <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-zinc-800">{label}</p>
          <p className="text-xs text-zinc-500">{description}</p>
        </div>
      </label>
      {disabled && <p className="flex items-center gap-1 text-xs text-zinc-400"><svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg>{disabledReason}</p>}
      {error && !disabled && <p className="flex items-center gap-1 text-xs text-rose-500">{error}</p>}
    </div>
  );
}

function FeatureToggle({ label, icon, register, checked }: { label: string; icon: string; register: UseFormRegisterReturn; checked: boolean }) {
  return (
    <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition ${
      checked ? "border-indigo-400 bg-indigo-50 text-indigo-700 shadow-sm" : "border-zinc-200 bg-white text-zinc-700 hover:border-indigo-300 hover:bg-indigo-50/50"
    }`}>
      <input type="checkbox" {...register} className="sr-only" />
      <span className="text-base">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
      {checked && <svg className="ml-auto h-4 w-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>}
    </label>
  );
}

const inputCls = (hasError: boolean) =>
  `w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-zinc-800 outline-none transition placeholder:text-zinc-400 ${
    hasError ? "border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20" : "border-zinc-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
  }`;

const FEATURE_ITEMS = [
  { key: "hasProjector", label: "Projector", icon: "📽️" },
  { key: "hasAc", label: "Air Conditioning", icon: "❄️" },
  { key: "hasWhiteboard", label: "Whiteboard", icon: "✏️" },
  { key: "hasWifi", label: "Wi-Fi", icon: "📶" },
  { key: "hasComputers", label: "Computers", icon: "💻" },
  { key: "hasWindows", label: "Windows", icon: "🪟" },
];
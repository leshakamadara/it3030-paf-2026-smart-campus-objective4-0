import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertCircle, Upload, X, Info, Sparkles, Calendar, Clock, MapPin, Users } from "lucide-react";
import type { ResourceRequest, ResourceStatus, ResourceType } from "../../../types/resource";

const RESOURCE_TYPES: ResourceType[] = ["LECTURE_HALL", "LAB", "MEETING_ROOM", "PROJECTOR", "CAMERA"];
const RESOURCE_STATUSES: ResourceStatus[] = ["ACTIVE", "OUT_OF_SERVICE"];
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ACCEPTED_IMAGE_EXTENSIONS = ".jpg, .jpeg, .png, .webp, .gif";
const FIELD_LIMITS = { resourceCode: 50, name: 100, building: 100, description: 500 } as const;

const TYPE_LABELS: Record<ResourceType, string> = {
  LECTURE_HALL: "Lecture Hall", LAB: "Lab", MEETING_ROOM: "Meeting Room",
  PROJECTOR: "Projector", CAMERA: "Camera",
};

const FEATURE_ITEMS = [
  { key: "hasProjector", label: "Projector", icon: "📽️" },
  { key: "hasAc", label: "Air Conditioning", icon: "❄️" },
  { key: "hasWhiteboard", label: "Whiteboard", icon: "✏️" },
  { key: "hasWifi", label: "Wi-Fi", icon: "📶" },
  { key: "hasComputers", label: "Computers", icon: "💻" },
  { key: "hasWindows", label: "Windows", icon: "🪟" },
] as const;

const resourceFormSchema = z.object({
  resourceCode: z.string().min(1, "Resource code is required").max(FIELD_LIMITS.resourceCode),
  name: z.string().min(1, "Name is required").max(FIELD_LIMITS.name),
  type: z.enum(RESOURCE_TYPES as [ResourceType, ...ResourceType[]], { error: "Type is required" }),
  building: z.string().min(1, "Building is required").max(FIELD_LIMITS.building),
  status: z.enum(RESOURCE_STATUSES as [ResourceStatus, ...ResourceStatus[]], { error: "Status is required" }),
  availableFrom: z.string().min(1, "Start time is required"),
  availableTo: z.string().min(1, "End time is required"),
  isBookable: z.boolean(),
  isUnderMaintenance: z.boolean(),
  description: z.string().max(FIELD_LIMITS.description),
  capacity: z.string(),
  imageUrl: z.string(),
  hasProjector: z.boolean(), hasAc: z.boolean(), hasWhiteboard: z.boolean(),
  hasWifi: z.boolean(), hasComputers: z.boolean(), hasWindows: z.boolean(),
}).superRefine((data, ctx) => {
  if (data.availableFrom && data.availableTo && data.availableFrom >= data.availableTo) {
    ctx.addIssue({ code: "custom", path: ["availableTo"], message: "End time must be later than start time" });
  }
  if (data.capacity.trim() !== "") {
    const parsed = Number(data.capacity);
    if (Number.isNaN(parsed) || !Number.isInteger(parsed)) {
      ctx.addIssue({ code: "custom", path: ["capacity"], message: "Capacity must be a whole number" });
    } else if (parsed < 0 || parsed > 99999) {
      ctx.addIssue({ code: "custom", path: ["capacity"], message: "Capacity must be between 0 and 99,999" });
    }
  }
  if (data.imageUrl.trim() !== "" && !data.imageUrl.trim().startsWith("data:")) {
    try { new URL(data.imageUrl.trim()); } catch {
      ctx.addIssue({ code: "custom", path: ["imageUrl"], message: "Must be a valid URL" });
    }
  }
  if (data.status === "OUT_OF_SERVICE" && data.isBookable) {
    ctx.addIssue({ code: "custom", path: ["isBookable"], message: "An out-of-service resource cannot be bookable" });
  }
  if (data.isBookable && data.isUnderMaintenance) {
    ctx.addIssue({ code: "custom", path: ["isUnderMaintenance"], message: "A bookable resource cannot be under maintenance" });
  }
});

type ResourceFormValues = z.input<typeof resourceFormSchema>;
type ResourceFormOutput = z.output<typeof resourceFormSchema>;

const normalizeTime = (value?: string) => (value && value.length >= 5 ? value.slice(0, 5) : value ?? "");
const toBackendTime = (value: string) => (value.length === 5 ? `${value}:00` : value);

const toFormValues = (initial?: Partial<ResourceRequest>): ResourceFormValues => ({
  resourceCode: initial?.resourceCode ?? "", name: initial?.name ?? "",
  type: initial?.type ?? "LAB", building: initial?.building ?? "",
  status: initial?.status ?? "ACTIVE", availableFrom: normalizeTime(initial?.availableFrom) || "08:00",
  availableTo: normalizeTime(initial?.availableTo) || "17:00",
  isBookable: initial?.isBookable ?? true, isUnderMaintenance: initial?.isUnderMaintenance ?? false,
  description: initial?.description ?? "", capacity: initial?.capacity == null ? "" : String(initial.capacity),
  imageUrl: initial?.imageUrl ?? "", hasProjector: initial?.hasProjector ?? false,
  hasAc: initial?.hasAc ?? false, hasWhiteboard: initial?.hasWhiteboard ?? false,
  hasWifi: initial?.hasWifi ?? false, hasComputers: initial?.hasComputers ?? false,
  hasWindows: initial?.hasWindows ?? false,
});

const toResourceRequest = (values: ResourceFormOutput): ResourceRequest => ({
  resourceCode: values.resourceCode.trim(), name: values.name.trim(), type: values.type,
  building: values.building.trim(), status: values.status,
  availableFrom: toBackendTime(values.availableFrom), availableTo: toBackendTime(values.availableTo),
  isBookable: values.isBookable, isUnderMaintenance: values.isUnderMaintenance,
  description: values.description.trim() || undefined,
  capacity: values.capacity.trim() === "" ? null : Number(values.capacity.trim()),
  imageUrl: values.imageUrl.trim() || undefined, hasProjector: values.hasProjector,
  hasAc: values.hasAc, hasWhiteboard: values.hasWhiteboard, hasWifi: values.hasWifi,
  hasComputers: values.hasComputers, hasWindows: values.hasWindows,
});

export default function ResourceForm({
  mode, initialValues, onSubmit, onDelete, submitLabel, formError,
}: {
  mode: "create" | "edit"; initialValues?: Partial<ResourceRequest>;
  onSubmit: (values: ResourceRequest) => Promise<void>; onDelete?: () => Promise<void>;
  submitLabel?: string; formError?: string;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>(initialValues?.imageUrl ?? "");
  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mergedDefaults = useMemo(() => toFormValues(initialValues), [initialValues]);

  const { register, handleSubmit, setValue, control, formState: { errors }, trigger } = useForm<ResourceFormValues, unknown, ResourceFormOutput>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: mergedDefaults, mode: "onChange",
  });

  const watchedValues = useWatch({ control });

  const isBookable = watchedValues.isBookable ?? false;
  const isUnderMaintenance = watchedValues.isUnderMaintenance ?? false;
  const isOutOfService = watchedValues.status === "OUT_OF_SERVICE";
  const availableFrom = watchedValues.availableFrom ?? "";
  const availableTo = watchedValues.availableTo ?? "";

  useEffect(() => {
    if (availableFrom && availableTo && availableTo <= availableFrom) {
      const [hours, minutes] = availableFrom.split(':').map(Number);
      let newHours = hours + 1;
      if (newHours >= 24) newHours = 23;
      const newTime = `${String(newHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      setValue('availableTo', newTime, { shouldValidate: true });
      trigger('availableTo');
    }
  }, [availableFrom, availableTo, setValue, trigger]);

  useEffect(() => { if (initialValues?.imageUrl) setImagePreview(initialValues.imageUrl); }, [initialValues?.imageUrl]);

  const handleImageFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageError("");
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) { setImageError("Only JPEG, PNG, WebP, and GIF accepted"); return; }
    if (file.size > 5 * 1024 * 1024) { setImageError("Image must be smaller than 5 MB"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setValue("imageUrl", dataUrl, { shouldValidate: true });
      setImagePreview(dataUrl);
    };
    reader.readAsDataURL(file);
  }, [setValue]);

  const handleRemoveImage = () => {
    setValue("imageUrl", "", { shouldValidate: true }); setImagePreview(""); setImageError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleStatusChange = (value: string) => {
    setValue("status", value as ResourceStatus, { shouldValidate: true });
    if (value === "OUT_OF_SERVICE") {
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
    try { setSubmitting(true); await onSubmit(toResourceRequest(values)); } finally { setSubmitting(false); }
  };

  const deleteHandler = async () => {
    if (!onDelete || !window.confirm("Are you sure you want to delete this resource?")) return;
    try { setDeleting(true); await onDelete(); } finally { setDeleting(false); }
  };

  const charCount = (field: keyof typeof FIELD_LIMITS) => {
    const val = watchedValues[field] != null ? String(watchedValues[field]) : "";
    return { len: val.length, max: FIELD_LIMITS[field], atLimit: val.length >= FIELD_LIMITS[field] };
  };

  return (
    <motion.form initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit(submitHandler)} noValidate className="space-y-6">
      
      {/* Form Header */}
      <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: "#ffffff", borderColor: "#e6e6e6" }}>
        <div className="h-1.5 w-full" style={{ backgroundColor: "#5e6ad2" }} />
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2 mb-1" style={{ color: "#191a1b", letterSpacing: "-0.4px" }}>
                {mode === "create" ? "Create Resource" : "Edit Resource"}
                <Sparkles className="h-5 w-5" style={{ color: "#5e6ad2" }} />
              </h2>
              <p className="text-sm font-medium" style={{ color: "#8a8f98" }}>
                Fields marked with <span style={{ color: "#dc2626" }}>*</span> are required.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{ backgroundColor: "#ede9ff", color: "#5b21b6" }}>
              {mode === "create" ? "✨ New" : "✏️ Editing"}
            </span>
          </div>
          {formError && (
            <div className="mt-4 p-3 rounded-md flex items-start gap-2" style={{ backgroundColor: "#fff1f2", border: "1px solid #fecdd3", color: "#9f1239" }}>
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="text-sm">{formError}</span>
            </div>
          )}
        </div>
      </div>

      {/* Section 1: Basic Information */}
      <SectionCard title="Basic Information" description="Core identity fields for this resource." icon={<MapPin className="h-5 w-5" />}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Resource Code" required error={errors.resourceCode?.message} counter={charCount("resourceCode")}>
            <Input {...register("resourceCode")} maxLength={FIELD_LIMITS.resourceCode} placeholder="e.g. LAB-001" autoComplete="off" style={{ borderColor: "#d0d6e0" }} />
          </Field>
          <Field label="Name" required error={errors.name?.message} counter={charCount("name")}>
            <Input {...register("name")} maxLength={FIELD_LIMITS.name} placeholder="e.g. Computer Lab 1" autoComplete="off" style={{ borderColor: "#d0d6e0" }} />
          </Field>
          <Field label="Type" required error={errors.type?.message}>
            <Select value={watchedValues.type} onValueChange={(v) => setValue("type", v as ResourceType, { shouldValidate: true })}>
              <SelectTrigger style={{ borderColor: "#d0d6e0" }}>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {RESOURCE_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{TYPE_LABELS[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Building" required error={errors.building?.message} counter={charCount("building")}>
            <Input {...register("building")} maxLength={FIELD_LIMITS.building} placeholder="e.g. Engineering Block A" autoComplete="off" style={{ borderColor: "#d0d6e0" }} />
          </Field>
          <Field label="Status" required error={errors.status?.message} hint={isOutOfService ? "Out-of-service resources are automatically non-bookable" : undefined}>
            <Select value={watchedValues.status} onValueChange={handleStatusChange}>
              <SelectTrigger style={{ borderColor: "#d0d6e0" }}>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {RESOURCE_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{s.replaceAll("_", " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Capacity" error={errors.capacity?.message} hint="Number of people this resource can accommodate">
            <div className="relative">
              <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input type="number" {...register("capacity")} min="0" step="1" placeholder="e.g. 40" className="pl-9" style={{ borderColor: "#d0d6e0" }} onKeyDown={(e) => { if ([".", "e", "E", "+", "-"].includes(e.key)) e.preventDefault(); }} />
            </div>
          </Field>
          <div className="md:col-span-2">
            <Field label="Description" error={errors.description?.message} counter={charCount("description")}>
              <Textarea {...register("description")} maxLength={FIELD_LIMITS.description} rows={3} placeholder="Briefly describe this resource..." className="resize-none" style={{ borderColor: "#d0d6e0" }} />
            </Field>
          </div>
        </div>
      </SectionCard>

      {/* Section 2: Image */}
      <SectionCard title="Resource Image" description="Upload a photo (JPEG/PNG/WebP/GIF, max 5MB)." icon={<Upload className="h-5 w-5" />}>
        <div className="space-y-3">
          <input ref={fileInputRef} type="file" accept={ACCEPTED_IMAGE_EXTENSIONS} onChange={handleImageFile} className="hidden" />
          {imagePreview ? (
            <div className="relative overflow-hidden rounded-lg border-2" style={{ borderColor: "#e6e6e6", backgroundColor: "#f7f8f8" }}>
              <img src={imagePreview} alt="Preview" className="h-56 w-full object-contain" />
              <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-gradient-to-t from-black/50 to-transparent p-4">
                <Button type="button" size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()} className="bg-white text-gray-800">
                  <Upload className="mr-2 h-4 w-4" /> Replace
                </Button>
                <Button type="button" size="sm" variant="destructive" onClick={handleRemoveImage} className="bg-red-600">
                  <X className="mr-2 h-4 w-4" /> Remove
                </Button>
              </div>
            </div>
          ) : (
            <div onClick={() => fileInputRef.current?.click()} className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors hover:bg-gray-50" style={{ borderColor: "#d0d6e0", backgroundColor: "#ffffff" }}>
              <Upload className="mb-2 h-10 w-10 opacity-50" />
              <p className="text-sm font-medium" style={{ color: "#191a1b" }}>Click to browse image</p>
              <p className="text-xs" style={{ color: "#8a8f98" }}>JPEG, PNG, WebP, GIF (Max 5 MB)</p>
            </div>
          )}
          {imageError && <p className="text-xs font-medium text-red-600">{imageError}</p>}
          {errors.imageUrl && <p className="text-xs font-medium text-red-600">{errors.imageUrl.message}</p>}
        </div>
      </SectionCard>

      {/* Section 3: Availability */}
      <SectionCard title="Availability & State" description="Set operational hours and status." icon={<Clock className="h-5 w-5" />}>
        <div className="space-y-4">
          {isOutOfService && (
            <div className="flex items-start gap-2 rounded-md p-3 text-sm" style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a", color: "#b45309" }}>
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <span>This resource is <strong>Out of Service</strong> — it cannot be bookable or under maintenance.</span>
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Available From" required error={errors.availableFrom?.message} hint="Daily start time">
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input type="time" {...register("availableFrom", { onChange: () => trigger("availableTo") })} className="pl-9" style={{ borderColor: "#d0d6e0" }} />
              </div>
            </Field>
            <Field label="Available To" required error={errors.availableTo?.message} hint="Must be later than start time">
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input type="time" {...register("availableTo")} min={availableFrom || undefined} className="pl-9" style={{ borderColor: "#d0d6e0" }} />
              </div>
            </Field>
          </div>
          <div className="my-2 border-t" style={{ borderColor: "#f3f4f5" }} />
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2 p-4 rounded-lg border" style={{ backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" }}>
              <div className="flex items-center justify-between">
                <Label htmlFor="isBookable" className="font-medium flex items-center gap-2" style={{ color: "#166534" }}>
                  <Calendar className="h-4 w-4" /> Bookable
                </Label>
                <Switch id="isBookable" checked={isBookable} onCheckedChange={handleBookableChange} disabled={isUnderMaintenance || isOutOfService} />
              </div>
              <p className="text-sm" style={{ color: "#15803d" }}>Allow users to make reservations</p>
            </div>
            <div className="space-y-2 p-4 rounded-lg border" style={{ backgroundColor: "#fffbeb", borderColor: "#fde68a" }}>
              <div className="flex items-center justify-between">
                <Label htmlFor="isUnderMaintenance" className="font-medium flex items-center gap-2" style={{ color: "#92400e" }}>
                  <Info className="h-4 w-4" /> Maintenance
                </Label>
                <Switch id="isUnderMaintenance" checked={isUnderMaintenance} onCheckedChange={handleMaintenanceChange} disabled={isBookable || isOutOfService} />
              </div>
              <p className="text-sm" style={{ color: "#b45309" }}>Temporarily mark as unavailable</p>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Section 4: Features */}
      <SectionCard title="Features & Facilities" description="Tag the amenities available." icon={<Sparkles className="h-5 w-5" />}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURE_ITEMS.map((item) => (
            <button
              key={item.key} type="button"
              onClick={() => setValue(item.key as keyof ResourceFormValues, !watchedValues[item.key as keyof ResourceFormValues], { shouldValidate: true })}
              className="flex items-center gap-2 p-3 rounded-lg border transition-colors text-left"
              style={{
                backgroundColor: watchedValues[item.key as keyof ResourceFormValues] ? "#ede9ff" : "#ffffff",
                borderColor: watchedValues[item.key as keyof ResourceFormValues] ? "#c4b5fd" : "#d0d6e0",
              }}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm font-semibold" style={{ color: watchedValues[item.key as keyof ResourceFormValues] ? "#5b21b6" : "#43464b" }}>{item.label}</span>
              {watchedValues[item.key as keyof ResourceFormValues] && (
                <span className="ml-auto flex items-center justify-center h-5 w-5 rounded-full bg-white text-xs text-indigo-600 font-bold shadow-sm">✓</span>
              )}
            </button>
          ))}
        </div>
      </SectionCard>

      {/* Actions */}
      <div className="flex items-center justify-between sticky bottom-4 p-4 rounded-lg border shadow-lg" style={{ backgroundColor: "#ffffff", borderColor: "#e6e6e6" }}>
        <Button type="submit" disabled={submitting} className="min-w-32 shadow-none font-semibold transition-opacity hover:opacity-90" style={{ backgroundColor: "#5e6ad2", color: "#ffffff", borderRadius: "6px" }}>
          {submitting ? "Saving..." : submitLabel ?? (mode === "create" ? "Create Resource" : "Save Changes")}
        </Button>
        {mode === "edit" && onDelete && (
          <Button type="button" onClick={deleteHandler} disabled={deleting} className="font-semibold shadow-none transition-colors hover:bg-red-700 text-white" style={{ backgroundColor: "#dc2626", borderRadius: "6px" }}>
            {deleting ? "Deleting..." : "Delete Resource"}
          </Button>
        )}
      </div>
    </motion.form>
  );
}

function SectionCard({ title, description, icon, children }: { title: string; description: string; icon: React.ReactNode; children: ReactNode }) {
  return (
    <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: "#ffffff", borderColor: "#e6e6e6" }}>
      <div className="px-5 py-4 border-b flex items-center gap-3" style={{ borderColor: "#f3f4f5", backgroundColor: "#fbfcfc" }}>
        <div style={{ color: "#5e6ad2" }}>{icon}</div>
        <div>
          <h3 className="font-bold text-base" style={{ color: "#191a1b" }}>{title}</h3>
          <p className="text-xs mt-0.5" style={{ color: "#8a8f98" }}>{description}</p>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Field({ label, required, error, hint, counter, children }: { label: string; required?: boolean; error?: string; hint?: string; counter?: { len: number; max: number; atLimit: boolean }; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="font-semibold text-sm" style={{ color: "#191a1b" }}>
          {label} {required && <span style={{ color: "#dc2626" }}>*</span>}
        </Label>
        {counter && (
          <span className="text-xs" style={{ color: counter.atLimit ? "#dc2626" : "#8a8f98" }}>
            {counter.len} / {counter.max}
          </span>
        )}
      </div>
      {children}
      {error && <p className="text-xs font-medium" style={{ color: "#dc2626" }}>{error}</p>}
      {!error && hint && <p className="text-xs" style={{ color: "#8a8f98" }}>{hint}</p>}
    </div>
  );
}
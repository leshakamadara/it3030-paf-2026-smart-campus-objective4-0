import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  useForm,
  useWatch,
  type SubmitHandler,
} from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertCircle, Upload, X, Info, Sparkles, Calendar, Clock, MapPin, Users } from "lucide-react";
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

// Color schemes with dark mode variants (light mode unchanged)
const TYPE_COLORS: Record<ResourceType, {
  gradient: string;
  icon: string;
  accent: string;
  border: string;
  lightBg: string;
  textColor: string;
}> = {
  LECTURE_HALL: {
    gradient: "from-violet-500/60 to-purple-400/50 dark:from-violet-400/70 dark:to-purple-300/60",
    icon: "🏛️",
    accent: "border-violet-400 bg-violet-100 text-violet-800 dark:border-violet-700 dark:bg-violet-900/30 dark:text-violet-200",
    border: "border-l-violet-500 dark:border-l-violet-400",
    lightBg: "bg-gradient-to-br from-violet-50 to-white dark:from-violet-950/50 dark:to-gray-900",
    textColor: "text-violet-900 dark:text-violet-200",
  },
  LAB: {
    gradient: "from-blue-500/60 to-sky-400/50 dark:from-blue-400/70 dark:to-sky-300/60",
    icon: "🖥️",
    accent: "border-blue-400 bg-blue-100 text-blue-800 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-200",
    border: "border-l-blue-500 dark:border-l-blue-400",
    lightBg: "bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/50 dark:to-gray-900",
    textColor: "text-blue-900 dark:text-blue-200",
  },
  MEETING_ROOM: {
    gradient: "from-teal-500/60 to-emerald-400/50 dark:from-teal-400/70 dark:to-emerald-300/60",
    icon: "🤝",
    accent: "border-teal-400 bg-teal-100 text-teal-800 dark:border-teal-700 dark:bg-teal-900/30 dark:text-teal-200",
    border: "border-l-teal-500 dark:border-l-teal-400",
    lightBg: "bg-gradient-to-br from-teal-50 to-white dark:from-teal-950/50 dark:to-gray-900",
    textColor: "text-teal-900 dark:text-teal-200",
  },
  PROJECTOR: {
    gradient: "from-amber-500/60 to-yellow-400/50 dark:from-amber-400/70 dark:to-yellow-300/60",
    icon: "📽️",
    accent: "border-amber-400 bg-amber-100 text-amber-800 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-200",
    border: "border-l-amber-500 dark:border-l-amber-400",
    lightBg: "bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/50 dark:to-gray-900",
    textColor: "text-amber-900 dark:text-amber-200",
  },
  CAMERA: {
    gradient: "from-rose-500/60 to-pink-400/50 dark:from-rose-400/70 dark:to-pink-300/60",
    icon: "📷",
    accent: "border-rose-400 bg-rose-100 text-rose-800 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-200",
    border: "border-l-rose-500 dark:border-l-rose-400",
    lightBg: "bg-gradient-to-br from-rose-50 to-white dark:from-rose-950/50 dark:to-gray-900",
    textColor: "text-rose-900 dark:text-rose-200",
  },
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

const normalizeTime = (value?: string) => {
  if (value && value.length >= 5) {
    return value.slice(0, 5);
  }
  return value ?? "";
};

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
  const availableTo = watchedValues.availableTo ?? "";
  const selectedType = watchedValues.type ?? "LAB";
  const typeColor = TYPE_COLORS[selectedType] || TYPE_COLORS.LAB;

  // Auto-correct availableTo when availableFrom changes
  useEffect(() => {
    if (availableFrom && availableTo && availableTo <= availableFrom) {
      // Set to 1 hour later, capped at 23:59
      const [hours, minutes] = availableFrom.split(':').map(Number);
      let newHours = hours + 1;
      if (newHours >= 24) newHours = 23;
      const newTime = `${String(newHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      setValue('availableTo', newTime, { shouldValidate: true });
      trigger('availableTo');
    }
  }, [availableFrom, availableTo, setValue, trigger]);

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
    const rawValue = watchedValues[field];
    const val = rawValue != null ? String(rawValue) : "";
    const max = FIELD_LIMITS[field];
    return { len: val.length, max, atLimit: val.length >= max };
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.form
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      onSubmit={handleSubmit(submitHandler)}
      noValidate
      className="space-y-6"
    >
      {/* Header Card */}
      <Card className={`overflow-hidden border-0 shadow-md ${typeColor.lightBg}`}>
        <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${typeColor.gradient}`} />
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl font-bold flex items-center gap-2">
                <span className={`bg-gradient-to-r ${typeColor.gradient} bg-clip-text text-transparent`}>
                  {mode === "create" ? "Create Resource" : "Edit Resource"}
                </span>
                <Sparkles className="h-5 w-5 text-amber-500 dark:text-amber-400" />
              </CardTitle>
              <CardDescription className="flex items-center gap-1 text-gray-800 dark:text-gray-300 font-medium">
                Fields marked with <span className="text-rose-600 dark:text-rose-400 font-bold">*</span> are required.
              </CardDescription>
            </div>
            <Badge variant="outline" className={`${typeColor.accent} border-2 font-semibold px-3 py-1`}>
              {mode === "create" ? "✨ New" : "✏️ Editing"}
            </Badge>
          </div>
        </CardHeader>
        {formError && (
          <CardContent className="pb-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-start gap-2 rounded-md bg-rose-50 dark:bg-rose-950/50 p-3 text-sm text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </motion.div>
          </CardContent>
        )}
      </Card>

      {/* Section 1: Basic Information */}
      <SectionCard 
        title="Basic Information" 
        description="Core identity fields for this resource." 
        icon={<MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
        accentColor="border-l-blue-500 dark:border-l-blue-400"
        lightBg="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/50 dark:to-gray-900"
        textColor="text-gray-900 dark:text-gray-100"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Resource Code" required error={errors.resourceCode?.message} counter={charCount("resourceCode")}>
            <Input
              {...register("resourceCode")}
              maxLength={FIELD_LIMITS.resourceCode}
              placeholder="e.g. LAB-001"
              autoComplete="off"
              className="transition-all duration-200 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            />
          </Field>
          <Field label="Name" required error={errors.name?.message} counter={charCount("name")}>
            <Input
              {...register("name")}
              maxLength={FIELD_LIMITS.name}
              placeholder="e.g. Computer Lab 1"
              autoComplete="off"
              className="transition-all duration-200 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            />
          </Field>
          <Field label="Type" required error={errors.type?.message}>
            <Select
              value={watchedValues.type}
              onValueChange={(value) => setValue("type", value as ResourceType, { shouldValidate: true })}
            >
              <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {RESOURCE_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    <span className="flex items-center gap-2">
                      <span>{TYPE_COLORS[t].icon}</span>
                      {TYPE_LABELS[t]}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Building" required error={errors.building?.message} counter={charCount("building")}>
            <Input
              {...register("building")}
              maxLength={FIELD_LIMITS.building}
              placeholder="e.g. Engineering Block A"
              autoComplete="off"
              className="transition-all duration-200 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            />
          </Field>
          <Field
            label="Status"
            required
            error={errors.status?.message}
            hint={isOutOfService ? "Out-of-service resources are automatically non-bookable" : undefined}
          >
            <Select value={watchedValues.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {RESOURCE_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.replaceAll("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Capacity" error={errors.capacity?.message} hint="Number of people this resource can accommodate">
            <div className="relative">
              <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
              <Input
                type="number"
                {...register("capacity")}
                min="0"
                max="99999"
                step="1"
                placeholder="e.g. 40"
                className="pl-9 transition-all duration-200 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                onKeyDown={(e) => {
                  if ([".", "e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                }}
              />
            </div>
          </Field>
          <div className="md:col-span-2">
            <Field label="Description" error={errors.description?.message} counter={charCount("description")}>
              <Textarea
                {...register("description")}
                maxLength={FIELD_LIMITS.description}
                rows={4}
                placeholder="Briefly describe this resource..."
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 resize-none"
              />
            </Field>
          </div>
        </div>
      </SectionCard>

      {/* Section 2: Image Upload */}
      <SectionCard 
        title="Resource Image" 
        description="Upload a representative photo. Accepted formats: JPEG, PNG, WebP, GIF (max 5 MB)." 
        icon={<Upload className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
        accentColor="border-l-emerald-500 dark:border-l-emerald-400"
        lightBg="bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/50 dark:to-gray-900"
        textColor="text-gray-900 dark:text-gray-100"
      >
        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_IMAGE_EXTENSIONS}
            onChange={handleImageFile}
            className="hidden"
            id="image-upload"
          />
          {imagePreview ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative overflow-hidden rounded-lg border-2 border-emerald-300 dark:border-emerald-700 group bg-gray-50 dark:bg-gray-800"
            >
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="h-56 w-full object-contain transition-transform duration-500 group-hover:scale-105" 
              />
              <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-gradient-to-t from-black/50 to-transparent p-4">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                  className="transition-all hover:scale-105 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Replace
                </Button>
                <Button 
                  type="button" 
                  size="sm" 
                  variant="destructive" 
                  onClick={handleRemoveImage} 
                  className="transition-all hover:scale-105 bg-rose-600 hover:bg-rose-700 dark:bg-rose-700 dark:hover:bg-rose-600 text-white font-medium"
                >
                  <X className="mr-2 h-4 w-4" />
                  Remove
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              whileHover={{ scale: 1.01, borderColor: "#10b981" }}
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-emerald-300 dark:border-emerald-700 p-8 transition-all bg-white dark:bg-gray-800"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mb-2 h-10 w-10 text-emerald-500 dark:text-emerald-400 transition-transform group-hover:scale-110" />
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Click to browse image</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">JPEG · PNG · WebP · GIF · Max 5 MB</p>
            </motion.div>
          )}
          {imageError && <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{imageError}</p>}
          {errors.imageUrl && <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{errors.imageUrl.message}</p>}
        </div>
      </SectionCard>

      {/* Section 3: Availability & State */}
      <SectionCard 
        title="Availability & State" 
        description="Set operational hours and booking status." 
        icon={<Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
        accentColor="border-l-amber-500 dark:border-l-amber-400"
        lightBg="bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/50 dark:to-gray-900"
        textColor="text-gray-900 dark:text-gray-100"
      >
        <div className="space-y-4">
          {isOutOfService && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex items-start gap-2 rounded-md bg-amber-50 dark:bg-amber-950/50 p-3 text-sm text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800"
            >
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                This resource is <strong>Out of Service</strong> — it cannot be bookable or under maintenance.
              </span>
            </motion.div>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Available From" required error={errors.availableFrom?.message} hint="Daily start time">
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                <Input
                  type="time"
                  {...register("availableFrom", { onChange: () => trigger("availableTo") })}
                  className="pl-9 transition-all duration-200 focus:ring-2 focus:ring-amber-400 dark:focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                />
              </div>
            </Field>
            <Field label="Available To" required error={errors.availableTo?.message} hint="Must be later than start time">
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                <Input 
                  type="time" 
                  {...register("availableTo")} 
                  min={availableFrom || undefined} 
                  className="pl-9 transition-all duration-200 focus:ring-2 focus:ring-amber-400 dark:focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600" 
                />
              </div>
            </Field>
          </div>
          <Separator className="my-2 bg-amber-200 dark:bg-amber-800" />
          <div className="grid gap-6 md:grid-cols-2">
            <motion.div whileHover={{ scale: 1.01 }} className="space-y-2 p-4 rounded-lg border-2 border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30">
              <div className="flex items-center justify-between">
                <Label htmlFor="isBookable" className="font-medium flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
                  <Calendar className="h-4 w-4" />
                  Bookable
                </Label>
                <Switch
                  id="isBookable"
                  checked={isBookable}
                  onCheckedChange={handleBookableChange}
                  disabled={isUnderMaintenance || isOutOfService}
                  className="data-[state=checked]:bg-emerald-600 dark:data-[state=checked]:bg-emerald-500"
                />
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">Allow users to make reservations</p>
              {isUnderMaintenance && !isOutOfService && (
                <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                  Cannot be bookable while under maintenance
                </p>
              )}
              {errors.isBookable && <p className="text-xs text-rose-600 dark:text-rose-400">{errors.isBookable.message}</p>}
            </motion.div>
            <motion.div whileHover={{ scale: 1.01 }} className="space-y-2 p-4 rounded-lg border-2 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30">
              <div className="flex items-center justify-between">
                <Label htmlFor="isUnderMaintenance" className="font-medium flex items-center gap-2 text-amber-800 dark:text-amber-200">
                  <Info className="h-4 w-4" />
                  Under Maintenance
                </Label>
                <Switch
                  id="isUnderMaintenance"
                  checked={isUnderMaintenance}
                  onCheckedChange={handleMaintenanceChange}
                  disabled={isBookable || isOutOfService}
                  className="data-[state=checked]:bg-amber-600 dark:data-[state=checked]:bg-amber-500"
                />
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">Temporarily mark as unavailable for upkeep</p>
              {isBookable && !isOutOfService && (
                <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                  Cannot be under maintenance while bookable
                </p>
              )}
              {errors.isUnderMaintenance && (
                <p className="text-xs text-rose-600 dark:text-rose-400">{errors.isUnderMaintenance.message}</p>
              )}
            </motion.div>
          </div>
        </div>
      </SectionCard>

      {/* Section 4: Features */}
      <SectionCard 
        title="Features & Facilities" 
        description="Tag the amenities available." 
        icon={<Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
        accentColor="border-l-purple-500 dark:border-l-purple-400"
        lightBg="bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/50 dark:to-gray-900"
        textColor="text-gray-900 dark:text-gray-100"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURE_ITEMS.map((item) => (
            <FeatureToggle
              key={item.key}
              label={item.label}
              icon={item.icon}
              checked={!!watchedValues[item.key as keyof ResourceFormValues]}
              onChange={(checked) =>
                setValue(item.key as keyof ResourceFormValues, checked, { shouldValidate: true })
              }
            />
          ))}
        </div>
      </SectionCard>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center justify-between sticky bottom-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 shadow-lg"
      >
        <Button type="submit" disabled={submitting} className="min-w-32 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md transition-all hover:scale-105 font-semibold">
          {submitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {mode === "create" ? "Creating..." : "Saving..."}
            </span>
          ) : (
            submitLabel ?? (mode === "create" ? "✨ Create Resource" : "💾 Save Changes")
          )}
        </Button>
        {mode === "edit" && onDelete && (
          <Button type="button" variant="destructive" onClick={deleteHandler} disabled={deleting} className="bg-rose-600 hover:bg-rose-700 dark:bg-rose-700 dark:hover:bg-rose-600 transition-all hover:scale-105 font-semibold text-white">
            {deleting ? "Deleting..." : "🗑️ Delete Resource"}
          </Button>
        )}
      </motion.div>
    </motion.form>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({
  title,
  description,
  icon,
  accentColor,
  lightBg,
  textColor,
  children,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  accentColor: string;
  lightBg: string;
  textColor: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`overflow-hidden border-l-4 ${accentColor} shadow-sm hover:shadow-md transition-shadow ${lightBg}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
              {icon}
            </div>
            <div>
              <CardTitle className={`text-lg font-bold ${textColor}`}>{title}</CardTitle>
              <CardDescription className="text-gray-700 dark:text-gray-300">{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function Field({
  label,
  required,
  error,
  hint,
  counter,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  counter?: { len: number; max: number; atLimit: boolean };
  children: ReactNode;
}) {
  const progressPercent = counter ? (counter.len / counter.max) * 100 : 0;
  
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-1 text-gray-800 dark:text-gray-200 font-medium">
          {label}
          {required && <span className="text-rose-600 dark:text-rose-400">*</span>}
        </Label>
        {counter && (
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${counter.atLimit ? 'bg-rose-500 dark:bg-rose-400' : 'bg-blue-500 dark:bg-blue-400'}`}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <span
              className={`text-xs tabular-nums font-medium ${
                counter.atLimit ? "text-rose-600 dark:text-rose-400" : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {counter.len}/{counter.max}
            </span>
          </div>
        )}
      </div>
      {children}
      {error && <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{error}</p>}
      {!error && hint && <p className="text-xs text-gray-600 dark:text-gray-400">{hint}</p>}
    </div>
  );
}

function FeatureToggle({
  label,
  icon,
  checked,
  onChange,
}: {
  label: string;
  icon: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-switch]')) return;
    onChange(!checked);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 transition-all ${
        checked
          ? "border-purple-400 dark:border-purple-500 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/40 dark:to-purple-800/30 shadow-sm"
          : "border-gray-300 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 bg-white dark:bg-gray-800"
      }`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onChange(!checked);
        }
      }}
    >
      <span className="text-xl pointer-events-none">{icon}</span>
      <span className={`text-sm font-semibold pointer-events-none ${checked ? 'text-purple-800 dark:text-purple-200' : 'text-gray-800 dark:text-gray-200'}`}>
        {label}
      </span>
      <div data-switch className="ml-auto">
        <Switch
          checked={checked}
          onCheckedChange={onChange}
          className="data-[state=checked]:bg-purple-600 dark:data-[state=checked]:bg-purple-500"
        />
      </div>
    </motion.div>
  );
}

const FEATURE_ITEMS = [
  { key: "hasProjector", label: "Projector", icon: "📽️" },
  { key: "hasAc", label: "Air Conditioning", icon: "❄️" },
  { key: "hasWhiteboard", label: "Whiteboard", icon: "✏️" },
  { key: "hasWifi", label: "Wi-Fi", icon: "📶" },
  { key: "hasComputers", label: "Computers", icon: "💻" },
  { key: "hasWindows", label: "Windows", icon: "🪟" },
];
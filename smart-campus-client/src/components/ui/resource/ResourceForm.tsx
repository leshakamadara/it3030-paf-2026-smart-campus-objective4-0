import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState, type ReactNode } from "react";
import {
  useForm,
  type SubmitHandler,
  type UseFormRegisterReturn,
} from "react-hook-form";
import { z } from "zod";
import type {
  ResourceRequest,
  ResourceStatus,
  ResourceType,
} from "../../../types/resource";

const resourceTypes: ResourceType[] = [
  "LECTURE_HALL",
  "LAB",
  "MEETING_ROOM",
  "PROJECTOR",
  "CAMERA",
];

const resourceStatuses: ResourceStatus[] = ["ACTIVE", "OUT_OF_SERVICE"];

const resourceFormSchema = z
  .object({
    resourceCode: z
      .string()
      .trim()
      .min(1, "Resource code is required")
      .max(50, "Resource code must not exceed 50 characters"),
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(100, "Name must not exceed 100 characters"),
    type: z.enum(resourceTypes, {
      error: "Type is required",
    }),
    building: z
      .string()
      .trim()
      .min(1, "Building is required")
      .max(100, "Building must not exceed 100 characters"),
    status: z.enum(resourceStatuses, {
      error: "Status is required",
    }),
    availableFrom: z.string().min(1, "Available from time is required"),
    availableTo: z.string().min(1, "Available to time is required"),
    isBookable: z.boolean(),
    isUnderMaintenance: z.boolean(),
    description: z
      .string()
      .max(500, "Description must not exceed 500 characters"),
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
    if (
      data.availableFrom &&
      data.availableTo &&
      data.availableFrom >= data.availableTo
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["availableTo"],
        message: "Available to time must be later than available from time",
      });
    }

    if (data.capacity.trim() !== "") {
      const parsed = Number(data.capacity);

      if (Number.isNaN(parsed)) {
        ctx.addIssue({
          code: "custom",
          path: ["capacity"],
          message: "Capacity must be a valid number",
        });
      } else if (parsed < 0) {
        ctx.addIssue({
          code: "custom",
          path: ["capacity"],
          message: "Capacity must be 0 or greater",
        });
      }
    }

    if (data.imageUrl.trim() !== "") {
      const result = z.string().url().safeParse(data.imageUrl.trim());

      if (!result.success) {
        ctx.addIssue({
          code: "custom",
          path: ["imageUrl"],
          message: "Image URL must be a valid URL",
        });
      }
    }
  });

type ResourceFormValues = z.input<typeof resourceFormSchema>;
type ResourceFormOutput = z.output<typeof resourceFormSchema>;

interface ResourceFormProps {
  mode: "create" | "edit";
  initialValues?: Partial<ResourceRequest>;
  onSubmit: (values: ResourceRequest) => Promise<void>;
  onDelete?: () => Promise<void>;
  submitLabel?: string;
  formError?: string;
}

const defaultValues: ResourceFormValues = {
  resourceCode: "",
  name: "",
  type: "LAB",
  building: "",
  status: "ACTIVE",
  availableFrom: "08:00",
  availableTo: "17:00",
  isBookable: true,
  isUnderMaintenance: false,
  description: "",
  capacity: "",
  imageUrl: "",
  hasProjector: false,
  hasAc: false,
  hasWhiteboard: false,
  hasWifi: false,
  hasComputers: false,
  hasWindows: false,
};

const normalizeTimeForInput = (value?: string) => {
  if (!value) return "";
  return value.length >= 5 ? value.slice(0, 5) : value;
};

const toBackendTime = (value: string) => {
  return value.length === 5 ? `${value}:00` : value;
};

const toFormValues = (
  initialValues?: Partial<ResourceRequest>,
): ResourceFormValues => ({
  resourceCode: initialValues?.resourceCode ?? "",
  name: initialValues?.name ?? "",
  type: initialValues?.type ?? "LAB",
  building: initialValues?.building ?? "",
  status: initialValues?.status ?? "ACTIVE",
  availableFrom:
    normalizeTimeForInput(initialValues?.availableFrom) ||
    defaultValues.availableFrom,
  availableTo:
    normalizeTimeForInput(initialValues?.availableTo) ||
    defaultValues.availableTo,
  isBookable: initialValues?.isBookable ?? true,
  isUnderMaintenance: initialValues?.isUnderMaintenance ?? false,
  description: initialValues?.description ?? "",
  capacity:
    initialValues?.capacity === null || initialValues?.capacity === undefined
      ? ""
      : String(initialValues.capacity),
  imageUrl: initialValues?.imageUrl ?? "",
  hasProjector: initialValues?.hasProjector ?? false,
  hasAc: initialValues?.hasAc ?? false,
  hasWhiteboard: initialValues?.hasWhiteboard ?? false,
  hasWifi: initialValues?.hasWifi ?? false,
  hasComputers: initialValues?.hasComputers ?? false,
  hasWindows: initialValues?.hasWindows ?? false,
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
  capacity:
    values.capacity.trim() === "" ? null : Number(values.capacity.trim()),
  imageUrl: values.imageUrl.trim() || undefined,
  hasProjector: values.hasProjector,
  hasAc: values.hasAc,
  hasWhiteboard: values.hasWhiteboard,
  hasWifi: values.hasWifi,
  hasComputers: values.hasComputers,
  hasWindows: values.hasWindows,
});

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

  const mergedDefaults = useMemo<ResourceFormValues>(
    () => toFormValues(initialValues),
    [initialValues],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResourceFormValues, unknown, ResourceFormOutput>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: mergedDefaults,
  });

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

    const confirmed = window.confirm(
      "Are you sure you want to delete this resource?",
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      await onDelete();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(submitHandler)}
      className="space-y-6 rounded-3xl bg-white p-6 shadow-sm"
    >
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          {mode === "create" ? "Create Resource" : "Edit Resource"}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Fill in the resource details carefully and save the changes.
        </p>
      </div>

      {formError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {formError}
        </div>
      ) : null}

      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Basic Information
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Resource Code" error={errors.resourceCode?.message}>
            <input
              type="text"
              {...register("resourceCode")}
              placeholder="LAB001"
              className={inputClass}
            />
          </FormField>

          <FormField label="Name" error={errors.name?.message}>
            <input
              type="text"
              {...register("name")}
              placeholder="Computer Lab 1"
              className={inputClass}
            />
          </FormField>

          <FormField label="Type" error={errors.type?.message}>
            <select {...register("type")} className={inputClass}>
              {resourceTypes.map((type) => (
                <option key={type} value={type}>
                  {type.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Building" error={errors.building?.message}>
            <input
              type="text"
              {...register("building")}
              placeholder="Engineering Building"
              className={inputClass}
            />
          </FormField>

          <FormField label="Status" error={errors.status?.message}>
            <select {...register("status")} className={inputClass}>
              {resourceStatuses.map((status) => (
                <option key={status} value={status}>
                  {status.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Capacity" error={errors.capacity?.message}>
            <input
              type="number"
              min="0"
              step="1"
              {...register("capacity")}
              placeholder="40"
              className={inputClass}
            />
          </FormField>

          <div className="md:col-span-2">
            <FormField label="Description" error={errors.description?.message}>
              <textarea
                {...register("description")}
                rows={4}
                placeholder="Describe the resource briefly..."
                className={`${inputClass} resize-none`}
              />
            </FormField>
          </div>

          <div className="md:col-span-2">
            <FormField label="Image URL" error={errors.imageUrl?.message}>
              <input
                type="url"
                {...register("imageUrl")}
                placeholder="https://example.com/resource.jpg"
                className={inputClass}
              />
            </FormField>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Availability & State
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            label="Available From"
            error={errors.availableFrom?.message}
          >
            <input
              type="time"
              {...register("availableFrom")}
              className={inputClass}
            />
          </FormField>

          <FormField label="Available To" error={errors.availableTo?.message}>
            <input
              type="time"
              {...register("availableTo")}
              className={inputClass}
            />
          </FormField>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <input type="checkbox" {...register("isBookable")} />
            Bookable
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <input type="checkbox" {...register("isUnderMaintenance")} />
            Under Maintenance
          </label>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Features & Facilities
        </h3>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCheckbox
            label="Projector"
            register={register("hasProjector")}
          />
          <FeatureCheckbox label="AC" register={register("hasAc")} />
          <FeatureCheckbox
            label="Whiteboard"
            register={register("hasWhiteboard")}
          />
          <FeatureCheckbox label="WiFi" register={register("hasWifi")} />
          <FeatureCheckbox
            label="Computers"
            register={register("hasComputers")}
          />
          <FeatureCheckbox label="Windows" register={register("hasWindows")} />
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting
            ? mode === "create"
              ? "Creating..."
              : "Saving..."
            : submitLabel ||
              (mode === "create" ? "Create Resource" : "Save Changes")}
        </button>

        {mode === "edit" && onDelete ? (
          <button
            type="button"
            onClick={deleteHandler}
            disabled={deleting}
            className="rounded-xl border border-red-300 bg-white px-5 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? "Deleting..." : "Delete Resource"}
          </button>
        ) : null}
      </div>
    </form>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-500";

interface FormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
}

function FormField({ label, error, children }: FormFieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

interface FeatureCheckboxProps {
  label: string;
  register: UseFormRegisterReturn;
}

function FeatureCheckbox({ label, register }: FeatureCheckboxProps) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
      <input type="checkbox" {...register} />
      {label}
    </label>
  );
}
import { useState, useRef } from "react";
import type { Ticket, Priority } from "../types/ticket";
import { CATEGORIES, PRIORITY_META } from "../constants/constants";

export default function CreateTicket({
  onSubmit,
  onCancel,
}: {
  onSubmit: (t: Partial<Ticket> & { imageFile?: File | null }) => void;
  onCancel: () => void;
}) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    priority: "MEDIUM" as Priority,
    resourceLocation: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const steps = ["Category", "Details", "Evidence", "Contact & Submit"];

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file: File) => {
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB.");
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // ─── Drag and Drop Handlers ────────────────────────────────────────
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFile(files[0]); // Only process the first file
    }
  };

  const handleSubmit = () => {
    onSubmit({ ...form, imageFile, images: imagePreview ? [imagePreview] : [] });
    setSubmitted(true);
  };

  const step0Valid = !!form.category;
  const step1Valid = !!form.title && !!form.description && !!form.resourceLocation;
  const canAdvance = [step0Valid, step1Valid, true, true][step];

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-6">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-3xl mb-4 animate-bounce">
          ✓
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Ticket Submitted!</h2>
        <p className="text-slate-500 text-sm max-w-sm mb-6">
          Your incident report has been logged. You'll receive updates here and via email as the team works on it.
        </p>
        <button
          onClick={onCancel}
          className="px-6 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition-colors"
        >
          Back to My Tickets
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button onClick={onCancel} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 mb-4 transition-colors">
          ← Back to tickets
        </button>
        <h1 className="text-2xl font-bold text-slate-800">Report an Incident</h1>
        <p className="text-slate-500 text-sm mt-1">Fill in the details below and our maintenance team will be notified.</p>
      </div>

      {/* Step bar */}
      <div className="flex items-center mb-8 gap-1">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-1 flex-1">
            <div className="flex flex-col items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i < step ? "bg-violet-600 text-white" :
                i === step ? "bg-violet-600 text-white ring-4 ring-violet-100" :
                "bg-slate-100 text-slate-400"
              }`}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className={`text-[10px] mt-1 font-medium whitespace-nowrap hidden sm:block ${i === step ? "text-violet-700" : i < step ? "text-violet-500" : "text-slate-400"}`}>
                {s}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 flex-1 mb-4 ${i < step ? "bg-violet-400" : "bg-slate-200"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 0 — Category */}
      {step === 0 && (
        <div>
          <h2 className="text-base font-semibold text-slate-700 mb-4">What type of issue is this?</h2>
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => setForm({ ...form, category: c.value })}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                  form.category === c.value
                    ? "border-violet-400 bg-violet-50 text-violet-800"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                <span className="text-xl">{c.icon}</span>
                <span className="text-sm font-medium leading-tight">{c.value}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 1 — Details */}
      {step === 1 && (
        <div className="space-y-5">
          <h2 className="text-base font-semibold text-slate-700">Describe the incident</h2>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
              Incident Title <span className="text-red-400">*</span>
            </label>
            <input
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-300 placeholder:text-slate-300"
              placeholder="e.g. Projector not working in Lab 3"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
              Location / Resource <span className="text-red-400">*</span>
            </label>
            <input
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-300 placeholder:text-slate-300"
              placeholder="e.g. Computer Lab 3, Engineering Block, Floor 2"
              value={form.resourceLocation}
              onChange={(e) => setForm({ ...form, resourceLocation: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={4}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none placeholder:text-slate-300"
              placeholder="What happened? When did it start? Any error messages?"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
              Priority
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["LOW", "MEDIUM", "HIGH"] as Priority[]).map((p) => {
                const m = PRIORITY_META[p];
                return (
                  <button
                    key={p}
                    onClick={() => setForm({ ...form, priority: p })}
                    className={`flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                      form.priority === p
                        ? `border-current ring-2 ${m.ring} ${m.color}`
                        : "border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full mt-0.5 shrink-0 ${m.dot}`} />
                    <div>
                      <p className="text-xs font-bold">{m.label}</p>
                      <p className="text-[10px] opacity-70 leading-tight">{m.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Step 2 — Image */}
      {step === 2 && (
        <div>
          <h2 className="text-base font-semibold text-slate-700 mb-1">Add evidence photo</h2>
          <p className="text-sm text-slate-400 mb-5">Optional — upload one image (photo of the damage, error screen, etc.)</p>

          <div
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
              isDragOver
                ? "border-violet-500 bg-violet-50 scale-105"
                : "border-slate-300 hover:bg-slate-50 hover:border-violet-400 bg-white"
            }`}
            onClick={() => fileRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="w-14 h-14 bg-slate-100 group-hover:bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl transition-colors">
              📷
            </div>
            <p className={`text-sm font-semibold mb-2 transition-colors ${
              isDragOver ? "text-violet-700" : "text-slate-600 group-hover:text-violet-700"
            }`}>
              {isDragOver ? "📸 Drop your image here!" : "Click to upload image"}
            </p>
            <p className={`text-xs transition-colors ${
              isDragOver ? "text-violet-600" : "text-slate-400"
            }`}>
              {isDragOver ? "Release to upload" : "Drag & drop or click to select • Max file size: 10MB"}
            </p>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />

          {imagePreview && (
            <div className="mt-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Preview:</p>
              <div className="relative group aspect-square max-w-xs mx-auto">
                <img src={imagePreview} alt="" className="w-full h-full object-cover rounded-xl border border-slate-200" />
                <button
                  onClick={() => {
                    setImagePreview(null);
                    setImageFile(null);
                  }}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {!imagePreview && (
            <p className="text-center text-xs text-slate-400 mt-4">No image attached — you can still submit without a photo.</p>
          )}
        </div>
      )}

      {/* Step 3 — Contact & Review */}
      {step === 3 && (
        <div className="space-y-5">
          <h2 className="text-base font-semibold text-slate-700">Confirm your contact details</h2>

          <div className="grid grid-cols-2 gap-3">
            

          </div>

          {/* Summary card */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Ticket Summary</p>
            <div className="space-y-2.5">
              {[
                { label: "Category", value: `${CATEGORIES.find((c) => c.value === form.category)?.icon} ${form.category}` },
                { label: "Title", value: form.title },
                { label: "Location", value: form.resourceLocation },
                { label: "Priority", value: PRIORITY_META[form.priority].label },
                { label: "Image", value: imagePreview ? "1 attached" : "None" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between gap-3 text-sm">
                  <span className="text-slate-400 shrink-0">{label}</span>
                  <span className="text-slate-700 font-medium text-right">{value || "—"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-5 border-t border-slate-100">
        <button
          onClick={() => step > 0 ? setStep(step - 1) : onCancel()}
          className="px-4 py-2.5 text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors"
        >
          {step > 0 ? "← Back" : "Cancel"}
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-300">{step + 1} / {steps.length}</span>
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canAdvance}
              className="px-6 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-6 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
            >
              Submit Ticket ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
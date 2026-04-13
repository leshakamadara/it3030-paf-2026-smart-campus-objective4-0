import { useRef, useState } from "react";
import type { TicketRequestDTO, Priority } from "../types/ticketTypes";
import { CATEGORIES, PRIORITY_CONFIG } from "../constants/ticketConstants";

export const CreateTicketModal = ({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (ticket: TicketRequestDTO) => void;
}) => {
  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    priority: "MEDIUM" as Priority,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [step, setStep] = useState(1);
  const fileRef = useRef<HTMLInputElement>(null);

  //  Image Handler 
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

  // Submit
  const handleSubmit = () => {
    if (!form.title || !form.category || !form.description) return;

    const ticketData: TicketRequestDTO = {
      ...form,
      imageFile: imageFile || undefined,
    };

    onSubmit(ticketData);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <p className="text-xs text-black uppercase tracking-widest">
              New Incident
            </p>
            <h2 className="text-lg font-semibold text-black">
              Create Ticket
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 text-black"
          >
            ✕
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex px-6 pt-4 gap-2">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-semibold ${
                  step >= s
                    ? "bg-violet-600 text-white"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {s}
              </div>

              <span
                className={`text-xs ${
                  step >= s ? "text-violet-600 font-medium" : "text-slate-400"
                }`}
              >
                {s === 1 ? "Details" : "Image"}
              </span>

              {s < 2 && (
                <div
                  className={`w-12 h-px ${
                    step > s ? "bg-violet-300" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* STEP 1 */}
          {step === 1 && (
            <>
              <div>
                <label className="text-xs text-black font-semibold mb-1 block">
                  Incident Title *
                </label>
                <input
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-black bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-600"
                  placeholder="Enter incident title"
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-black font-semibold mb-1 block">
                    Category *
                  </label>
                  <select
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-violet-600"
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                  >
                    <option value="">Select Category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-black font-semibold mb-1 block">Priority</label>
                  <div className="flex gap-1.5">
                    {(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as Priority[]).map(
                      (p) => (
                        <button
                          key={p}
                          onClick={() =>
                            setForm({ ...form, priority: p })
                          }
                          className={`flex-1 py-2 text-xs rounded-lg border font-semibold ${
                            form.priority === p
                              ? "bg-violet-600 border-violet-600 text-white"
                              : "border-slate-300 text-black bg-white hover:border-slate-400"
                          }`}
                        >
                          {PRIORITY_CONFIG[p].label}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-black font-semibold mb-1 block">
                  Description *
                </label>
                <textarea
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-black bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-600 resize-none"
                  rows={4}
                  placeholder="Describe the incident in detail"
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                />
              </div>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                  isDragOver
                    ? "border-violet-500 bg-violet-50 scale-105"
                    : "border-slate-300 hover:bg-slate-50 hover:border-violet-400 bg-white"
                }`}
                onClick={() => fileRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <p className={`text-sm font-semibold mb-2 transition-colors ${
                  isDragOver ? "text-violet-700" : "text-black"
                }`}>
                  {isDragOver ? "📸 Drop your image here!" : "📷 Upload Image (optional)"}
                </p>
                <p className={`text-xs transition-colors ${
                  isDragOver ? "text-violet-600" : "text-black"
                }`}>
                  {isDragOver ? "Release to upload" : "Drag & drop or click to select • Max file size: 10MB"}
                </p>
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleImage}
              />

              {imagePreview && (
                <div className="mt-3">
                  <p className="text-xs text-black font-semibold mb-2">Preview:</p>
                  <img
                    src={imagePreview}
                    className="h-32 w-full object-cover rounded-lg border border-slate-300"
                    alt="Preview"
                  />
                  <button
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="mt-2 text-xs text-red-600 hover:text-red-700 font-semibold"
                  >
                    Remove image
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between px-6 py-4 border-t bg-slate-50">
          <button
            onClick={() => (step === 1 ? onClose() : setStep(step - 1))}
            className="text-sm text-black hover:text-slate-600"
          >
            {step === 1 ? "Cancel" : "Back"}
          </button>

          <button
            onClick={() => (step < 2 ? setStep(step + 1) : handleSubmit())}
            className="bg-violet-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={step === 1 && (!form.title || !form.category || !form.description)}
          >
            {step < 2 ? "Next" : "Create Ticket"}
          </button>
        </div>
      </div>
    </div>
  );
};
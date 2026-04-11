import { useRef, useState } from "react";
import type { Ticket, Priority } from "../types/ticketTypes";
import { CATEGORIES, PRIORITY_CONFIG } from "../constants/ticketConstants";

export const CreateTicketModal = ({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (ticket: Partial<Ticket>) => void;
}) => {
  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    priority: "MEDIUM" as Priority,
    resourceLocation: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
  });

  const [images, setImages] = useState<string[]>([]);
  const [step, setStep] = useState(1);
  const fileRef = useRef<HTMLInputElement>(null);

  // ─── Image Handler ────────────────────────────────────────────────
  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (images.length + files.length > 3) {
      alert("Max 3 images allowed.");
      return;
    }

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setImages((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  // ─── Submit ───────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!form.title || !form.category || !form.description || !form.resourceLocation) return;

    onSubmit({
      ...form,
      images,
      status: "OPEN",
    });

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
            <p className="text-xs text-slate-400 uppercase tracking-widest">
              New Incident
            </p>
            <h2 className="text-lg font-semibold text-slate-800">
              Create Ticket
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500"
          >
            ✕
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex px-6 pt-4 gap-2">
          {[1, 2, 3].map((s) => (
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
                {s === 1 ? "Details" : s === 2 ? "Attachments" : "Contact"}
              </span>

              {s < 3 && (
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
                <label className="text-xs text-slate-500">
                  Incident Title *
                </label>
                <input
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500">
                    Category *
                  </label>
                  <select
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                  >
                    <option value="">Select</option>
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-500">Priority</label>
                  <div className="flex gap-1.5">
                    {(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as Priority[]).map(
                      (p) => (
                        <button
                          key={p}
                          onClick={() =>
                            setForm({ ...form, priority: p })
                          }
                          className={`flex-1 py-2 text-xs rounded-lg border ${
                            form.priority === p
                              ? "bg-violet-50 border-violet-400 text-violet-700"
                              : "border-slate-200"
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
                <label className="text-xs text-slate-500">
                  Location *
                </label>
                <input
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={form.resourceLocation}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      resourceLocation: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-xs text-slate-500">
                  Description *
                </label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  rows={4}
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
                className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer"
                onClick={() => fileRef.current?.click()}
              >
                <p className="text-sm">Upload Images (max 3)</p>
              </div>

              <input
                ref={fileRef}
                type="file"
                multiple
                accept="image/*"
                hidden
                onChange={handleImage}
              />

              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      className="h-20 w-full object-cover rounded"
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Name"
                value={form.contactName}
                onChange={(e) =>
                  setForm({ ...form, contactName: e.target.value })
                }
              />

              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Email"
                value={form.contactEmail}
                onChange={(e) =>
                  setForm({ ...form, contactEmail: e.target.value })
                }
              />

              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Phone"
                value={form.contactPhone}
                onChange={(e) =>
                  setForm({ ...form, contactPhone: e.target.value })
                }
              />
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between px-6 py-4 border-t bg-slate-50">
          <button
            onClick={() => (step === 1 ? onClose() : setStep(step - 1))}
            className="text-sm text-slate-500"
          >
            {step === 1 ? "Cancel" : "Back"}
          </button>

          <button
            onClick={() => (step < 3 ? setStep(step + 1) : handleSubmit())}
            className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            {step < 3 ? "Next" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};
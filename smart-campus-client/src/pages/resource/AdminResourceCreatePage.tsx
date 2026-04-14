import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ResourceForm from "../../components/ui/resource/ResourceForm";
import { isAdmin } from "../../lib/mockAuth";
import resourceService from "../../services/resourceService";
import type { ResourceRequest } from "../../types/resource";

export default function AdminResourceCreatePage() {
  const navigate = useNavigate();
  const [formError, setFormError] = useState("");

  if (!isAdmin()) {
    return <AccessDenied />;
  }

  const handleCreate = async (values: ResourceRequest) => {
    try {
      setFormError("");
      const created = await resourceService.createResource(values);
      navigate(`/resources/${created.id}`);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Failed to create resource. Please try again.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Sub-header */}
      <div className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              to="/resources"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Resources
            </Link>
            <span className="text-zinc-300">/</span>
            <span className="text-sm font-medium text-zinc-900">Create New</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <ResourceForm
          mode="create"
          onSubmit={handleCreate}
          formError={formError}
          submitLabel="Create Resource"
        />
      </div>
    </div>
  );
}

function AccessDenied() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6">
          <Link
            to="/resources"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Resources
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="flex items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-amber-100 text-xl">
            🔒
          </div>
          <div>
            <h2 className="font-semibold text-amber-900">Admin Access Required</h2>
            <p className="mt-1 text-sm text-amber-700">
              Only administrators can create new resources.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

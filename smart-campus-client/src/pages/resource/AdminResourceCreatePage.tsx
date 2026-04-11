import { Link, useNavigate } from "react-router-dom";
import ResourceForm from "../../components/ui/resource/ResourceForm";
import { isAdmin } from "../../lib/mockAuth";
import resourceService from "../../services/resourceService";
import type { ResourceRequest } from "../../types/resource";
import { useState } from "react";

export default function AdminResourceCreatePage() {
  const navigate = useNavigate();
  const [formError, setFormError] = useState("");

  if (!isAdmin()) {
    return (
      <AccessDeniedCard
        title="Admin access required"
        message="Only administrators can create new resources."
      />
    );
  }

  const handleCreate = async (values: ResourceRequest) => {
    try {
      setFormError("");
      const createdResource = await resourceService.createResource(values);
      navigate(`/resources/${createdResource.id}`);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Failed to create resource. Please try again.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-4">
        <Link
          to="/resources"
          className="inline-flex rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Back to Resources
        </Link>

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

interface AccessDeniedCardProps {
  title: string;
  message: string;
}

function AccessDeniedCard({ title, message }: AccessDeniedCardProps) {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-4">
        <Link
          to="/resources"
          className="inline-flex rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Back to Resources
        </Link>

        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-amber-800">{title}</h1>
          <p className="mt-2 text-sm text-amber-700">{message}</p>
        </div>
      </div>
    </div>
  );
}
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Lock } from "lucide-react";
import ResourceForm from "../../components/ui/resource/ResourceForm";
import { useToast } from "../../components/ui/toast-system";
import { useAuth } from "@/context/AuthContext";
import resourceService from "../../services/resourceService";
import type { ResourceRequest } from "../../types/resource";

export default function AdminResourceCreatePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const [formError, setFormError] = useState("");
  const isResourceAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  if (!isResourceAdmin) return <AccessDenied />;

  const handleCreate = async (values: ResourceRequest) => {
    try {
      setFormError("");
      const created = await resourceService.createResource(values);
      toast.success("Resource created!", `"${created.name}" has been added.`);
      navigate(`/dashboard/resources/${created.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create resource.";
      toast.error("Creation failed", message);
      setFormError(message);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f7f8f8" }}>
      {/* Brand accent stripe */}
      <div className="h-0.5 w-full" style={{ backgroundColor: "#5e6ad2" }} />

      {/* Sticky header */}
      <div className="sticky top-0 z-20 border-b" style={{ backgroundColor: "#ffffff", borderColor: "#e6e6e6" }}>
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm">
            <Link
              to="/dashboard/resources"
              className="inline-flex items-center gap-1 font-medium transition-colors hover:text-indigo-600"
              style={{ color: "#43464b" }}
            >
              <ChevronLeft className="h-4 w-4" />
              Resources
            </Link>
            <span style={{ color: "#d0d6e0" }}>/</span>
            <span className="font-medium" style={{ color: "#191a1b" }}>Create New</span>
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
    <div className="min-h-screen" style={{ backgroundColor: "#f7f8f8" }}>
      <div className="h-0.5 w-full" style={{ backgroundColor: "#5e6ad2" }} />
      <div className="border-b" style={{ backgroundColor: "#ffffff", borderColor: "#e6e6e6" }}>
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
          <Link
            to="/dashboard/resources"
            className="inline-flex items-center gap-1 text-sm font-medium transition-colors hover:text-indigo-600"
            style={{ color: "#43464b" }}
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Resources
          </Link>
        </div>
      </div>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-lg border p-6 flex items-start gap-4"
          style={{ backgroundColor: "#fffbeb", borderColor: "#fde68a" }}>
          <Lock className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: "#d97706" }} />
          <div>
            <p className="font-semibold text-sm" style={{ color: "#92400e" }}>Admin Access Required</p>
            <p className="text-sm mt-1" style={{ color: "#b45309" }}>
              Only administrators can create new resources.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
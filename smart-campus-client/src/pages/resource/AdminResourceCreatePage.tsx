import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/dashboard/resources">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Resources
              </Link>
            </Button>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium">Create New</span>
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
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6">
          <Button variant="ghost" asChild>
            <Link to="/dashboard/resources">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Resources
            </Link>
          </Button>
        </div>
      </div>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <Card className="border-amber-200 bg-amber-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-amber-800">
              <Lock className="h-5 w-5" />
              Admin Access Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-700">Only administrators can create new resources.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
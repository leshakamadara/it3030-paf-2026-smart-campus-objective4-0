import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Lock, Loader2, AlertCircle } from "lucide-react";
import ResourceForm from "../../components/ui/resource/ResourceForm";
import { useToast } from "../../components/ui/toast-system";
import { isAdmin } from "../../lib/mockAuth";
import resourceService from "../../services/resourceService";
import type { Resource, ResourceRequest } from "../../types/resource";

const toRequestValues = (resource: Resource): ResourceRequest => ({
  resourceCode: resource.resourceCode,
  name: resource.name,
  type: resource.type,
  building: resource.building,
  status: resource.status,
  availableFrom: resource.availableFrom,
  availableTo: resource.availableTo,
  isBookable: resource.isBookable,
  isUnderMaintenance: resource.isUnderMaintenance,
  description: resource.description ?? undefined,
  capacity: resource.capacity ?? null,
  imageUrl: resource.imageUrl ?? undefined,
  hasProjector: resource.hasProjector,
  hasAc: resource.hasAc,
  hasWhiteboard: resource.hasWhiteboard,
  hasWifi: resource.hasWifi,
  hasComputers: resource.hasComputers,
  hasWindows: resource.hasWindows,
});

export default function AdminResourceEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const admin = isAdmin();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(admin);
  const [pageError, setPageError] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!admin) return;
    if (!id) {
      setPageError("Resource ID is missing.");
      setLoading(false);
      return;
    }
    let isMounted = true;
    const fetchResource = async () => {
      try {
        setLoading(true);
        setPageError("");
        const data = await resourceService.getResourceById(Number(id));
        if (isMounted) setResource(data);
      } catch (error) {
        if (isMounted)
          setPageError(error instanceof Error ? error.message : "Failed to load resource.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchResource();
    return () => {
      isMounted = false;
    };
  }, [id, admin]);

  if (!admin) return <AccessDenied />;

  const handleUpdate = async (values: ResourceRequest) => {
    if (!id) return;
    try {
      setFormError("");
      const updated = await resourceService.updateResource(Number(id), values);
      toast.success("Changes saved!", `"${updated.name}" has been updated.`);
      navigate(`/resources/${updated.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update resource.";
      toast.error("Update failed", message);
      setFormError(message);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/resources">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Resources
              </Link>
            </Button>
            <span className="text-muted-foreground">/</span>
            {id && (
              <>
                <Button variant="ghost" asChild className="px-2">
                  <Link to={`/resources/${id}`}>#{id}</Link>
                </Button>
                <span className="text-muted-foreground">/</span>
              </>
            )}
            <span className="font-medium">Edit</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-3 text-muted-foreground">Loading resource...</span>
          </div>
        ) : pageError || !resource ? (
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="flex items-start gap-4 py-6">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div>
                <h2 className="font-semibold text-destructive">Failed to load</h2>
                <p className="text-sm text-destructive">{pageError || "Resource not found."}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <ResourceForm
            mode="edit"
            initialValues={toRequestValues(resource)}
            onSubmit={handleUpdate}
            formError={formError}
            submitLabel="Save Changes"
          />
        )}
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
            <Link to="/resources">
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
            <p className="text-amber-700">Only administrators can edit resources.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
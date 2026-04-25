import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Clock, MapPin, AlertCircle } from "lucide-react";
import ResourceStatusBadge from "./ResourceStatusBadge";
import type { Resource } from "../../../types/resource";

interface TypeConfig {
  label: string;
  icon: string;
  imageBg: string;
  imageIconColor: string;
  chipBg: string;
  borderAccent: string;
  viewBtn: string;
}

const TYPE_CONFIG: Record<string, TypeConfig> = {
  LECTURE_HALL: {
    label: "Lecture Hall",
    icon: "🏛️",
    imageBg: "bg-gradient-to-br from-violet-500/10 to-purple-500/10",
    imageIconColor: "text-violet-300",
    chipBg: "bg-violet-500/10 border-violet-200 text-violet-700",
    borderAccent: "border-l-violet-500",
    viewBtn: "hover:border-violet-500 hover:bg-violet-500/5 hover:text-violet-700",
  },
  LAB: {
    label: "Lab",
    icon: "🖥️",
    imageBg: "bg-gradient-to-br from-blue-500/10 to-sky-500/10",
    imageIconColor: "text-blue-300",
    chipBg: "bg-blue-500/10 border-blue-200 text-blue-700",
    borderAccent: "border-l-blue-500",
    viewBtn: "hover:border-blue-500 hover:bg-blue-500/5 hover:text-blue-700",
  },
  MEETING_ROOM: {
    label: "Meeting Room",
    icon: "🤝",
    imageBg: "bg-gradient-to-br from-teal-500/10 to-emerald-500/10",
    imageIconColor: "text-teal-300",
    chipBg: "bg-teal-500/10 border-teal-200 text-teal-700",
    borderAccent: "border-l-teal-500",
    viewBtn: "hover:border-teal-500 hover:bg-teal-500/5 hover:text-teal-700",
  },
  PROJECTOR: {
    label: "Projector",
    icon: "📽️",
    imageBg: "bg-gradient-to-br from-amber-500/10 to-yellow-500/10",
    imageIconColor: "text-amber-300",
    chipBg: "bg-amber-500/10 border-amber-200 text-amber-700",
    borderAccent: "border-l-amber-500",
    viewBtn: "hover:border-amber-500 hover:bg-amber-500/5 hover:text-amber-700",
  },
  CAMERA: {
    label: "Camera",
    icon: "📷",
    imageBg: "bg-gradient-to-br from-rose-500/10 to-pink-500/10",
    imageIconColor: "text-rose-300",
    chipBg: "bg-rose-500/10 border-rose-200 text-rose-700",
    borderAccent: "border-l-rose-500",
    viewBtn: "hover:border-rose-500 hover:bg-rose-500/5 hover:text-rose-700",
  },
};

const DEFAULT_TYPE_CONFIG: TypeConfig = {
  label: "Resource",
  icon: "📦",
  imageBg: "bg-gradient-to-br from-muted to-background",
  imageIconColor: "text-muted-foreground",
  chipBg: "bg-muted border-border text-muted-foreground",
  borderAccent: "border-l-primary",
  viewBtn: "hover:border-primary hover:bg-primary/5 hover:text-primary",
};

function ResourceCard({ resource }: { resource: Resource }) {
  const cfg = TYPE_CONFIG[resource.type] ?? DEFAULT_TYPE_CONFIG;
  const hasImage = !!resource.imageUrl;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Card className={`group overflow-hidden border-l-4 ${cfg.borderAccent} transition-all duration-300 hover:shadow-lg`}>
        {/* Reduced image height */}
        <div className="relative h-36 w-full overflow-hidden">
          {hasImage ? (
            <>
              <img
                src={resource.imageUrl!}
                alt={resource.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </>
          ) : (
            <div className={`flex h-full w-full items-center justify-center ${cfg.imageBg} transition-colors duration-300 group-hover:bg-opacity-80`}>
              <span className={`text-4xl opacity-60 ${cfg.imageIconColor} transition-transform duration-300 group-hover:scale-105`}>
                {cfg.icon}
              </span>
            </div>
          )}
          
          <div className="absolute right-2 top-2 z-10">
            <ResourceStatusBadge resource={resource} />
          </div>
          {resource.isBookable && (
            <div className="absolute left-2 top-2 z-10">
              <Badge variant="secondary" className="gap-1 text-xs py-0.5 backdrop-blur-sm bg-background/80">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Bookable
              </Badge>
            </div>
          )}
        </div>

        {/* Reduced padding and font sizes */}
        <CardContent className="p-3">
          <Badge 
            variant="outline" 
            className={`mb-1.5 text-xs ${cfg.chipBg} transition-all duration-200 group-hover:scale-105`}
          >
            {cfg.icon} {cfg.label}
          </Badge>
          <h3 className="truncate text-sm font-semibold group-hover:text-primary transition-colors">
            {resource.name}
          </h3>
          <p className="text-xs text-muted-foreground">{resource.resourceCode}</p>
          <p className="mt-1.5 flex items-center gap-1 text-xs">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            <span className="truncate">{resource.building}</span>
          </p>
          <div className="mt-2 border-t pt-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {resource.capacity != null ? `${resource.capacity} seats` : "—"}
              </span>
              <span className="flex items-center gap-1 font-mono text-xs">
                <Clock className="h-3 w-3" />
                {resource.availableFrom.slice(0, 5)}–{resource.availableTo.slice(0, 5)}
              </span>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className={`mt-3 w-full h-8 text-xs transition-all duration-300 ${cfg.viewBtn} group-hover:border-primary group-hover:bg-primary/10`} 
            asChild
          >
            <Link to={`/dashboard/resources/${resource.id}`}>View Details</Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface ResourceTableProps {
  resources: Resource[];
}

export default function ResourceTable({ resources }: ResourceTableProps) {
  if (resources.length === 0) {
    return (
      <Card className="py-12 text-center">
        <CardContent className="flex flex-col items-center gap-3">
          <div className="rounded-full bg-muted p-3">
            <AlertCircle className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="font-semibold">No resources found</p>
          <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {resources.map((resource) => (
        <ResourceCard key={resource.id} resource={resource} />
      ))}
    </div>
  );
}
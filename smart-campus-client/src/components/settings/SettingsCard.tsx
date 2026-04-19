import { type ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SettingsCardProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function SettingsCard({ title, description, children }: SettingsCardProps) {
  return (
    <Card className="border-[#d0d6e0] bg-[#ffffff]">
      <CardHeader>
        <CardTitle className="text-lg tracking-[-0.02em] text-[#191a1b]">{title}</CardTitle>
        {description && <p className="text-sm text-[#62666d]">{description}</p>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

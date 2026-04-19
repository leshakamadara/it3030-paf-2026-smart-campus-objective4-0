import { type ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SettingsCardProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function SettingsCard({ title, description, children }: SettingsCardProps) {
  return (
    <Card className="border-white/10 bg-[#0f1011]">
      <CardHeader>
        <CardTitle className="text-lg tracking-[-0.02em] text-[#f7f8f8]">{title}</CardTitle>
        {description && <p className="text-sm text-[#8a8f98]">{description}</p>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

import type { IssueOrchestration } from "@multica/core/types";
import { ORCHESTRATION_CONFIG } from "@multica/core/issues/config";
import { cn } from "@multica/ui/lib/utils";
import {
  Circle,
  Cog,
  FileText,
  BarChart3,
  Target,
  Users,
  Wrench,
  Gem,
} from "lucide-react";

const ORCHESTRATION_ICONS: Record<IssueOrchestration, typeof Users> = {
  consensus: Users,
  specification: FileText,
  development: Wrench,
  value: Gem,
  metrics: BarChart3,
  alignment: Target,
  operations: Cog,
};

export function OrchestrationIcon({
  orchestration,
  className = "h-3.5 w-3.5",
  inheritColor = false,
}: {
  orchestration: IssueOrchestration | null;
  className?: string;
  inheritColor?: boolean;
}) {
  const colorClass = inheritColor
    ? ""
    : orchestration
      ? ORCHESTRATION_CONFIG[orchestration].iconColor
      : "text-muted-foreground";
  const Icon = orchestration ? ORCHESTRATION_ICONS[orchestration] : Circle;

  return (
    <Icon
      aria-hidden="true"
      data-orchestration-icon={orchestration ?? "none"}
      className={cn("shrink-0", colorClass, className)}
      strokeWidth={1.75}
    />
  );
}

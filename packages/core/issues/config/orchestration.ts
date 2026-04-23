import type { IssueOrchestration } from "../../types";

export const ORCHESTRATION_ORDER: IssueOrchestration[] = [
  "consensus",
  "specification",
  "development",
  "value",
  "metrics",
  "alignment",
  "operations",
];

export const ORCHESTRATION_CONFIG: Record<
  IssueOrchestration,
  { label: string; iconColor: string; hoverBg: string; badgeBg: string; badgeText: string; columnBg: string }
> = {
  consensus: {
    label: "Consensus",
    iconColor: "text-info",
    hoverBg: "hover:bg-info/10",
    badgeBg: "bg-info/10",
    badgeText: "text-info",
    columnBg: "bg-info/5",
  },
  specification: {
    label: "Specification",
    iconColor: "text-primary",
    hoverBg: "hover:bg-primary/10",
    badgeBg: "bg-primary/10",
    badgeText: "text-primary",
    columnBg: "bg-primary/5",
  },
  development: {
    label: "Development",
    iconColor: "text-success",
    hoverBg: "hover:bg-success/10",
    badgeBg: "bg-success/10",
    badgeText: "text-success",
    columnBg: "bg-success/5",
  },
  value: {
    label: "Value",
    iconColor: "text-priority",
    hoverBg: "hover:bg-priority/10",
    badgeBg: "bg-priority/10",
    badgeText: "text-priority",
    columnBg: "bg-priority/5",
  },
  metrics: {
    label: "Metrics",
    iconColor: "text-warning",
    hoverBg: "hover:bg-warning/10",
    badgeBg: "bg-warning/10",
    badgeText: "text-warning",
    columnBg: "bg-warning/5",
  },
  alignment: {
    label: "Alignment",
    iconColor: "text-foreground",
    hoverBg: "hover:bg-accent",
    badgeBg: "bg-accent",
    badgeText: "text-accent-foreground",
    columnBg: "bg-accent/40",
  },
  operations: {
    label: "Operations",
    iconColor: "text-muted-foreground",
    hoverBg: "hover:bg-accent",
    badgeBg: "bg-muted",
    badgeText: "text-muted-foreground",
    columnBg: "bg-muted/40",
  },
};

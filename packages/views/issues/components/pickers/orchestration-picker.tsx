"use client";

import { useState } from "react";
import type { IssueOrchestration, UpdateIssueRequest } from "@multica/core/types";
import { ORCHESTRATION_ORDER, ORCHESTRATION_CONFIG } from "@multica/core/issues/config";
import { OrchestrationIcon } from "../orchestration-icon";
import { PropertyPicker, PickerItem } from "./property-picker";

export function OrchestrationPicker({
  orchestration,
  onUpdate,
  trigger: customTrigger,
  triggerRender,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  align,
}: {
  orchestration: IssueOrchestration | null;
  onUpdate: (updates: Partial<UpdateIssueRequest>) => void;
  trigger?: React.ReactNode;
  triggerRender?: React.ReactElement;
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
  align?: "start" | "center" | "end";
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledOnOpenChange ?? setInternalOpen;
  const cfg = orchestration ? ORCHESTRATION_CONFIG[orchestration] : null;
  const label = cfg?.label ?? "No orchestration";

  return (
    <PropertyPicker
      open={open}
      onOpenChange={setOpen}
      width="w-52"
      align={align}
      triggerRender={triggerRender}
      trigger={
        customTrigger ?? (
          <>
            <OrchestrationIcon orchestration={orchestration} className="h-3.5 w-3.5" />
            <span className="truncate">{label}</span>
          </>
        )
      }
    >
      {ORCHESTRATION_ORDER.map((value) => {
        const item = ORCHESTRATION_CONFIG[value];
        return (
          <PickerItem
            key={value}
            selected={value === orchestration}
            hoverClassName={item.hoverBg}
            onClick={() => {
              onUpdate({ orchestration: value });
              setOpen(false);
            }}
          >
            <span className={`inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 text-xs font-medium ${item.badgeBg} ${item.badgeText}`}>
              <OrchestrationIcon orchestration={value} className="h-3 w-3" inheritColor />
              {item.label}
            </span>
          </PickerItem>
        );
      })}
      <PickerItem
        selected={orchestration === null}
        onClick={() => {
          onUpdate({ orchestration: null });
          setOpen(false);
        }}
      >
        <span className="inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 text-xs font-medium bg-muted text-muted-foreground">
          <OrchestrationIcon orchestration={null} className="h-3 w-3" inheritColor />
          No orchestration
        </span>
      </PickerItem>
    </PropertyPicker>
  );
}

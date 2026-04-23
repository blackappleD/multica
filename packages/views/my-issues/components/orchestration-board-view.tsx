"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  pointerWithin,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import type { Issue, IssueOrchestration } from "@multica/core/types";
import { ORCHESTRATION_CONFIG, ORCHESTRATION_ORDER } from "@multica/core/issues/config";
import { useViewStore } from "@multica/core/issues/stores/view-store-context";
import type { SortDirection, SortField } from "@multica/core/issues/stores/view-store";
import { Button } from "@multica/ui/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@multica/ui/components/ui/tooltip";
import { useModalStore } from "@multica/core/modals";
import { sortIssues } from "../../issues/utils/sort";
import { BoardCardContent, DraggableBoardCard } from "../../issues/components/board-card";
import { OrchestrationIcon } from "../../issues/components";
import type { ChildProgress } from "../../issues/components/list-row";

type OrchestrationColumnKey = IssueOrchestration | "none";

const COLUMN_ORDER: OrchestrationColumnKey[] = [...ORCHESTRATION_ORDER, "none"];
const COLUMN_IDS = new Set<string>(COLUMN_ORDER);

const NONE_COLUMN_CONFIG = {
  label: "No orchestration",
  badgeBg: "bg-muted",
  badgeText: "text-muted-foreground",
  columnBg: "bg-muted/30",
};

const kanbanCollision: CollisionDetection = (args) => {
  const pointer = pointerWithin(args);
  if (pointer.length > 0) {
    const cards = pointer.filter((c) => !COLUMN_IDS.has(c.id as string));
    if (cards.length > 0) return cards;
  }
  return closestCenter(args);
};

function buildColumns(
  issues: Issue[],
  sortBy: SortField,
  sortDirection: SortDirection,
): Record<OrchestrationColumnKey, string[]> {
  const columns = Object.fromEntries(
    COLUMN_ORDER.map((key) => [key, [] as string[]]),
  ) as Record<OrchestrationColumnKey, string[]>;

  for (const key of COLUMN_ORDER) {
    const sorted = sortIssues(
      issues.filter((issue) =>
        key === "none" ? issue.orchestration == null : issue.orchestration === key,
      ),
      sortBy,
      sortDirection,
    );
    columns[key] = sorted.map((issue) => issue.id);
  }

  return columns;
}

function findColumn(
  columns: Record<OrchestrationColumnKey, string[]>,
  id: string,
): OrchestrationColumnKey | null {
  if (COLUMN_IDS.has(id)) return id as OrchestrationColumnKey;
  for (const [column, ids] of Object.entries(columns)) {
    if (ids.includes(id)) return column as OrchestrationColumnKey;
  }
  return null;
}

function computePosition(ids: string[], activeId: string, issueMap: Map<string, Issue>): number {
  const idx = ids.indexOf(activeId);
  if (idx === -1) return 0;
  const getPos = (id: string) => issueMap.get(id)?.position ?? 0;
  if (ids.length === 1) return issueMap.get(activeId)?.position ?? 0;
  if (idx === 0) return getPos(ids[1]!) - 1;
  if (idx === ids.length - 1) return getPos(ids[idx - 1]!) + 1;
  return (getPos(ids[idx - 1]!) + getPos(ids[idx + 1]!)) / 2;
}

function toOrchestrationValue(column: OrchestrationColumnKey): IssueOrchestration | null {
  return column === "none" ? null : column;
}

const EMPTY_PROGRESS_MAP = new Map<string, ChildProgress>();

export function OrchestrationBoardView({
  issues,
  childProgressMap = EMPTY_PROGRESS_MAP,
  onMoveIssue,
}: {
  issues: Issue[];
  childProgressMap?: Map<string, ChildProgress>;
  onMoveIssue: (
    issueId: string,
    newOrchestration: IssueOrchestration | null,
    newPosition?: number,
  ) => void;
}) {
  const sortBy = useViewStore((s) => s.sortBy);
  const sortDirection = useViewStore((s) => s.sortDirection);

  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);
  const isDraggingRef = useRef(false);
  const [columns, setColumns] = useState<Record<OrchestrationColumnKey, string[]>>(() =>
    buildColumns(issues, sortBy, sortDirection),
  );
  const columnsRef = useRef(columns);
  columnsRef.current = columns;

  useEffect(() => {
    if (!isDraggingRef.current) {
      setColumns(buildColumns(issues, sortBy, sortDirection));
    }
  }, [issues, sortBy, sortDirection]);

  const issueMap = useMemo(() => {
    const map = new Map<string, Issue>();
    for (const issue of issues) map.set(issue.id, issue);
    return map;
  }, [issues]);

  const issueMapRef = useRef(issueMap);
  if (!isDraggingRef.current) {
    issueMapRef.current = issueMap;
  }

  const recentlyMovedRef = useRef(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      recentlyMovedRef.current = false;
    });
    return () => cancelAnimationFrame(id);
  }, [columns]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    isDraggingRef.current = true;
    setActiveIssue(issueMapRef.current.get(event.active.id as string) ?? null);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || recentlyMovedRef.current) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    setColumns((prev) => {
      const activeCol = findColumn(prev, activeId);
      const overCol = findColumn(prev, overId);
      if (!activeCol || !overCol || activeCol === overCol) return prev;

      recentlyMovedRef.current = true;
      const oldIds = prev[activeCol].filter((id) => id !== activeId);
      const nextIds = [...prev[overCol]];
      const overIndex = nextIds.indexOf(overId);
      const insertIndex = overIndex >= 0 ? overIndex : nextIds.length;
      nextIds.splice(insertIndex, 0, activeId);
      return { ...prev, [activeCol]: oldIds, [overCol]: nextIds };
    });
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    isDraggingRef.current = false;
    setActiveIssue(null);

    const resetColumns = () => setColumns(buildColumns(issues, sortBy, sortDirection));

    if (!over) {
      resetColumns();
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;
    const currentColumns = columnsRef.current;
    const activeCol = findColumn(currentColumns, activeId);
    const overCol = findColumn(currentColumns, overId);

    if (!activeCol || !overCol) {
      resetColumns();
      return;
    }

    let finalColumns = currentColumns;
    if (activeCol === overCol) {
      const ids = currentColumns[activeCol];
      const oldIndex = ids.indexOf(activeId);
      const newIndex = ids.indexOf(overId);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const reordered = arrayMove(ids, oldIndex, newIndex);
        finalColumns = { ...currentColumns, [activeCol]: reordered };
        setColumns(finalColumns);
      }
    }

    const finalCol = findColumn(finalColumns, activeId);
    if (!finalCol) {
      resetColumns();
      return;
    }

    const map = issueMapRef.current;
    const finalIds = finalColumns[finalCol];
    const newPosition = computePosition(finalIds, activeId, map);
    const currentIssue = map.get(activeId);
    const newOrchestration = toOrchestrationValue(finalCol);

    if (
      currentIssue &&
      currentIssue.orchestration === newOrchestration &&
      currentIssue.position === newPosition
    ) {
      return;
    }

    onMoveIssue(activeId, newOrchestration, newPosition);
  }, [issues, onMoveIssue, sortBy, sortDirection]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={kanbanCollision}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-1 min-h-0 gap-4 overflow-x-auto p-4">
        {COLUMN_ORDER.map((column) => (
          <OrchestrationBoardColumn
            key={column}
            column={column}
            issueIds={columns[column] ?? []}
            issueMap={issueMapRef.current}
            childProgressMap={childProgressMap}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeIssue ? (
          <div className="w-[280px] rotate-2 scale-105 cursor-grabbing opacity-90 shadow-lg shadow-black/10">
            <BoardCardContent
              issue={activeIssue}
              childProgress={childProgressMap.get(activeIssue.id)}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function OrchestrationBoardColumn({
  column,
  issueIds,
  issueMap,
  childProgressMap,
}: {
  column: OrchestrationColumnKey;
  issueIds: string[];
  issueMap: Map<string, Issue>;
  childProgressMap?: Map<string, ChildProgress>;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column });
  const config = column === "none" ? NONE_COLUMN_CONFIG : ORCHESTRATION_CONFIG[column];
  const value = toOrchestrationValue(column);
  const resolvedIssues = useMemo(
    () =>
      issueIds.flatMap((id) => {
        const issue = issueMap.get(id);
        return issue ? [issue] : [];
      }),
    [issueIds, issueMap],
  );

  return (
    <div className={`flex w-[280px] shrink-0 flex-col rounded-xl ${config.columnBg} p-2`}>
      <div className="mb-2 flex items-center justify-between px-1.5">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-semibold ${config.badgeBg} ${config.badgeText}`}>
            <OrchestrationIcon orchestration={value} className="h-3 w-3" inheritColor />
            {config.label}
          </span>
          <span className="text-xs text-muted-foreground">{issueIds.length}</span>
        </div>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="rounded-full text-muted-foreground"
                onClick={() =>
                  useModalStore.getState().open("create-issue", {
                    orchestration: value ?? undefined,
                  })
                }
              >
                <Plus className="size-3.5" />
              </Button>
            }
          />
          <TooltipContent>Add issue</TooltipContent>
        </Tooltip>
      </div>

      <div
        ref={setNodeRef}
        className={`min-h-[200px] flex-1 space-y-2 overflow-y-auto rounded-lg p-1 transition-colors ${
          isOver ? "bg-accent/60" : ""
        }`}
      >
        <SortableContext items={issueIds} strategy={verticalListSortingStrategy}>
          {resolvedIssues.map((issue) => (
            <DraggableBoardCard
              key={issue.id}
              issue={issue}
              childProgress={childProgressMap?.get(issue.id)}
            />
          ))}
        </SortableContext>
        {issueIds.length === 0 && (
          <p className="py-8 text-center text-xs text-muted-foreground">No issues</p>
        )}
      </div>
    </div>
  );
}

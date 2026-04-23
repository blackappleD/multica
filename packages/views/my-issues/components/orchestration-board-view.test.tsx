import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Issue } from "@multica/core/types";

const mockViewState = {
  sortBy: "position" as const,
  sortDirection: "asc" as const,
};

vi.mock("@multica/core/issues/stores/view-store-context", () => ({
  useViewStore: (selector: (state: typeof mockViewState) => unknown) => selector(mockViewState),
}));

vi.mock("@multica/core/modals", () => ({
  useModalStore: Object.assign(
    () => ({ open: vi.fn() }),
    { getState: () => ({ open: vi.fn() }) },
  ),
}));

vi.mock("@multica/ui/components/ui/button", () => ({
  Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock("@multica/ui/components/ui/tooltip", () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipTrigger: ({ render }: { render: React.ReactNode }) => <>{render}</>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@dnd-kit/core", () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DragOverlay: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PointerSensor: class {},
  useSensor: () => ({}),
  useSensors: () => [],
  useDroppable: () => ({ setNodeRef: vi.fn(), isOver: false }),
  pointerWithin: vi.fn(() => []),
  closestCenter: vi.fn(() => []),
}));

vi.mock("@dnd-kit/sortable", () => ({
  arrayMove: (arr: unknown[], from: number, to: number) => {
    const next = [...arr];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
  },
  SortableContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  verticalListSortingStrategy: {},
}));

vi.mock("../../issues/components/board-card", () => ({
  BoardCardContent: ({ issue }: { issue: Issue }) => <div>{issue.title}</div>,
  DraggableBoardCard: ({ issue }: { issue: Issue }) => <div>{issue.title}</div>,
}));

vi.mock("../../issues/components", () => ({
  OrchestrationIcon: () => <span data-testid="orchestration-icon" />,
}));

const issues: Issue[] = [
  {
    id: "issue-1",
    workspace_id: "ws-1",
    number: 1,
    identifier: "OPE-1",
    title: "Spec issue",
    description: null,
    status: "todo",
    priority: "none",
    orchestration: "specification",
    assignee_type: null,
    assignee_id: null,
    creator_type: "member",
    creator_id: "user-1",
    parent_issue_id: null,
    project_id: null,
    position: 1,
    due_date: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "issue-2",
    workspace_id: "ws-1",
    number: 2,
    identifier: "OPE-2",
    title: "Value issue",
    description: null,
    status: "in_progress",
    priority: "none",
    orchestration: "value",
    assignee_type: null,
    assignee_id: null,
    creator_type: "member",
    creator_id: "user-1",
    parent_issue_id: null,
    project_id: null,
    position: 2,
    due_date: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "issue-3",
    workspace_id: "ws-1",
    number: 3,
    identifier: "OPE-3",
    title: "Ungrouped issue",
    description: null,
    status: "backlog",
    priority: "none",
    orchestration: null,
    assignee_type: null,
    assignee_id: null,
    creator_type: "member",
    creator_id: "user-1",
    parent_issue_id: null,
    project_id: null,
    position: 3,
    due_date: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
];

import { OrchestrationBoardView } from "./orchestration-board-view";

describe("OrchestrationBoardView", () => {
  it("renders orchestration columns in enum order and groups issues", () => {
    const { container } = render(
      <OrchestrationBoardView issues={issues} onMoveIssue={vi.fn()} />,
    );

    expect(screen.getByText("Spec issue")).toBeInTheDocument();
    expect(screen.getByText("Value issue")).toBeInTheDocument();
    expect(screen.getByText("Ungrouped issue")).toBeInTheDocument();
    expect(screen.getByText("No orchestration")).toBeInTheDocument();

    const labels = Array.from(container.querySelectorAll("span"))
      .map((node) => node.textContent?.trim())
      .filter((text): text is string => Boolean(text));

    expect(labels.indexOf("Consensus")).toBeGreaterThanOrEqual(0);
    expect(labels.indexOf("Specification")).toBeGreaterThan(labels.indexOf("Consensus"));
    expect(labels.indexOf("Development")).toBeGreaterThan(labels.indexOf("Specification"));
    expect(labels.indexOf("Value")).toBeGreaterThan(labels.indexOf("Development"));
    expect(labels.indexOf("Metrics")).toBeGreaterThan(labels.indexOf("Value"));
    expect(labels.indexOf("Alignment")).toBeGreaterThan(labels.indexOf("Metrics"));
    expect(labels.indexOf("Operations")).toBeGreaterThan(labels.indexOf("Alignment"));
    expect(labels.indexOf("No orchestration")).toBeGreaterThan(labels.indexOf("Operations"));
  });
});

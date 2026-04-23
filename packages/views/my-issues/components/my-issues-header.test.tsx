import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

const mockState = {
  viewMode: "board" as const,
  statusFilters: [] as string[],
  priorityFilters: [] as string[],
  sortBy: "position" as const,
  sortDirection: "asc" as const,
  cardProperties: {
    orchestration: true,
    priority: true,
    description: true,
    assignee: true,
    dueDate: true,
    project: true,
    childProgress: true,
  },
  scope: "assigned" as const,
  setScope: vi.fn(),
  setViewMode: vi.fn(),
  toggleStatusFilter: vi.fn(),
  togglePriorityFilter: vi.fn(),
  setSortBy: vi.fn(),
  setSortDirection: vi.fn(),
  toggleCardProperty: vi.fn(),
  clearFilters: vi.fn(),
};

vi.mock("zustand", () => ({
  useStore: (store: { getState: () => typeof mockState }, selector: (state: typeof mockState) => unknown) =>
    selector(store.getState()),
}));

vi.mock("@multica/core/issues/stores/my-issues-view-store", () => ({
  myIssuesViewStore: {
    getState: () => mockState,
  },
}));

vi.mock("@multica/core/issues/stores/view-store", () => ({
  SORT_OPTIONS: [
    { value: "position", label: "Manual" },
    { value: "priority", label: "Priority" },
  ],
  DEFAULT_CARD_PROPERTIES: {
    orchestration: false,
    priority: true,
    description: true,
    assignee: true,
    dueDate: true,
    project: true,
    childProgress: true,
  },
  CARD_PROPERTY_OPTIONS: [
    { key: "priority", label: "Priority" },
    { key: "description", label: "Description" },
  ],
}));

vi.mock("@multica/core/issues/config", () => ({
  ALL_STATUSES: ["backlog", "todo"],
  STATUS_CONFIG: {
    backlog: { label: "Backlog" },
    todo: { label: "Todo" },
  },
  PRIORITY_ORDER: ["high", "none"],
  PRIORITY_CONFIG: {
    high: { label: "High" },
    none: { label: "No priority" },
  },
}));

vi.mock("../../issues/components", () => ({
  StatusIcon: () => <span data-testid="status-icon" />,
  PriorityIcon: () => <span data-testid="priority-icon" />,
}));

vi.mock("@multica/ui/components/ui/button", () => ({
  Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock("@multica/ui/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ render }: { render: React.ReactNode }) => <>{render}</>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuGroup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
  DropdownMenuCheckboxItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuLabel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
  DropdownMenuSub: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuSubTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuSubContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@multica/ui/components/ui/popover", () => ({
  Popover: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PopoverTrigger: ({ render }: { render: React.ReactNode }) => <>{render}</>,
  PopoverContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@multica/ui/components/ui/switch", () => ({
  Switch: ({ checked }: { checked: boolean }) => <input type="checkbox" readOnly checked={checked} />,
}));

vi.mock("@multica/ui/components/ui/tooltip", () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipTrigger: ({ render }: { render: React.ReactNode }) => <>{render}</>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import { MyIssuesHeader } from "./my-issues-header";

describe("MyIssuesHeader", () => {
  it("shows orchestration in card properties and view options", () => {
    render(<MyIssuesHeader allIssues={[]} />);

    expect(screen.getByText("Card properties")).toBeInTheDocument();
    expect(screen.getAllByText("Orchestration").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("Board")).toBeInTheDocument();
    expect(screen.getByText("List")).toBeInTheDocument();
  });
});

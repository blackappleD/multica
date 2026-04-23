import { describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { Issue } from "@multica/core/types";

const mockCardProperties = {
  orchestration: true,
  priority: false,
  description: false,
  assignee: false,
  dueDate: false,
  project: false,
  childProgress: false,
};

vi.mock("@multica/core/issues/stores/view-store-context", () => ({
  useViewStore: (selector: (state: { cardProperties: typeof mockCardProperties }) => unknown) =>
    selector({ cardProperties: mockCardProperties }),
}));

vi.mock("@multica/core/hooks", () => ({
  useWorkspaceId: () => "ws-1",
}));

vi.mock("@multica/core/projects/queries", () => ({
  projectListOptions: () => ({
    queryKey: ["projects"],
    queryFn: () => Promise.resolve([]),
  }),
}));

vi.mock("@multica/core/issues/mutations", () => ({
  useUpdateIssue: () => ({ mutate: vi.fn() }),
}));

vi.mock("../../common/actor-avatar", () => ({
  ActorAvatar: () => <div />,
}));

vi.mock("./pickers", () => ({
  PriorityPicker: () => <div />,
  OrchestrationPicker: ({ trigger }: { trigger: React.ReactNode }) => <div>{trigger}</div>,
  AssigneePicker: () => <div />,
  DueDatePicker: () => <div />,
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn() },
}));

const issue: Issue = {
  id: "issue-1",
  workspace_id: "ws-1",
  number: 1,
  identifier: "OPE-1",
  title: "Design orchestration card",
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
  position: 0,
  due_date: null,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

const issueWithoutOrchestration: Issue = {
  ...issue,
  id: "issue-2",
  identifier: "OPE-2",
  title: "Design empty orchestration card",
  orchestration: null,
};

import { BoardCardContent } from "./board-card";

describe("BoardCardContent", () => {
  it("renders orchestration icon trigger when enabled", () => {
    const client = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
      },
    });

    const { container } = render(
      <QueryClientProvider client={client}>
        <BoardCardContent issue={issue} editable />
      </QueryClientProvider>,
    );

    expect(screen.getByText("Design orchestration card")).toBeInTheDocument();
    expect(screen.getByLabelText("Orchestration: specification")).toBeInTheDocument();
    expect(container.querySelector('[data-orchestration-icon="specification"]')).not.toBeNull();
  });

  it("renders a placeholder orchestration trigger when value is empty", () => {
    const client = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
      },
    });

    const { container } = render(
      <QueryClientProvider client={client}>
        <BoardCardContent issue={issueWithoutOrchestration} editable />
      </QueryClientProvider>,
    );

    expect(screen.getByText("Design empty orchestration card")).toBeInTheDocument();
    expect(screen.getByLabelText("Orchestration: No orchestration")).toBeInTheDocument();
    expect(container.querySelector('[data-orchestration-icon="none"]')).not.toBeNull();
  });
});

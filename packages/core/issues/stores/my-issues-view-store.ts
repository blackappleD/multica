"use client";

import { createStore, type StoreApi } from "zustand/vanilla";
import { persist } from "zustand/middleware";
import {
  DEFAULT_CARD_PROPERTIES,
  type IssueViewState,
  viewStoreSlice,
  viewStorePersistOptions,
} from "./view-store";
import { registerForWorkspaceRehydration } from "../../platform/workspace-storage";

export type MyIssuesScope = "assigned" | "created" | "agents";

export interface MyIssuesViewState extends IssueViewState {
  scope: MyIssuesScope;
  setScope: (scope: MyIssuesScope) => void;
}

const basePersist = viewStorePersistOptions("multica_my_issues_view");
const MY_ISSUES_DEFAULT_CARD_PROPERTIES = {
  ...DEFAULT_CARD_PROPERTIES,
  orchestration: true,
};

const _myIssuesViewStore = createStore<MyIssuesViewState>()(
  persist(
    (set) => ({
      ...viewStoreSlice(set as unknown as StoreApi<IssueViewState>["setState"]),
      cardProperties: MY_ISSUES_DEFAULT_CARD_PROPERTIES,
      scope: "assigned" as MyIssuesScope,
      setScope: (scope: MyIssuesScope) => set({ scope }),
    }),
    {
      name: basePersist.name,
      storage: basePersist.storage,
      merge: (persistedState, currentState) => {
        const persisted = (persistedState ?? {}) as Partial<MyIssuesViewState>;
        return {
          ...currentState,
          ...persisted,
          cardProperties: {
            ...MY_ISSUES_DEFAULT_CARD_PROPERTIES,
            ...currentState.cardProperties,
            ...persisted.cardProperties,
          },
        };
      },
      partialize: (state: MyIssuesViewState) => ({
        ...basePersist.partialize(state),
        scope: state.scope,
      }),
    },
  ),
);

export const myIssuesViewStore: StoreApi<MyIssuesViewState> = _myIssuesViewStore;

registerForWorkspaceRehydration(() => _myIssuesViewStore.persist.rehydrate());

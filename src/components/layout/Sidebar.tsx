"use client";

import type { Group } from "@/types/database";
import { Button } from "@/components/ui/Button";

type SidebarProps = {
  groups: Group[];
  selectedGroupId: string | null;
  onSelectGroup: (groupId: string) => void;
  onCreateGroup: () => void;
  onNavigate?: () => void;
};

function GroupIcon() {
  return (
    <svg className="h-4 w-4 shrink-0 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

export function Sidebar({
  groups,
  selectedGroupId,
  onSelectGroup,
  onCreateGroup,
  onNavigate,
}: SidebarProps) {
  function handleSelect(groupId: string) {
    onSelectGroup(groupId);
    onNavigate?.();
  }

  function handleCreate() {
    onCreateGroup();
    onNavigate?.();
  }

  return (
    <aside className="flex h-full w-full flex-col bg-white md:w-64 md:border-r md:border-slate-200">
      <div className="border-b border-slate-100 px-5 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-sm font-bold text-white shadow-sm">
            SB
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">SplitBite</h1>
            <p className="text-xs text-slate-500">Split expenses, your way</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
        <div className="mb-2 flex items-center justify-between px-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Groups
          </span>
          <Button size="sm" variant="ghost" onClick={handleCreate}>
            + New
          </Button>
        </div>

        {groups.length === 0 ? (
          <div className="mx-2 rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center">
            <p className="text-sm text-slate-500">No groups yet</p>
            <Button size="sm" className="mt-3" onClick={handleCreate}>
              Create group
            </Button>
          </div>
        ) : (
          <ul className="space-y-1">
            {groups.map((group) => {
              const selected = selectedGroupId === group.id;
              return (
                <li key={group.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(group.id)}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition-all ${
                      selected
                        ? "bg-emerald-600 font-medium text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-50 active:bg-slate-100"
                    }`}
                  >
                    <GroupIcon />
                    <span className="truncate">{group.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}

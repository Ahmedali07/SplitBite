"use client";

import type { Group } from "@/types/database";
import { Button } from "@/components/ui/Button";

type SidebarProps = {
  groups: Group[];
  selectedGroupId: string | null;
  onSelectGroup: (groupId: string) => void;
  onCreateGroup: () => void;
};

export function Sidebar({
  groups,
  selectedGroupId,
  onSelectGroup,
  onCreateGroup,
}: SidebarProps) {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-5">
        <h1 className="text-xl font-bold text-emerald-700">SplitBite</h1>
        <p className="mt-1 text-xs text-slate-500">Split expenses, your way</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="mb-2 flex items-center justify-between px-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Groups
          </span>
          <Button size="sm" variant="ghost" onClick={onCreateGroup}>
            + New
          </Button>
        </div>

        {groups.length === 0 ? (
          <p className="px-2 py-4 text-sm text-slate-500">
            No groups yet. Create one to get started.
          </p>
        ) : (
          <ul className="space-y-1">
            {groups.map((group) => (
              <li key={group.id}>
                <button
                  type="button"
                  onClick={() => onSelectGroup(group.id)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    selectedGroupId === group.id
                      ? "bg-emerald-50 font-medium text-emerald-800"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {group.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}

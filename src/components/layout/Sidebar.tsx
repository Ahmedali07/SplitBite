"use client";

import type { Group } from "@/types/database";
import { Button } from "@/components/ui/Button";

type SidebarProps = {
  groups: Group[];
  selectedGroupId: string | null;
  onSelectGroup: (groupId: string) => void;
  onCreateGroup: () => void;
  onNavigate?: () => void;
  userName?: string | null;
  userAvatarUrl?: string | null;
  onSignOut?: () => void;
};

const AVATAR_COLORS = [
  "bg-emerald-100 text-emerald-700",
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
];

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function GroupIcon() {
  return (
    <svg className="h-4 w-4 shrink-0 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function LogOutIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}

function UserAvatar({ name, avatarUrl }: { name: string; avatarUrl?: string | null }) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt=""
        className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-white"
      />
    );
  }

  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ring-2 ring-white ${avatarColor(name)}`}
      aria-hidden
    >
      {initial}
    </div>
  );
}

export function Sidebar({
  groups,
  selectedGroupId,
  onSelectGroup,
  onCreateGroup,
  onNavigate,
  userName,
  userAvatarUrl,
  onSignOut,
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

      {(userName || onSignOut) && (
        <div className="border-t border-slate-100 p-4">
          {userName && (
            <div className="mb-3 flex items-center gap-3">
              <UserAvatar name={userName} avatarUrl={userAvatarUrl} />
              <p className="min-w-0 truncate text-sm font-medium text-slate-800">{userName}</p>
            </div>
          )}
          {onSignOut && (
            <Button
              size="sm"
              variant="ghost"
              className="w-full justify-start gap-2 px-2 text-slate-500"
              onClick={onSignOut}
            >
              <LogOutIcon />
              Log out
            </Button>
          )}
        </div>
      )}
    </aside>
  );
}

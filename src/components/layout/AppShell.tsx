"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import type { Group } from "@/types/database";

type AppShellProps = {
  groups: Group[];
  selectedGroupId: string | null;
  selectedGroupName: string | null;
  onSelectGroup: (groupId: string) => void;
  onCreateGroup: () => void;
  userName?: string | null;
  userAvatarUrl?: string | null;
  onSignOut?: () => void;
  children: React.ReactNode;
};

function MenuIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export function AppShell({
  groups,
  selectedGroupId,
  selectedGroupName,
  onSelectGroup,
  onCreateGroup,
  userName,
  userAvatarUrl,
  onSignOut,
  children,
}: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen]);

  return (
    <div className="flex h-[100dvh] flex-col bg-slate-100 md:flex-row">
      {/* Mobile top bar */}
      <header className="flex shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-4 py-3 shadow-sm md:hidden">
        <button
          type="button"
          onClick={() => setMobileNavOpen(true)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 active:bg-slate-200"
          aria-label="Open menu"
        >
          <MenuIcon />
        </button>
        <div className="min-w-0 flex-1 px-3 text-center">
          <p className="truncate text-sm font-semibold text-slate-900">
            {selectedGroupName ?? "SplitBite"}
          </p>
        </div>
        <button
          type="button"
          onClick={onCreateGroup}
          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm active:bg-emerald-700"
        >
          + New
        </button>
      </header>

      {/* Mobile drawer overlay */}
      {mobileNavOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 animate-fade-in bg-slate-900/40 backdrop-blur-[2px] md:hidden"
          onClick={() => setMobileNavOpen(false)}
          aria-label="Close menu"
        />
      )}

      {/* Sidebar — drawer on mobile, static on desktop */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-[min(85vw,18rem)] transform transition-transform duration-300 ease-out md:static md:z-auto md:w-auto md:translate-x-0 md:transition-none ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="relative h-full shadow-elevated md:shadow-none">
          <button
            type="button"
            onClick={() => setMobileNavOpen(false)}
            className="absolute right-3 top-4 z-10 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 md:hidden"
            aria-label="Close menu"
          >
            <CloseIcon />
          </button>
          <Sidebar
            groups={groups}
            selectedGroupId={selectedGroupId}
            onSelectGroup={onSelectGroup}
            onCreateGroup={onCreateGroup}
            onNavigate={() => setMobileNavOpen(false)}
            userName={userName}
            userAvatarUrl={userAvatarUrl}
            onSignOut={onSignOut}
          />
        </div>
      </div>

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}

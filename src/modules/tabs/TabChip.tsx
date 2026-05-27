import { cn } from "@/lib/utils";
import { fileIconUrl } from "@/modules/explorer/lib/iconResolver";
import {
  Clock01Icon,
  ComputerTerminal02Icon,
  GitCompareIcon,
  Globe02Icon,
  IncognitoIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { tabLabel } from "@/modules/tabs/lib/tabLabel";
import type { TabDragGhostGeom } from "@/modules/tabs/lib/tabReorder";
import type { EditorTab, Tab } from "@/modules/tabs/lib/useTabs";

export function TabChipLabel({
  tab,
  compact,
}: {
  tab: Tab;
  compact?: boolean;
}) {
  const isPreview = tab.kind === "editor" && (tab as EditorTab).preview;
  return (
    <span
      className={cn(
        "flex items-center gap-1.5 truncate",
        compact ? "max-w-48" : "max-w-80",
      )}
    >
      <TabIcon tab={tab} />
      <span className={cn("truncate", isPreview && "italic")}>
        {tabLabel(tab)}
      </span>
      {tab.kind === "editor" && tab.dirty ? (
        <span
          aria-label="Unsaved changes"
          className="size-1.5 shrink-0 rounded-full bg-foreground/70"
        />
      ) : null}
    </span>
  );
}

export function TabDragGhost({
  tab,
  geom,
  compact,
}: {
  tab: Tab;
  geom: TabDragGhostGeom;
  compact?: boolean;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed z-[200] inline-flex h-7 items-center gap-1.5 rounded-md border border-border/60 text-xs shadow-md transition-none opacity-50",
        geom.isActive
          ? "bg-accent text-foreground"
          : "bg-card text-muted-foreground",
      )}
      style={{
        left: geom.x,
        top: geom.y,
        width: geom.width,
        minHeight: geom.height,
      }}
    >
      <TabChipLabel tab={tab} compact={compact} />
    </div>
  );
}

function TabIcon({ tab }: { tab: Tab }) {
  if (tab.kind === "editor" || tab.kind === "markdown") {
    const url = fileIconUrl(tab.title);
    return url ? <img src={url} alt="" className="size-3.5 shrink-0" /> : null;
  }
  if (tab.kind === "preview") {
    return (
      <HugeiconsIcon
        icon={Globe02Icon}
        size={14}
        strokeWidth={2}
        className="shrink-0"
      />
    );
  }
  if (tab.kind === "ai-diff") {
    return (
      <HugeiconsIcon
        icon={GitCompareIcon}
        size={14}
        strokeWidth={2}
        className="shrink-0"
      />
    );
  }
  if (tab.kind === "terminal" && tab.private) {
    return (
      <HugeiconsIcon
        icon={IncognitoIcon}
        size={14}
        strokeWidth={2}
        className="shrink-0"
      />
    );
  }
  if (tab.kind === "git-diff" || tab.kind === "git-commit-file") {
    return (
      <HugeiconsIcon
        icon={GitCompareIcon}
        size={14}
        strokeWidth={2}
        className="shrink-0"
      />
    );
  }
  if (tab.kind === "git-history") {
    return (
      <HugeiconsIcon
        icon={Clock01Icon}
        size={14}
        strokeWidth={2}
        className="shrink-0"
      />
    );
  }
  return (
    <HugeiconsIcon
      icon={ComputerTerminal02Icon}
      size={14}
      strokeWidth={2}
      className="shrink-0"
    />
  );
}

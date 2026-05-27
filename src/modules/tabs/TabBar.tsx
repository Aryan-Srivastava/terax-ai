import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fmtShortcut, MOD_KEY } from "@/lib/platform";
import { cn } from "@/lib/utils";
import { TabChipLabel, TabDragGhost } from "@/modules/tabs/TabChip";
import { useTabReorder } from "@/modules/tabs/lib/useTabReorder";
import {
  Cancel01Icon,
  ComputerTerminal02Icon,
  GitBranchIcon,
  Globe02Icon,
  IncognitoIcon,
  PencilEdit02Icon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { EditorTab, Tab } from "./lib/useTabs";

type Props = {
  tabs: Tab[];
  activeId: number;
  onSelect: (id: number) => void;
  onNew: () => void;
  onNewPrivate: () => void;
  onNewPreview: () => void;
  onNewEditor: () => void;
  onNewGitGraph: () => void;
  onClose: (id: number) => void;
  /** Pin (promote) a preview tab to persistent on double-click. */
  onPin: (id: number) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  compact?: boolean;
};

export function TabBar({
  tabs,
  activeId,
  onSelect,
  onNew,
  onNewPrivate,
  onNewPreview,
  onNewEditor,
  onNewGitGraph,
  onClose,
  onPin,
  onReorder,
  compact,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const canReorder = tabs.length > 1;
  const { ghostGeom, bindTab } = useTabReorder({
    tabs,
    activeId,
    enabled: canReorder,
    onReorder,
  });

  const ghostTab =
    ghostGeom !== null
      ? tabs.find((t) => t.id === ghostGeom.tabId)
      : undefined;

  // Horizontal wheel scroll without holding shift.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      if (el.scrollWidth <= el.clientWidth) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // Keep the active tab visible after selection / open.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const active = el.querySelector<HTMLElement>(`[data-tab-id="${activeId}"]`);
    active?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [activeId, tabs.length]);

  return (
    <>
      <div
        ref={scrollRef}
        className="min-w-0 shrink overflow-x-auto [-ms-overflow-style:none] [app-region:no-drag] [scrollbar-width:none] [-webkit-app-region:no-drag] [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex w-max items-center gap-0.5">
          <Tabs
            value={String(activeId)}
            onValueChange={(v) => onSelect(Number(v))}
          >
            <TabsList className="h-7 w-max gap-0.5 bg-transparent p-0">
              {tabs.map((t) => {
                const isPreview =
                  t.kind === "editor" && (t as EditorTab).preview;
                const {
                  isDragging,
                  showInsertBefore,
                  showInsertAfter,
                  onPointerDown,
                  onPointerMove,
                  onPointerUp,
                  onPointerCancel,
                } = bindTab(t);
                return (
                  <TabsTrigger key={t.id} value={String(t.id)} asChild>
                    <div
                      data-tab-id={t.id}
                      onPointerDown={onPointerDown}
                      onPointerMove={onPointerMove}
                      onPointerUp={onPointerUp}
                      onPointerCancel={onPointerCancel}
                      onDoubleClick={() => isPreview && onPin(t.id)}
                      className={cn(
                        "group relative inline-flex h-7 shrink-0 cursor-default touch-none items-center gap-1.5 rounded-md text-xs text-muted-foreground transition-colors outline-none select-none data-[state=active]:bg-accent data-[state=active]:text-foreground hover:text-foreground/80 justify-between",
                        isDragging &&
                          "pointer-events-none opacity-40 transition-none",
                        compact
                          ? "px-1.5!"
                          : tabs.length === 1
                            ? "px-2!"
                            : "ps-2! pe-1!",
                      )}
                    >
                      {showInsertBefore ? (
                        <span
                          aria-hidden
                          className="pointer-events-none absolute top-1 bottom-1 left-0 z-10 w-0.5 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_6px_1px] shadow-primary/40"
                        />
                      ) : null}
                      {showInsertAfter ? (
                        <span
                          aria-hidden
                          className="pointer-events-none absolute top-1 right-0 bottom-1 z-10 w-0.5 translate-x-1/2 rounded-full bg-primary shadow-[0_0_6px_1px] shadow-primary/40"
                        />
                      ) : null}
                      <TabChipLabel tab={t} compact={compact} />
                      {tabs.length > 1 && (
                        <span
                          role="button"
                          aria-label="Close tab"
                          onClick={(e) => {
                            e.stopPropagation();
                            onClose(t.id);
                          }}
                          className="rounded p-0.5 opacity-0 transition-opacity hover:bg-accent hover:opacity-100 group-hover:opacity-60"
                        >
                          <HugeiconsIcon
                            icon={Cancel01Icon}
                            size={11}
                            strokeWidth={2}
                          />
                        </span>
                      )}
                    </div>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 shrink-0 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                title="New tab"
              >
                <HugeiconsIcon icon={PlusSignIcon} size={14} strokeWidth={2} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-44">
              <DropdownMenuItem onSelect={() => onNew()}>
                <HugeiconsIcon
                  icon={ComputerTerminal02Icon}
                  size={14}
                  strokeWidth={1.75}
                />
                <span className="flex-1">Terminal</span>
                <span className="text-xs text-muted-foreground">
                  {fmtShortcut(MOD_KEY, "T")}
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onNewPrivate()}>
                <HugeiconsIcon
                  icon={IncognitoIcon}
                  size={14}
                  strokeWidth={1.75}
                />
                <span className="flex-1">Privacy</span>
                <span className="text-xs text-muted-foreground">
                  {fmtShortcut(MOD_KEY, "R")}
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onNewEditor()}>
                <HugeiconsIcon
                  icon={PencilEdit02Icon}
                  size={14}
                  strokeWidth={1.75}
                />
                <span className="flex-1">Editor</span>
                <span className="text-xs text-muted-foreground">
                  {fmtShortcut(MOD_KEY, "E")}
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onNewPreview()}>
                <HugeiconsIcon
                  icon={Globe02Icon}
                  size={14}
                  strokeWidth={1.75}
                />
                <span className="flex-1">Preview</span>
                <span className="text-xs text-muted-foreground">
                  {fmtShortcut(MOD_KEY, "P")}
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onNewGitGraph()}>
                <HugeiconsIcon
                  icon={GitBranchIcon}
                  size={14}
                  strokeWidth={1.75}
                />
                <span className="flex-1">Git Graph</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {ghostTab && ghostGeom
        ? createPortal(
            <TabDragGhost tab={ghostTab} geom={ghostGeom} compact={compact} />,
            document.body,
          )
        : null}
    </>
  );
}

import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import type { Tab } from "./useTabs";
import {
  ghostGeomFromRect,
  hitTestTabDropHint,
  moveGhostGeom,
  resolveReorderIndices,
  TAB_DRAG_THRESHOLD_PX,
  type TabDragGhostGeom,
  type TabDropHint,
} from "./tabReorder";

type PointerDrag = {
  sourceId: number;
  startX: number;
  active: boolean;
};

type Options = {
  tabs: Tab[];
  activeId: number;
  enabled: boolean;
  onReorder: (fromIndex: number, toIndex: number) => void;
};

export function useTabReorder({
  tabs,
  activeId,
  enabled,
  onReorder,
}: Options) {
  const pointerDragRef = useRef<PointerDrag | null>(null);
  const dropHintRef = useRef<TabDropHint | null>(null);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dropHint, setDropHint] = useState<TabDropHint | null>(null);
  const [ghostGeom, setGhostGeom] = useState<TabDragGhostGeom | null>(null);

  const indexOfTabId = useCallback(
    (id: number) => tabs.findIndex((t) => t.id === id),
    [tabs],
  );

  const clearDrag = useCallback(() => {
    pointerDragRef.current = null;
    dropHintRef.current = null;
    setDraggingId(null);
    setDropHint(null);
    setGhostGeom(null);
  }, []);

  const updateDropHint = useCallback((clientX: number, clientY: number) => {
    const hint = hitTestTabDropHint(clientX, clientY);
    dropHintRef.current = hint;
    setDropHint(hint);
  }, []);

  useEffect(() => {
    if (!draggingId) return;
    const prev = document.body.style.cursor;
    document.body.style.cursor = "grabbing";
    return () => {
      document.body.style.cursor = prev;
    };
  }, [draggingId]);

  const bindTab = useCallback(
    (tab: Tab) => {
      const isDragging = draggingId === tab.id;
      const showInsertBefore =
        dropHint?.tabId === tab.id && dropHint.before && !isDragging;
      const showInsertAfter =
        dropHint?.tabId === tab.id && !dropHint.before && !isDragging;

      const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
        if (!enabled || e.button !== 0) return;
        if (
          (e.target as HTMLElement).closest('[aria-label="Close tab"]')
        ) {
          return;
        }
        e.currentTarget.setPointerCapture(e.pointerId);
        pointerDragRef.current = {
          sourceId: tab.id,
          startX: e.clientX,
          active: false,
        };
      };

      const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
        const st = pointerDragRef.current;
        if (!st || st.sourceId !== tab.id) return;
        if (!st.active) {
          if (Math.abs(e.clientX - st.startX) < TAB_DRAG_THRESHOLD_PX) return;
          st.active = true;
          setDraggingId(st.sourceId);
          const rect = e.currentTarget.getBoundingClientRect();
          setGhostGeom(
            ghostGeomFromRect(
              rect,
              tab.id,
              e.clientX,
              e.clientY,
              tab.id === activeId,
            ),
          );
        }
        e.preventDefault();
        setGhostGeom((g) =>
          g ? moveGhostGeom(g, e.clientX, e.clientY) : null,
        );
        updateDropHint(e.clientX, e.clientY);
      };

      const finishPointer = (e: PointerEvent<HTMLDivElement>) => {
        const st = pointerDragRef.current;
        if (!st || st.sourceId !== tab.id) return;
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
        if (st.active) {
          e.preventDefault();
          const hint = dropHintRef.current;
          if (hint) {
            const indices = resolveReorderIndices(
              indexOfTabId(st.sourceId),
              indexOfTabId(hint.tabId),
              hint.before,
            );
            if (indices) onReorder(indices.fromIndex, indices.toIndex);
          }
        }
        clearDrag();
      };

      return {
        isDragging,
        showInsertBefore,
        showInsertAfter,
        onPointerDown,
        onPointerMove,
        onPointerUp: finishPointer,
        onPointerCancel: finishPointer,
      };
    },
    [
      activeId,
      clearDrag,
      draggingId,
      dropHint,
      enabled,
      indexOfTabId,
      onReorder,
      updateDropHint,
    ],
  );

  return { ghostGeom, bindTab };
}

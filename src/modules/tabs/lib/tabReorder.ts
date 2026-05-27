export type TabDropHint = { tabId: number; before: boolean };

export type TabDragGhostGeom = {
  tabId: number;
  x: number;
  y: number;
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
  isActive: boolean;
};

export const TAB_DRAG_THRESHOLD_PX = 5;

const TAB_SELECTOR = "[data-tab-id]";

/** Target index in the tab array after the dragged item is removed. */
export function reorderTargetIndex(
  fromIndex: number,
  targetIndex: number,
  before: boolean,
): number {
  if (before) {
    return fromIndex < targetIndex ? targetIndex - 1 : targetIndex;
  }
  return fromIndex <= targetIndex ? targetIndex : targetIndex + 1;
}

export function resolveReorderIndices(
  fromIndex: number,
  targetIndex: number,
  before: boolean,
): { fromIndex: number; toIndex: number } | null {
  if (fromIndex === -1 || targetIndex === -1) return null;
  const toIndex = reorderTargetIndex(fromIndex, targetIndex, before);
  if (fromIndex === toIndex) return null;
  return { fromIndex, toIndex };
}

export function ghostGeomFromRect(
  rect: DOMRect,
  tabId: number,
  clientX: number,
  clientY: number,
  isActive: boolean,
): TabDragGhostGeom {
  return {
    tabId,
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height,
    offsetX: clientX - rect.left,
    offsetY: clientY - rect.top,
    isActive,
  };
}

export function moveGhostGeom(
  geom: TabDragGhostGeom,
  clientX: number,
  clientY: number,
): TabDragGhostGeom {
  return {
    ...geom,
    x: clientX - geom.offsetX,
    y: clientY - geom.offsetY,
  };
}

export function hitTestTabDropHint(
  clientX: number,
  clientY: number,
): TabDropHint | null {
  const tabEl = document
    .elementFromPoint(clientX, clientY)
    ?.closest<HTMLElement>(TAB_SELECTOR);
  if (!tabEl?.dataset.tabId) return null;
  const rect = tabEl.getBoundingClientRect();
  return {
    tabId: Number(tabEl.dataset.tabId),
    before: clientX < rect.left + rect.width / 2,
  };
}

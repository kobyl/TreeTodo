import { useState, useCallback } from 'react';

export interface UseTreeStateReturn {
  expandedIds: Set<number>;
  toggle: (id: number) => void;
  expand: (id: number) => void;
  collapse: (id: number) => void;
  expandAll: (ids: number[]) => void;
  collapseAll: () => void;
  isExpanded: (id: number) => boolean;
}

export function useTreeState(initialExpanded: number[] = []): UseTreeStateReturn {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(() => new Set(initialExpanded));

  const toggle = useCallback((id: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const expand = useCallback((id: number) => {
    setExpandedIds(prev => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const collapse = useCallback((id: number) => {
    setExpandedIds(prev => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const expandAll = useCallback((ids: number[]) => {
    setExpandedIds(new Set(ids));
  }, []);

  const collapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  const isExpanded = useCallback((id: number) => expandedIds.has(id), [expandedIds]);

  return { expandedIds, toggle, expand, collapse, expandAll, collapseAll, isExpanded };
}

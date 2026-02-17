import { renderHook, act } from '@testing-library/react';
import { useTreeState } from './useTreeState';

describe('useTreeState', () => {
  it('toggle_ExpandCollapsed_ExpandsNode', () => {
    const { result } = renderHook(() => useTreeState());
    expect(result.current.isExpanded(1)).toBe(false);
    act(() => result.current.toggle(1));
    expect(result.current.isExpanded(1)).toBe(true);
  });

  it('toggle_CollapseExpanded_CollapsesNode', () => {
    const { result } = renderHook(() => useTreeState([1]));
    expect(result.current.isExpanded(1)).toBe(true);
    act(() => result.current.toggle(1));
    expect(result.current.isExpanded(1)).toBe(false);
  });

  it('expand_AlreadyExpanded_RemainsExpanded', () => {
    const { result } = renderHook(() => useTreeState([1]));
    act(() => result.current.expand(1));
    expect(result.current.isExpanded(1)).toBe(true);
  });

  it('collapse_NotExpanded_RemainsCollapsed', () => {
    const { result } = renderHook(() => useTreeState());
    act(() => result.current.collapse(1));
    expect(result.current.isExpanded(1)).toBe(false);
  });

  it('expandAll_MultipleIds_AllExpanded', () => {
    const { result } = renderHook(() => useTreeState());
    act(() => result.current.expandAll([1, 2, 3]));
    expect(result.current.isExpanded(1)).toBe(true);
    expect(result.current.isExpanded(2)).toBe(true);
    expect(result.current.isExpanded(3)).toBe(true);
  });

  it('collapseAll_WithExpanded_AllCollapsed', () => {
    const { result } = renderHook(() => useTreeState([1, 2]));
    act(() => result.current.collapseAll());
    expect(result.current.isExpanded(1)).toBe(false);
    expect(result.current.isExpanded(2)).toBe(false);
  });
});

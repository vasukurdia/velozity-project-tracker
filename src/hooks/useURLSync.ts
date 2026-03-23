import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { FilterState, Status, Priority } from '../types';

export function useURLSync() {
  const { filters, setFilters, view, setView } = useAppStore();

  // On mount, read URL params and apply to store
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const statuses = params.getAll('status') as Status[];
    const priorities = params.getAll('priority') as Priority[];
    const assignees = params.getAll('assignee');
    const dateFrom = params.get('dateFrom') || '';
    const dateTo = params.get('dateTo') || '';
    const viewParam = params.get('view') as 'kanban' | 'list' | 'timeline' | null;

    if (viewParam && ['kanban', 'list', 'timeline'].includes(viewParam)) {
      setView(viewParam);
    }

    const hasFilters = statuses.length || priorities.length || assignees.length || dateFrom || dateTo;
    if (hasFilters) {
      setFilters({ statuses, priorities, assignees, dateFrom, dateTo });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Whenever filters or view change, update URL
  useEffect(() => {
    const params = new URLSearchParams();

    params.set('view', view);
    filters.statuses.forEach((s) => params.append('status', s));
    filters.priorities.forEach((p) => params.append('priority', p));
    filters.assignees.forEach((a) => params.append('assignee', a));
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.set('dateTo', filters.dateTo);

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState(null, '', newUrl);
  }, [filters, view]);

  // Handle browser back/forward
  useEffect(() => {
    const handlePop = () => {
      const params = new URLSearchParams(window.location.search);
      const statuses = params.getAll('status') as Status[];
      const priorities = params.getAll('priority') as Priority[];
      const assignees = params.getAll('assignee');
      const dateFrom = params.get('dateFrom') || '';
      const dateTo = params.get('dateTo') || '';
      const viewParam = params.get('view') as 'kanban' | 'list' | 'timeline' | null;

      setFilters({ statuses, priorities, assignees, dateFrom, dateTo });
      if (viewParam && ['kanban', 'list', 'timeline'].includes(viewParam)) {
        setView(viewParam);
      }
    };

    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, [setFilters, setView]);
}

export function useHasActiveFilters(): boolean {
  const filters = useAppStore((s) => s.filters);
  return (
    filters.statuses.length > 0 ||
    filters.priorities.length > 0 ||
    filters.assignees.length > 0 ||
    !!filters.dateFrom ||
    !!filters.dateTo
  );
}

export function isDefaultFilters(filters: FilterState): boolean {
  return (
    filters.statuses.length === 0 &&
    filters.priorities.length === 0 &&
    filters.assignees.length === 0 &&
    !filters.dateFrom &&
    !filters.dateTo
  );
}

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Task, SortField } from '../../types';
import { formatDate, isOverdue, isDueToday, PRIORITY_ORDER, PRIORITY_COLORS } from '../../utils';
import { PriorityBadge } from '../ui/PriorityBadge';
import { Avatar } from '../ui/Avatar';
import { StatusDropdown } from '../ui/StatusDropdown';
import { CardCollaborators } from '../collaboration/CardCollaborators';
import { USERS } from '../../data/generator';

const ROW_HEIGHT = 52;
const BUFFER = 5;

function sortTasks(tasks: Task[], field: SortField, direction: 'asc' | 'desc'): Task[] {
  return [...tasks].sort((a, b) => {
    let cmp = 0;
    if (field === 'title') {
      cmp = a.title.localeCompare(b.title);
    } else if (field === 'priority') {
      cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    } else if (field === 'dueDate') {
      cmp = a.dueDate.localeCompare(b.dueDate);
    }
    return direction === 'asc' ? cmp : -cmp;
  });
}

interface SortHeaderProps {
  field: SortField;
  label: string;
  currentField: SortField;
  direction: 'asc' | 'desc';
  onSort: (field: SortField) => void;
  className?: string;
}

const SortHeader: React.FC<SortHeaderProps> = ({ field, label, currentField, direction, onSort, className = '' }) => {
  const active = field === currentField;
  return (
    <button
      onClick={() => onSort(field)}
      className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
        active ? 'text-accent-blue' : 'text-white/30 hover:text-white/60'
      } ${className}`}
    >
      {label}
      <span className={`transition-all ${active ? 'opacity-100' : 'opacity-0'}`}>
        {direction === 'asc' ? '↑' : '↓'}
      </span>
    </button>
  );
};

export const ListView: React.FC = () => {
  const { sort, setSort, getFilteredTasks, clearFilters } = useAppStore();
  const allTasks = getFilteredTasks();
  const sortedTasks = useMemo(
    () => sortTasks(allTasks, sort.field, sort.direction),
    [allTasks, sort]
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(500);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setContainerHeight(el.clientHeight));
    ro.observe(el);
    setContainerHeight(el.clientHeight);
    return () => ro.disconnect();
  }, []);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const totalHeight = sortedTasks.length * ROW_HEIGHT;
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER);
  const visibleCount = Math.ceil(containerHeight / ROW_HEIGHT) + BUFFER * 2;
  const endIndex = Math.min(sortedTasks.length, startIndex + visibleCount);
  const visibleTasks = sortedTasks.slice(startIndex, endIndex);
  const offsetY = startIndex * ROW_HEIGHT;

  if (sortedTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20">
        <div className="w-16 h-16 rounded-2xl bg-surface-2 flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-white/40 text-sm font-medium mb-1">No tasks found</p>
        <p className="text-white/25 text-xs mb-4">Try adjusting your filters</p>
        <button
          onClick={clearFilters}
          className="px-4 py-2 rounded-lg bg-accent-blue/15 text-accent-blue text-xs font-medium hover:bg-accent-blue/25 transition-colors border border-accent-blue/30"
        >
          Clear filters
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full rounded-2xl border border-white/8 bg-surface-1/50 overflow-hidden">
      {/* Table header */}
      <div className="flex items-center px-4 py-3 border-b border-white/8 gap-4 flex-shrink-0 bg-surface-1">
        <div className="w-5" />
        <SortHeader field="title" label="Task" currentField={sort.field} direction={sort.direction} onSort={setSort} className="flex-1 text-left" />
        <SortHeader field="priority" label="Priority" currentField={sort.field} direction={sort.direction} onSort={setSort} className="w-24 text-left" />
        <div className="w-32 text-xs font-semibold uppercase tracking-wider text-white/30 text-left">Status</div>
        <div className="w-24 text-xs font-semibold uppercase tracking-wider text-white/30 text-left">Assignee</div>
        <SortHeader field="dueDate" label="Due Date" currentField={sort.field} direction={sort.direction} onSort={setSort} className="w-24 text-left" />
        <div className="w-16 text-xs font-semibold uppercase tracking-wider text-white/30 text-right">Active</div>
      </div>

      {/* Row count */}
      <div className="px-4 py-1.5 border-b border-white/5 bg-surface-0/30 flex-shrink-0">
        <span className="text-[11px] text-white/25">
          {sortedTasks.length.toLocaleString()} tasks · showing rows {startIndex + 1}–{Math.min(endIndex, sortedTasks.length)}
        </span>
      </div>

      {/* Virtual scroll container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden"
        style={{ overflowAnchor: 'none' }}
      >
        {/* Total height spacer */}
        <div style={{ height: totalHeight, position: 'relative' }}>
          {/* Rendered rows */}
          <div style={{ position: 'absolute', top: offsetY, left: 0, right: 0 }}>
            {visibleTasks.map((task, i) => {
              const assignee = USERS.find((u) => u.id === task.assigneeId)!;
              const overdue = isOverdue(task.dueDate);
              const today = isDueToday(task.dueDate);
              const dateLabel = formatDate(task.dueDate);
              const isEven = (startIndex + i) % 2 === 0;

              return (
                <div
                  key={task.id}
                  className={`flex items-center px-4 gap-4 border-b border-white/4 hover:bg-white/3 transition-colors group ${
                    isEven ? 'bg-transparent' : 'bg-white/[0.01]'
                  }`}
                  style={{ height: ROW_HEIGHT }}
                >
                  {/* Priority color dot */}
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}
                  />

                  {/* Title */}
                  <span className="flex-1 text-sm text-white/80 truncate font-medium">{task.title}</span>

                  {/* Priority */}
                  <div className="w-24">
                    <PriorityBadge priority={task.priority} />
                  </div>

                  {/* Status dropdown */}
                  <div className="w-32">
                    <StatusDropdown taskId={task.id} status={task.status} />
                  </div>

                  {/* Assignee */}
                  <div className="w-24 flex items-center gap-2">
                    <Avatar user={assignee} size="sm" />
                    <span className="text-xs text-white/40 truncate hidden lg:block">{assignee.name.split(' ')[0]}</span>
                  </div>

                  {/* Due date */}
                  <div className="w-24">
                    <span
                      className={`text-xs font-medium ${
                        overdue ? 'text-accent-red' : today ? 'text-accent-amber' : 'text-white/40'
                      }`}
                    >
                      {dateLabel}
                    </span>
                  </div>

                  {/* Collaborators */}
                  <div className="w-16 flex justify-end">
                    <CardCollaborators taskId={task.id} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

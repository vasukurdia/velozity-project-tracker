import React, { useMemo, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { PRIORITY_COLORS } from '../../utils';
import { USERS } from '../../data/generator';

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function daysBetween(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

const DAY_WIDTH = 36;
const ROW_HEIGHT = 44;
const LABEL_WIDTH = 220;

export const TimelineView: React.FC = () => {
  const { getFilteredTasks } = useAppStore();
  const tasks = getFilteredTasks();
  const scrollRef = useRef<HTMLDivElement>(null);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const monthStart = new Date(year, month, 1);

  const todayOffset = daysBetween(monthStart, today);

  const monthName = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const timelineTasks = useMemo(() => {
    return tasks.map((task) => {
      const due = new Date(task.dueDate + 'T00:00:00');
      const start = task.startDate ? new Date(task.startDate + 'T00:00:00') : due;

      // Clamp to month boundaries for display
      const clampedStart = new Date(Math.max(start.getTime(), monthStart.getTime()));
      const clampedEnd = new Date(Math.min(due.getTime(), new Date(year, month, daysInMonth).getTime()));

      const startDay = daysBetween(monthStart, clampedStart);
      const endDay = daysBetween(monthStart, clampedEnd);
      const duration = Math.max(1, endDay - startDay + 1);
      const isSingleDay = !task.startDate || duration <= 1;

      return { task, startDay, duration, isSingleDay };
    });
  }, [tasks, monthStart, daysInMonth, month, year]);

  const totalWidth = daysInMonth * DAY_WIDTH;

  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-white/30 text-sm">
        No tasks match the current filters
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full rounded-2xl border border-white/8 bg-surface-1/50 overflow-hidden">
      {/* Month header */}
      <div className="flex items-center px-4 py-3 border-b border-white/8 bg-surface-1 flex-shrink-0">
        <div style={{ width: LABEL_WIDTH }} className="flex-shrink-0">
          <span className="text-xs font-semibold uppercase tracking-wider text-white/30">Task</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <span className="text-sm font-semibold text-white/70">{monthName}</span>
        </div>
      </div>

      {/* Scrollable area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Fixed task labels */}
        <div style={{ width: LABEL_WIDTH }} className="flex-shrink-0 border-r border-white/8 overflow-y-auto overflow-x-hidden">
          {timelineTasks.map(({ task }) => {
            const assignee = USERS.find((u) => u.id === task.assigneeId)!;
            return (
              <div
                key={task.id}
                className="flex items-center gap-2 px-3 border-b border-white/4 hover:bg-white/3 transition-colors"
                style={{ height: ROW_HEIGHT }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}
                />
                <span className="text-xs text-white/70 truncate flex-1" title={task.title}>
                  {task.title}
                </span>
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                  style={{ backgroundColor: assignee.color + '30', color: assignee.color }}
                >
                  {assignee.initials}
                </div>
              </div>
            );
          })}
        </div>

        {/* Scrollable timeline */}
        <div ref={scrollRef} className="flex-1 overflow-auto">
          <div style={{ width: totalWidth + 32, minWidth: '100%' }}>
            {/* Day headers */}
            <div className="flex border-b border-white/8 sticky top-0 bg-surface-1 z-10" style={{ height: 36 }}>
              {Array.from({ length: daysInMonth }, (_, i) => {
                const d = i + 1;
                const date = new Date(year, month, d);
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                const isToday = i === todayOffset;
                return (
                  <div
                    key={i}
                    className={`flex-shrink-0 flex flex-col items-center justify-center text-[10px] border-r border-white/5 ${
                      isToday ? 'text-accent-blue font-bold' : isWeekend ? 'text-white/20' : 'text-white/35'
                    }`}
                    style={{ width: DAY_WIDTH }}
                  >
                    <span>{d}</span>
                    <span className="text-[8px] opacity-60">
                      {date.toLocaleDateString('en-US', { weekday: 'narrow' })}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Timeline rows */}
            <div className="relative">
              {/* Today line */}
              {todayOffset >= 0 && todayOffset < daysInMonth && (
                <div
                  className="absolute top-0 bottom-0 z-20 pointer-events-none"
                  style={{
                    left: todayOffset * DAY_WIDTH + DAY_WIDTH / 2,
                    width: 2,
                    background: 'linear-gradient(to bottom, #4f8ef7, #4f8ef744)',
                  }}
                >
                  <div className="w-2 h-2 rounded-full bg-accent-blue -translate-x-[3px] -translate-y-1 shadow-[0_0_6px_#4f8ef7]" />
                </div>
              )}

              {timelineTasks.map(({ task, startDay, duration, isSingleDay }) => {
                const color = PRIORITY_COLORS[task.priority];
                const left = Math.max(0, startDay) * DAY_WIDTH;
                const width = isSingleDay ? DAY_WIDTH - 4 : duration * DAY_WIDTH - 4;

                return (
                  <div
                    key={task.id}
                    className="relative border-b border-white/4 hover:bg-white/2 transition-colors"
                    style={{ height: ROW_HEIGHT }}
                  >
                    {/* Weekend shading */}
                    {Array.from({ length: daysInMonth }, (_, i) => {
                      const date = new Date(year, month, i + 1);
                      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                      return isWeekend ? (
                        <div
                          key={i}
                          className="absolute top-0 bottom-0 bg-white/[0.015]"
                          style={{ left: i * DAY_WIDTH, width: DAY_WIDTH }}
                        />
                      ) : null;
                    })}

                    {/* Task bar */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 rounded-md flex items-center px-2 group/bar cursor-pointer transition-all hover:brightness-125"
                      style={{
                        left: left + 2,
                        width: Math.max(width, 8),
                        height: 26,
                        backgroundColor: color + '30',
                        borderLeft: `3px solid ${color}`,
                      }}
                      title={`${task.title} · ${task.priority}`}
                    >
                      {!isSingleDay && width > 60 && (
                        <span className="text-[10px] font-medium truncate" style={{ color }}>
                          {task.title}
                        </span>
                      )}
                      {isSingleDay && (
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      )}
                    </div>

                    {/* Day grid lines */}
                    {Array.from({ length: daysInMonth }, (_, i) => (
                      <div
                        key={i}
                        className="absolute top-0 bottom-0 border-r border-white/[0.04]"
                        style={{ left: (i + 1) * DAY_WIDTH }}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Task, Status } from '../../types';
import { STATUS_COLORS } from '../../utils';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  status: Status;
  tasks: Task[];
  draggingId: string | null;
  dragOverColumn: string | null;
  dragOverTaskId: string | null;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onDragOver: (e: React.DragEvent, status: Status, taskId?: string) => void;
  onDrop: (e: React.DragEvent, status: Status, taskId?: string) => void;
  onPointerDown: (e: React.PointerEvent, taskId: string) => void;
  onDragLeaveColumn: () => void;
}

const COLUMN_ICONS: Record<Status, string> = {
  'To Do': '○',
  'In Progress': '◑',
  'In Review': '◕',
  'Done': '●',
};

const INITIAL_LIMIT = 40;

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  tasks,
  draggingId,
  dragOverColumn,
  dragOverTaskId,
  onDragStart,
  onDragOver,
  onDrop,
  onPointerDown,
  onDragLeaveColumn,
}) => {
  const isOver = dragOverColumn === status;
  const color = STATUS_COLORS[status];
  const [limit, setLimit] = useState(INITIAL_LIMIT);

  const visibleTasks = tasks.slice(0, limit);
  const hiddenCount = tasks.length - visibleTasks.length;

  return (
    <div
      className={`flex flex-col rounded-2xl border transition-all duration-150 min-h-[200px] ${
        isOver ? 'border-white/25 bg-white/[0.03]' : 'border-white/8 bg-surface-1/50'
      }`}
      data-column={status}
      onDragOver={(e) => onDragOver(e, status)}
      onDrop={(e) => onDrop(e, status)}
      onDragLeave={onDragLeaveColumn}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/6">
        <div className="flex items-center gap-2">
          <span style={{ color }} className="text-base leading-none">
            {COLUMN_ICONS[status]}
          </span>
          <h3 className="text-sm font-semibold text-white/80">{status}</h3>
        </div>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ color, backgroundColor: color + '20' }}
        >
          {tasks.length}
        </span>
      </div>

      {/* Cards */}
      <div
        className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-thin"
        data-column={status}
      >
        {tasks.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-10 text-center"
            data-column={status}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center mb-3 text-lg"
              style={{ backgroundColor: color + '15', color }}
            >
              {COLUMN_ICONS[status]}
            </div>
            <p className="text-xs text-white/30 font-medium">No tasks here</p>
            <p className="text-[11px] text-white/20 mt-1">Drop a card to add</p>
          </div>
        ) : (
          <>
            {visibleTasks.map((task) => (
              <React.Fragment key={task.id}>
                {dragOverTaskId === task.id && draggingId && (
                  <div
                    className="h-1 rounded-full mx-1"
                    style={{ backgroundColor: color + '80' }}
                  />
                )}
                <div
                  data-column={status}
                  data-taskid={task.id}
                  onDragOver={(e) => {
                    e.stopPropagation();
                    onDragOver(e, status, task.id);
                  }}
                  onDrop={(e) => {
                    e.stopPropagation();
                    onDrop(e, status, task.id);
                  }}
                >
                  <KanbanCard
                    task={task}
                    onDragStart={onDragStart}
                    onPointerDown={onPointerDown}
                    isDragging={draggingId === task.id}
                  />
                </div>
              </React.Fragment>
            ))}

            {hiddenCount > 0 && (
              <button
                onClick={() => setLimit((l) => l + INITIAL_LIMIT)}
                className="w-full py-2.5 rounded-xl border border-white/8 text-xs text-white/30 hover:text-white/60 hover:border-white/20 transition-all"
              >
                + {hiddenCount} more tasks
              </button>
            )}
          </>
        )}

        {isOver && !dragOverTaskId && (
          <div
            className="h-16 rounded-xl border-2 border-dashed flex items-center justify-center"
            style={{ borderColor: color + '50', backgroundColor: color + '08' }}
            data-column={status}
          >
            <span className="text-xs" style={{ color: color + '80' }}>
              Drop here
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
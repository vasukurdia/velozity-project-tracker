import React from 'react';
import { Task } from '../../types';
import { formatDate, isOverdue, isDueToday, PRIORITY_COLORS } from '../../utils';
import { PriorityBadge } from '../ui/PriorityBadge';
import { Avatar } from '../ui/Avatar';
import { CardCollaborators } from '../collaboration/CardCollaborators';
import { USERS } from '../../data/generator';

interface KanbanCardProps {
  task: Task;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onPointerDown: (e: React.PointerEvent, taskId: string) => void;
  isDragging?: boolean;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({
  task,
  onDragStart,
  onPointerDown,
  isDragging,
}) => {
  const assignee = USERS.find((u) => u.id === task.assigneeId)!;
  const overdue = isOverdue(task.dueDate);
  const today = isDueToday(task.dueDate);
  const dateLabel = formatDate(task.dueDate);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onPointerDown={(e) => onPointerDown(e, task.id)}
      data-taskid={task.id}
      className={`relative rounded-xl border bg-surface-2 p-3.5 cursor-grab active:cursor-grabbing select-none transition-all duration-200 hover:border-white/20 hover:shadow-lg hover:shadow-black/30 hover:-translate-y-0.5 border-white/8 ${
        isDragging ? 'opacity-40 scale-95' : 'opacity-100'
      }`}
      style={{ touchAction: 'none' }}
    >
      <div
        className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full"
        style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}
      />

      <div className="pl-2">
        <div className="flex items-start justify-between gap-2 mb-2">
          <p className="text-sm font-medium text-white/90 leading-snug line-clamp-2 flex-1">
            {task.title}
          </p>
          <CardCollaborators taskId={task.id} />
        </div>

        <div className="flex items-center justify-between mt-3">
          <PriorityBadge priority={task.priority} />
          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-medium ${
                overdue ? 'text-accent-red' : today ? 'text-accent-amber' : 'text-white/40'
              }`}
            >
              {dateLabel}
            </span>
            <Avatar user={assignee} size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
};
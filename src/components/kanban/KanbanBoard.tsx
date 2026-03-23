import React, { useState, useCallback, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { KanbanColumn } from './KanbanColumn';
import { Status } from '../../types';
import { ALL_STATUSES } from '../../utils';

const COLUMNS: Status[] = ['To Do', 'In Progress', 'In Review', 'Done'];

export const KanbanBoard: React.FC = () => {
  const { moveTask, getFilteredTasks } = useAppStore();
  const tasks = getFilteredTasks();

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);
  const originStatus = useRef<Status | null>(null);

  const handleDragStart = useCallback(
    (e: React.DragEvent, taskId: string) => {
      setDraggingId(taskId);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', taskId);
      const task = tasks.find((t) => t.id === taskId);
      if (task) originStatus.current = task.status;

      // Create ghost image
      const ghost = document.createElement('div');
      ghost.style.cssText = `
        position: fixed; top: -1000px; left: -1000px;
        background: #1a1a24; border: 1px solid rgba(255,255,255,0.15);
        border-radius: 12px; padding: 12px 16px; color: white;
        font-family: Outfit, sans-serif; font-size: 13px;
        max-width: 220px; box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        opacity: 0.95;
      `;
      ghost.textContent = task?.title || '';
      document.body.appendChild(ghost);
      e.dataTransfer.setDragImage(ghost, 110, 24);
      setTimeout(() => document.body.removeChild(ghost), 0);
    },
    [tasks]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, status: Status, taskId?: string) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setDragOverColumn(status);
      setDragOverTaskId(taskId || null);
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, status: Status, insertBeforeId?: string) => {
      e.preventDefault();
      const taskId = e.dataTransfer.getData('text/plain') || draggingId;
      if (!taskId) return;

      moveTask(taskId, status, insertBeforeId);
      setDraggingId(null);
      setDragOverColumn(null);
      setDragOverTaskId(null);
      originStatus.current = null;
    },
    [draggingId, moveTask]
  );

  const handleDragEnd = useCallback(() => {
    // Snap back if dropped outside valid zone
    setDraggingId(null);
    setDragOverColumn(null);
    setDragOverTaskId(null);
    originStatus.current = null;
  }, []);

  const tasksByStatus = useCallback(
    (status: Status) => tasks.filter((t) => t.status === status),
    [tasks]
  );

  // Check if any filters active and no tasks
  const totalFiltered = tasks.length;
  const _ = ALL_STATUSES; // just to use import

  return (
    <div
      className="grid gap-4 h-full"
      style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}
      onDragEnd={handleDragEnd}
    >
      {COLUMNS.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          tasks={tasksByStatus(status)}
          draggingId={draggingId}
          dragOverColumn={dragOverColumn}
          dragOverTaskId={dragOverTaskId}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragLeaveColumn={() => {
            setDragOverColumn(null);
            setDragOverTaskId(null);
          }}
        />
      ))}
      {totalFiltered === 0 && (
        <div className="col-span-4 flex items-center justify-center py-20 text-white/30 text-sm">
          No tasks match the current filters
        </div>
      )}
    </div>
  );
};

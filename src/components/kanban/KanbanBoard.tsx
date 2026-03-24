import React, { useState, useCallback, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { KanbanColumn } from './KanbanColumn';
import { Status } from '../../types';

const COLUMNS: Status[] = ['To Do', 'In Progress', 'In Review', 'Done'];

export const KanbanBoard: React.FC = () => {
  const { moveTask, getFilteredTasks } = useAppStore();
  const tasks = getFilteredTasks();

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);
  const originStatus = useRef<Status | null>(null);

  // Pointer-based drag state
  const pointerDragging = useRef(false);
  const pointerTaskId = useRef<string | null>(null);
  const ghostRef = useRef<HTMLDivElement | null>(null);

  // ── Mouse/HTML5 drag handlers ──────────────────────────────────────────

  const handleDragStart = useCallback(
    (e: React.DragEvent, taskId: string) => {
      setDraggingId(taskId);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', taskId);
      const task = tasks.find((t) => t.id === taskId);
      if (task) originStatus.current = task.status;

      const ghost = document.createElement('div');
      ghost.style.cssText = `
        position:fixed;top:-1000px;left:-1000px;
        background:#1a1a24;border:1px solid rgba(255,255,255,0.15);
        border-radius:12px;padding:12px 16px;color:white;
        font-family:Outfit,sans-serif;font-size:13px;
        max-width:220px;box-shadow:0 20px 40px rgba(0,0,0,0.5);
      `;
      ghost.textContent = task?.title || '';
      document.body.appendChild(ghost);
      e.dataTransfer.setDragImage(ghost, 110, 24);
      setTimeout(() => document.body.removeChild(ghost), 0);
    },
    [tasks]
  );

  const handleDragOver = useCallback((e: React.DragEvent, status: Status, taskId?: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(status);
    setDragOverTaskId(taskId || null);
  }, []);

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
    setDraggingId(null);
    setDragOverColumn(null);
    setDragOverTaskId(null);
    originStatus.current = null;
  }, []);

  // ── Pointer (touch) drag handlers ─────────────────────────────────────

  const getColumnAtPoint = useCallback((x: number, y: number): Status | null => {
    const els = document.elementsFromPoint(x, y);
    for (const el of els) {
      const col = (el as HTMLElement).dataset?.column as Status | undefined;
      if (col) return col;
    }
    return null;
  }, []);

  const getTaskAtPoint = useCallback((x: number, y: number): string | null => {
    const els = document.elementsFromPoint(x, y);
    for (const el of els) {
      const tid = (el as HTMLElement).dataset?.taskid;
      if (tid) return tid;
    }
    return null;
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, taskId: string) => {
      if (e.pointerType === 'mouse') return; // mouse uses HTML5 drag
      e.preventDefault();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      pointerDragging.current = true;
      pointerTaskId.current = taskId;

      const task = tasks.find((t) => t.id === taskId);
      if (task) originStatus.current = task.status;
      setDraggingId(taskId);

      // Create floating ghost
      const ghost = document.createElement('div');
      ghost.id = 'pointer-drag-ghost';
      ghost.style.cssText = `
        position:fixed;pointer-events:none;z-index:9999;
        background:#1a1a24;border:1px solid rgba(255,255,255,0.2);
        border-radius:12px;padding:12px 16px;color:white;
        font-family:Outfit,sans-serif;font-size:13px;
        max-width:220px;box-shadow:0 20px 40px rgba(0,0,0,0.6);
        opacity:0.92;transform:rotate(2deg);
        left:${e.clientX - 110}px;top:${e.clientY - 24}px;
      `;
      ghost.textContent = task?.title || '';
      document.body.appendChild(ghost);
      ghostRef.current = ghost;
    },
    [tasks]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!pointerDragging.current || e.pointerType === 'mouse') return;
      e.preventDefault();

      if (ghostRef.current) {
        ghostRef.current.style.left = `${e.clientX - 110}px`;
        ghostRef.current.style.top = `${e.clientY - 24}px`;
      }

      const col = getColumnAtPoint(e.clientX, e.clientY);
      const tid = getTaskAtPoint(e.clientX, e.clientY);
      setDragOverColumn(col);
      setDragOverTaskId(tid !== pointerTaskId.current ? tid : null);
    },
    [getColumnAtPoint, getTaskAtPoint]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!pointerDragging.current || e.pointerType === 'mouse') return;

      if (ghostRef.current) {
        document.body.removeChild(ghostRef.current);
        ghostRef.current = null;
      }

      const col = getColumnAtPoint(e.clientX, e.clientY);
      const tid = getTaskAtPoint(e.clientX, e.clientY);

      if (col && pointerTaskId.current) {
        const insertBefore = tid !== pointerTaskId.current ? tid ?? undefined : undefined;
        moveTask(pointerTaskId.current, col, insertBefore);
      }

      pointerDragging.current = false;
      pointerTaskId.current = null;
      originStatus.current = null;
      setDraggingId(null);
      setDragOverColumn(null);
      setDragOverTaskId(null);
    },
    [getColumnAtPoint, getTaskAtPoint, moveTask]
  );

  const handlePointerCancel = useCallback(() => {
    if (ghostRef.current) {
      document.body.removeChild(ghostRef.current);
      ghostRef.current = null;
    }
    pointerDragging.current = false;
    pointerTaskId.current = null;
    setDraggingId(null);
    setDragOverColumn(null);
    setDragOverTaskId(null);
    originStatus.current = null;
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div
      className="grid gap-4 h-full"
      style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}
      onDragEnd={handleDragEnd}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      {COLUMNS.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          tasks={tasks.filter((t) => t.status === status)}
          draggingId={draggingId}
          dragOverColumn={dragOverColumn}
          dragOverTaskId={dragOverTaskId}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onPointerDown={handlePointerDown}
          onDragLeaveColumn={() => {
            setDragOverColumn(null);
            setDragOverTaskId(null);
          }}
        />
      ))}
      {tasks.length === 0 && (
        <div className="col-span-4 flex items-center justify-center py-20 text-white/30 text-sm">
          No tasks match the current filters
        </div>
      )}
    </div>
  );
};
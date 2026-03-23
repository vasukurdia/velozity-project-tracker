import React, { useState, useRef, useEffect } from 'react';
import { Status } from '../../types';
import { STATUS_COLORS, ALL_STATUSES } from '../../utils';
import { useAppStore } from '../../store/useAppStore';

interface StatusDropdownProps {
  taskId: string;
  status: Status;
}

export const StatusDropdown: React.FC<StatusDropdownProps> = ({ taskId, status }) => {
  const [open, setOpen] = useState(false);
  const updateTaskStatus = useAppStore((s) => s.updateTaskStatus);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-all hover:opacity-80 border"
        style={{
          color: STATUS_COLORS[status],
          borderColor: STATUS_COLORS[status] + '44',
          backgroundColor: STATUS_COLORS[status] + '15',
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: STATUS_COLORS[status] }}
        />
        {status}
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 mt-1 w-36 rounded-lg border border-white/10 bg-surface-2 shadow-xl py-1 animate-slide-in">
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={(e) => {
                e.stopPropagation();
                updateTaskStatus(taskId, s);
                setOpen(false);
              }}
              className={`w-full text-left flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-white/5 transition-colors ${s === status ? 'opacity-50' : ''}`}
              style={{ color: STATUS_COLORS[s] }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[s] }} />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

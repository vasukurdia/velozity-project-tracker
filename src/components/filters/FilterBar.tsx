import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useHasActiveFilters } from '../../hooks/useURLSync';
import { ALL_STATUSES, ALL_PRIORITIES, STATUS_COLORS, PRIORITY_COLORS } from '../../utils';
import { USERS } from '../../data/generator';
import { Status, Priority } from '../../types';

interface MultiSelectProps {
  label: string;
  options: { value: string; label: string; color?: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ label, options, selected, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
          selected.length > 0
            ? 'border-accent-blue/50 bg-accent-blue/10 text-accent-blue'
            : 'border-white/10 bg-surface-2 text-white/60 hover:text-white hover:border-white/20'
        }`}
      >
        {label}
        {selected.length > 0 && (
          <span className="bg-accent-blue text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
            {selected.length}
          </span>
        )}
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 mt-1 w-44 rounded-xl border border-white/10 bg-surface-2 shadow-2xl py-1.5 animate-slide-in">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => toggle(opt.value)}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs hover:bg-white/5 transition-colors"
            >
              <span
                className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 transition-all ${
                  selected.includes(opt.value) ? 'bg-accent-blue border-accent-blue' : 'border-white/20'
                }`}
              >
                {selected.includes(opt.value) && (
                  <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 12 12">
                    <path d="M10 3L5 8.5 2 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                )}
              </span>
              {opt.color && (
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: opt.color }} />
              )}
              <span style={{ color: opt.color || 'rgba(255,255,255,0.7)' }}>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const FilterBar: React.FC = () => {
  const { filters, setFilters, clearFilters } = useAppStore();
  const hasActive = useHasActiveFilters();

  const statusOptions = ALL_STATUSES.map((s) => ({ value: s, label: s, color: STATUS_COLORS[s] }));
  const priorityOptions = ALL_PRIORITIES.map((p) => ({ value: p, label: p, color: PRIORITY_COLORS[p] }));
  const assigneeOptions = USERS.map((u) => ({ value: u.id, label: u.name, color: u.color }));

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1.5 text-xs text-white/30 mr-1">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M7 8h10M11 12h2" />
        </svg>
        Filters
      </div>

      <MultiSelect
        label="Status"
        options={statusOptions}
        selected={filters.statuses}
        onChange={(v) => setFilters({ statuses: v as Status[] })}
      />
      <MultiSelect
        label="Priority"
        options={priorityOptions}
        selected={filters.priorities}
        onChange={(v) => setFilters({ priorities: v as Priority[] })}
      />
      <MultiSelect
        label="Assignee"
        options={assigneeOptions}
        selected={filters.assignees}
        onChange={(v) => setFilters({ assignees: v })}
      />

      <div className="flex items-center gap-1.5">
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => setFilters({ dateFrom: e.target.value })}
          className="bg-surface-2 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white/70 focus:outline-none focus:border-accent-blue/50 [color-scheme:dark]"
          placeholder="From"
        />
        <span className="text-white/20 text-xs">→</span>
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => setFilters({ dateTo: e.target.value })}
          className="bg-surface-2 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white/70 focus:outline-none focus:border-accent-blue/50 [color-scheme:dark]"
          placeholder="To"
        />
      </div>

      {hasActive && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-accent-red/80 border border-accent-red/20 hover:bg-accent-red/10 transition-all animate-fade-in"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear all
        </button>
      )}
    </div>
  );
};

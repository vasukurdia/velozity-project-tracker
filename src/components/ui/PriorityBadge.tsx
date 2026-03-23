import React from 'react';
import { Priority } from '../../types';
import { PRIORITY_COLORS, PRIORITY_BG } from '../../utils';

interface PriorityBadgeProps {
  priority: Priority;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase"
      style={{
        color: PRIORITY_COLORS[priority],
        backgroundColor: PRIORITY_BG[priority],
      }}
    >
      {priority}
    </span>
  );
};

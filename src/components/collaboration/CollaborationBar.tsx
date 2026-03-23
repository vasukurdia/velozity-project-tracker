import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Avatar } from '../ui/Avatar';

export const CollaborationBar: React.FC = () => {
  const collaborators = useAppStore((s) => s.collaborators);
  const active = collaborators.filter((c) => c.taskId !== null);

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center">
        {active.slice(0, 4).map((c, i) => (
          <div key={c.user.id} style={{ marginLeft: i === 0 ? 0 : -8, zIndex: 4 - i }} className="relative">
            <Avatar user={c.user} size="sm" animated key={`${c.user.id}-${c.taskId}`} />
            {c.action === 'editing' && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-accent-amber border border-surface-0" />
            )}
          </div>
        ))}
      </div>
      <span className="text-xs text-white/40">
        {active.length} {active.length === 1 ? 'person' : 'people'} viewing
      </span>
    </div>
  );
};

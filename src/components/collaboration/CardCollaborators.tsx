import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Avatar } from '../ui/Avatar';
import { CollaboratorPresence } from '../../types';

interface CardCollaboratorsProps {
  taskId: string;
}

export const CardCollaborators: React.FC<CardCollaboratorsProps> = ({ taskId }) => {
  const collaborators = useAppStore((s) => s.collaborators);
  
  // Filter outside the selector so selector returns stable reference
  const active = collaborators.filter((c) => c.taskId === taskId);

  if (active.length === 0) return null;

  const visible = active.slice(0, 2);
  const overflow = active.length - visible.length;

  return (
    <div className="flex items-center">
      {visible.map((c: CollaboratorPresence, i: number) => (
        <div
          key={c.user.id}
          style={{ marginLeft: i === 0 ? 0 : -6, zIndex: 2 - i }}
          className="animate-avatar-move"
        >
          <Avatar user={c.user} size="sm" />
        </div>
      ))}
      {overflow > 0 && (
        <div className="w-5 h-5 rounded-full bg-surface-3 border border-white/20 flex items-center justify-center text-[9px] text-white/60 font-semibold ml-[-6px]">
          +{overflow}
        </div>
      )}
    </div>
  );
};
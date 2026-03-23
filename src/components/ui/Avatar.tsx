import React from 'react';
import { User } from '../../types';

interface AvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animated?: boolean;
}

const SIZE_MAP = {
  sm: 'w-5 h-5 text-[10px]',
  md: 'w-7 h-7 text-xs',
  lg: 'w-9 h-9 text-sm',
};

export const Avatar: React.FC<AvatarProps> = ({ user, size = 'md', className = '', animated }) => {
  return (
    <div
      className={`${SIZE_MAP[size]} rounded-full flex items-center justify-center font-semibold flex-shrink-0 border-2 border-surface-1 ${animated ? 'animate-avatar-move' : ''} ${className}`}
      style={{ backgroundColor: user.color + '33', color: user.color, borderColor: user.color + '55' }}
      title={user.name}
    >
      {user.initials}
    </div>
  );
};

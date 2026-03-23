import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { USERS } from '../data/generator';
import { CollaboratorPresence } from '../types';

const COLLAB_USERS = USERS.slice(0, 4);

export function useCollaboration() {
  const { tasks, setCollaborators } = useAppStore();

  useEffect(() => {
    if (tasks.length === 0) return;

    // Initial placement
    const initial: CollaboratorPresence[] = COLLAB_USERS.map((user) => ({
      user,
      taskId: tasks[Math.floor(Math.random() * Math.min(tasks.length, 20))].id,
      action: Math.random() > 0.5 ? 'viewing' : 'editing',
    }));
    setCollaborators(initial);

    const interval = setInterval(() => {
      setCollaborators(
        COLLAB_USERS.map((user) => ({
          user,
          taskId: tasks[Math.floor(Math.random() * Math.min(tasks.length, 50))].id,
          action: (Math.random() > 0.5 ? 'viewing' : 'editing') as 'viewing' | 'editing',
        }))
      );
    }, 3500);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks.length]);
}

import { create } from 'zustand';
import { Task, Status, FilterState, SortState, ViewMode, CollaboratorPresence } from '../types';
import { INITIAL_TASKS, USERS } from '../data/generator';

interface AppState {
  tasks: Task[];
  view: ViewMode;
  filters: FilterState;
  sort: SortState;
  collaborators: CollaboratorPresence[];

  // Actions
  setView: (view: ViewMode) => void;
  updateTaskStatus: (taskId: string, status: Status) => void;
  moveTask: (taskId: string, newStatus: Status, insertBeforeId?: string) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  clearFilters: () => void;
  setSort: (field: SortState['field']) => void;
  setCollaborators: (collaborators: CollaboratorPresence[]) => void;

  // Derived
  getFilteredTasks: () => Task[];
}

const DEFAULT_FILTERS: FilterState = {
  statuses: [],
  priorities: [],
  assignees: [],
  dateFrom: '',
  dateTo: '',
};

export const useAppStore = create<AppState>((set, get) => ({
  tasks: INITIAL_TASKS,
  view: 'kanban',
  filters: DEFAULT_FILTERS,
  sort: { field: 'dueDate', direction: 'asc' },
  collaborators: USERS.slice(0, 3).map((u) => ({
    user: u,
    taskId: null,
    action: 'viewing' as const,
  })),

  setView: (view) => set({ view }),

  updateTaskStatus: (taskId, status) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
    })),

  moveTask: (taskId, newStatus, insertBeforeId) =>
    set((state) => {
      const task = state.tasks.find((t) => t.id === taskId);
      if (!task) return state;

      const updatedTask = { ...task, status: newStatus };
      const withoutTask = state.tasks.filter((t) => t.id !== taskId);

      if (!insertBeforeId) {
        // Append to end of column
        return { tasks: [...withoutTask, updatedTask] };
      }

      const insertIndex = withoutTask.findIndex((t) => t.id === insertBeforeId);
      if (insertIndex === -1) {
        return { tasks: [...withoutTask, updatedTask] };
      }

      const newTasks = [
        ...withoutTask.slice(0, insertIndex),
        updatedTask,
        ...withoutTask.slice(insertIndex),
      ];
      return { tasks: newTasks };
    }),

  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),

  clearFilters: () => set({ filters: DEFAULT_FILTERS }),

  setSort: (field) =>
    set((state) => ({
      sort: {
        field,
        direction:
          state.sort.field === field && state.sort.direction === 'asc' ? 'desc' : 'asc',
      },
    })),

  setCollaborators: (collaborators) => set({ collaborators }),

  getFilteredTasks: () => {
    const { tasks, filters } = get();
    return tasks.filter((task) => {
      if (filters.statuses.length > 0 && !filters.statuses.includes(task.status)) return false;
      if (filters.priorities.length > 0 && !filters.priorities.includes(task.priority)) return false;
      if (filters.assignees.length > 0 && !filters.assignees.includes(task.assigneeId)) return false;
      if (filters.dateFrom && task.dueDate < filters.dateFrom) return false;
      if (filters.dateTo && task.dueDate > filters.dateTo) return false;
      return true;
    });
  },
}));

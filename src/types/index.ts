export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';
export type Status = 'To Do' | 'In Progress' | 'In Review' | 'Done';
export type ViewMode = 'kanban' | 'list' | 'timeline';
export type SortField = 'title' | 'priority' | 'dueDate';
export type SortDirection = 'asc' | 'desc';

export interface User {
  id: string;
  name: string;
  color: string;
  initials: string;
}

export interface Task {
  id: string;
  title: string;
  status: Status;
  priority: Priority;
  assigneeId: string;
  startDate: string | null;
  dueDate: string;
  description?: string;
}

export interface CollaboratorPresence {
  user: User;
  taskId: string | null;
  action: 'viewing' | 'editing';
}

export interface FilterState {
  statuses: Status[];
  priorities: Priority[];
  assignees: string[];
  dateFrom: string;
  dateTo: string;
}

export interface SortState {
  field: SortField;
  direction: SortDirection;
}

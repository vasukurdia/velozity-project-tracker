import { Task, Priority, Status, User } from '../types';

export const USERS: User[] = [
  { id: 'u1', name: 'Alex Chen', color: '#4f8ef7', initials: 'AC' },
  { id: 'u2', name: 'Maya Patel', color: '#9b6dff', initials: 'MP' },
  { id: 'u3', name: 'Jordan Kim', color: '#22d3ee', initials: 'JK' },
  { id: 'u4', name: 'Sam Rivera', color: '#34d399', initials: 'SR' },
  { id: 'u5', name: 'Riley Okonkwo', color: '#fbbf24', initials: 'RO' },
  { id: 'u6', name: 'Casey Liu', color: '#f87171', initials: 'CL' },
];

const PRIORITIES: Priority[] = ['Critical', 'High', 'Medium', 'Low'];
const STATUSES: Status[] = ['To Do', 'In Progress', 'In Review', 'Done'];

const TASK_PREFIXES = [
  'Implement', 'Refactor', 'Fix', 'Design', 'Review', 'Test', 'Document',
  'Optimize', 'Deploy', 'Migrate', 'Integrate', 'Update', 'Create', 'Build', 'Audit',
];

const TASK_SUBJECTS = [
  'authentication flow', 'dashboard layout', 'API endpoints', 'database schema',
  'user onboarding', 'payment gateway', 'search functionality', 'notification system',
  'data export feature', 'mobile responsiveness', 'performance metrics', 'error handling',
  'caching layer', 'CI/CD pipeline', 'unit test coverage', 'accessibility audit',
  'dark mode support', 'email templates', 'analytics integration', 'security patches',
  'file upload service', 'real-time updates', 'role-based permissions', 'audit logging',
  'API rate limiting', 'data visualization', 'filter components', 'drag-and-drop UI',
  'bulk action support', 'CSV import/export', 'webhook handlers', 'OAuth integration',
  'password reset flow', 'session management', 'localization strings', 'SEO metadata',
  'image optimization', 'lazy loading', 'code splitting', 'bundle size reduction',
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function generateTasks(count: number = 500): Task[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tasks: Task[] = [];

  for (let i = 0; i < count; i++) {
    const prefix = randomItem(TASK_PREFIXES);
    const subject = randomItem(TASK_SUBJECTS);
    const title = `${prefix} ${subject}`;

    const status = randomItem(STATUSES);
    const priority = randomItem(PRIORITIES);
    const assigneeId = randomItem(USERS).id;

    let dueDaysOffset: number;
    const roll = Math.random();
    if (roll < 0.15) {
      dueDaysOffset = -randomInt(8, 30);
    } else if (roll < 0.25) {
      dueDaysOffset = -randomInt(1, 7);
    } else if (roll < 0.35) {
      dueDaysOffset = 0;
    } else {
      dueDaysOffset = randomInt(1, 30);
    }

    const dueDate = addDays(today, dueDaysOffset);

    let startDate: string | null = null;
    if (Math.random() > 0.2) {
      const startDaysBack = randomInt(1, 20);
      startDate = toISODate(addDays(dueDate, -startDaysBack));
    }

    tasks.push({
      id: `task-${i + 1}`,
      title: i < TASK_SUBJECTS.length ? `${prefix} ${TASK_SUBJECTS[i % TASK_SUBJECTS.length]}` : title,
      status,
      priority,
      assigneeId,
      startDate,
      dueDate: toISODate(dueDate),
    });
  }

  return tasks;
}

export const INITIAL_TASKS = generateTasks(500);

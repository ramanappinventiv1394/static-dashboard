import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  ChartNoAxesColumnIncreasing,
  ChartNoAxesCombined,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  CircleAlert,
  CircleCheckBig,
  Ellipsis,
  LayoutDashboard,
  ListChecks,
  ListTodo,
  MapPin,
  PanelsTopLeft,
  Search,
  Settings2,
  Sparkles,
  UserRoundPlus,
  UsersRound,
  createIcons,
} from 'lucide';
import { z } from 'zod';
import './styles.css';

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  username: z.string(),
  email: z.string().email(),
  address: z.object({ city: z.string() }),
  company: z.object({ name: z.string() }),
});

const TodoSchema = z.object({
  id: z.number(),
  userId: z.number(),
  title: z.string(),
  completed: z.boolean(),
});

const UsersSchema = z.array(UserSchema);
const TodosSchema = z.array(TodoSchema);
type TeamMember = z.infer<typeof UserSchema>;
type TeamTask = z.infer<typeof TodoSchema>;
type TaskStatus = 'active' | 'done';

const API_URL = 'https://jsonplaceholder.typicode.com';
const dashboardIcons = {
  ArrowRight,
  ArrowUpRight,
  Bell,
  ChartNoAxesColumnIncreasing,
  ChartNoAxesCombined,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  CircleAlert,
  CircleCheckBig,
  Ellipsis,
  LayoutDashboard,
  ListChecks,
  ListTodo,
  MapPin,
  PanelsTopLeft,
  Search,
  Settings2,
  Sparkles,
  UserRoundPlus,
  UsersRound,
};
const avatarColors = ['coral', 'sage', 'blue', 'gold', 'rose', 'teal'] as const;
let members: TeamMember[] = [];
let tasks: TeamTask[] = [];

function getElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing required page element: #${id}`);
  return element as T;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[character] ?? character;
  });
}

async function fetchValidated<T>(path: string, schema: z.ZodType<T>): Promise<T> {
  const response = await fetch(`${API_URL}${path}`);
  if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
  const payload: unknown = await response.json();
  return schema.parse(payload);
}

function setText(id: string, value: string | number): void {
  getElement(id).textContent = String(value);
}

function setBar(id: string, count: number, total: number): void {
  const bar = getElement<HTMLElement>(id);
  bar.style.width = `${total === 0 ? 0 : (count / total) * 100}%`;
}

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();
}

function tasksFor(memberId: number): TeamTask[] {
  return tasks.filter((task) => task.userId === memberId);
}

function completionRate(memberId: number): number {
  const memberTasks = tasksFor(memberId);
  if (memberTasks.length === 0) return 0;
  return memberTasks.filter((task) => task.completed).length / memberTasks.length;
}

function renderSummary(): void {
  const completed = tasks.filter((task) => task.completed).length;
  const open = tasks.length - completed;
  const inProgress = tasks.filter((task) => !task.completed && task.id % 3 === 0).length;
  const toDo = open - inProgress;
  const rate = tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100);

  setText('member-total', members.length);
  setText('open-total', open);
  setText('complete-total', `${completed} done`);
  setText('completion-rate', rate);
  setText('completed-count', completed);
  setText('progress-count', inProgress);
  setText('todo-count', toDo);
  setText('task-total-caption', `${tasks.length} tasks across ${members.length} people`);
  setText('nav-team-count', members.length);
  setText('nudge-count', open);

  getElement<HTMLElement>('completion-bar').style.width = `${rate}%`;
  setBar('completed-fill', completed, tasks.length);
  setBar('progress-fill', inProgress, tasks.length);
  setBar('todo-fill', toDo, tasks.length);
  getElement('metrics').setAttribute('aria-busy', 'false');
  getElement('completion-breakdown').setAttribute('aria-busy', 'false');
  renderNudges();
}

function renderNudges(): void {
  const openTasks = tasks.filter((task) => !task.completed).slice(0, 3);
  const list = getElement<HTMLUListElement>('nudge-list');
  list.setAttribute('aria-busy', 'false');

  if (openTasks.length === 0) {
    list.innerHTML = '<li class="nudge-placeholder">Everything is wrapped up. Nice work.</li>';
    return;
  }

  list.innerHTML = openTasks.map((task, index) => {
    const owner = members.find((member) => member.id === task.userId);
    const name = owner ? escapeHtml(owner.name.split(' ')[0] ?? owner.name) : 'Unassigned';
    const title = escapeHtml(task.title);
    return `<li class="nudge-item"><span class="nudge-marker marker-${index + 1}" aria-hidden="true"></span><span class="nudge-copy"><strong>${title}</strong><small>With ${name}</small></span><i data-lucide="arrow-up-right" aria-hidden="true"></i></li>`;
  }).join('');
  createIcons({ icons: dashboardIcons });
}

function memberStatus(member: TeamMember): TaskStatus {
  return tasksFor(member.id).some((task) => !task.completed) ? 'active' : 'done';
}

function memberRow(member: TeamMember, index: number): string {
  const memberTasks = tasksFor(member.id);
  const completed = memberTasks.filter((task) => task.completed).length;
  const total = memberTasks.length;
  const rate = total === 0 ? 0 : Math.round((completed / total) * 100);
  const status = memberStatus(member);
  const color = avatarColors[index % avatarColors.length] ?? 'coral';
  const name = escapeHtml(member.name);
  const company = escapeHtml(member.company.name);
  const city = escapeHtml(member.address.city);

  return `<tr data-status="${status}">
    <td><div class="person-cell"><span class="person-avatar avatar-${color}" aria-hidden="true">${escapeHtml(initials(member.name))}</span><span class="person-copy"><strong>${name}</strong><small>${escapeHtml(member.email)}</small></span></div></td>
    <td class="company-cell">${company}</td>
    <td class="location-cell"><i data-lucide="map-pin" aria-hidden="true"></i>${city}</td>
    <td><div class="task-progress-cell"><span class="mini-progress" role="progressbar" aria-label="Tasks completed" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${completed}"><span style="width: ${rate}%"></span></span><span>${completed}/${total}</span></div></td>
    <td><span class="status-pill status-${status}"><span aria-hidden="true"></span>${status === 'active' ? 'In progress' : 'All caught up'}</span></td>
  </tr>`;
}

function renderDirectory(): void {
  const query = getElement<HTMLInputElement>('team-search').value.trim().toLowerCase();
  const filter = getElement<HTMLSelectElement>('team-filter').value;
  const matchingMembers = members.filter((member) => {
    const matchesQuery = [member.name, member.email, member.company.name, member.address.city]
      .some((value) => value.toLowerCase().includes(query));
    const progress = completionRate(member.id);
    const matchesProgress = filter === 'all'
      || (filter === 'half-done' && progress >= 0.5)
      || (filter === 'under-half' && progress < 0.5);
    return matchesQuery && matchesProgress;
  });

  const body = getElement<HTMLTableSectionElement>('team-table-body');
  body.innerHTML = matchingMembers.length > 0
    ? matchingMembers.map(memberRow).join('')
    : '<tr><td class="table-loading" colspan="5">No teammates match that search.</td></tr>';

  setText('directory-count', `Showing ${matchingMembers.length} of ${members.length} people`);
  createIcons({ icons: dashboardIcons });
}

async function loadDashboard(): Promise<void> {
  const errorBanner = getElement<HTMLElement>('load-error');
  const retryButton = getElement<HTMLButtonElement>('retry-button');
  const tableBody = getElement<HTMLTableSectionElement>('team-table-body');
  const nudgeList = getElement<HTMLUListElement>('nudge-list');
  const metrics = getElement('metrics');

  errorBanner.hidden = true;
  retryButton.disabled = true;
  metrics.setAttribute('aria-busy', 'true');
  tableBody.innerHTML = '<tr><td class="table-loading" colspan="5">Getting the team together…</td></tr>';
  nudgeList.setAttribute('aria-busy', 'true');
  nudgeList.innerHTML = '<li class="nudge-placeholder">Gathering your team\'s tasks…</li>';

  try {
    [members, tasks] = await Promise.all([
      fetchValidated('/users', UsersSchema),
      fetchValidated('/todos', TodosSchema),
    ]);
    renderSummary();
    renderDirectory();
  } catch (error) {
    console.error('Unable to load dashboard data:', error);
    errorBanner.hidden = false;
    metrics.setAttribute('aria-busy', 'false');
    nudgeList.setAttribute('aria-busy', 'false');
    tableBody.innerHTML = '<tr><td class="table-loading" colspan="5">Directory data is unavailable.</td></tr>';
    nudgeList.innerHTML = '<li class="nudge-placeholder">Task data is unavailable.</li>';
  } finally {
    retryButton.disabled = false;
  }
}

getElement<HTMLInputElement>('team-search').addEventListener('input', renderDirectory);
getElement<HTMLSelectElement>('team-filter').addEventListener('change', renderDirectory);
getElement<HTMLButtonElement>('retry-button').addEventListener('click', () => void loadDashboard());

const today = new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric' });
setText('today-label', today.format(new Date()));
createIcons({ icons: dashboardIcons });
void loadDashboard();
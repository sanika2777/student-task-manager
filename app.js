// Student Task Tracker - app.js

// Initial state and LocalStorage key
const STORAGE_KEY = 'student_task_tracker_items';

// Load tasks from LocalStorage or seed with starter tasks
function getSavedTasks() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse tasks from localStorage', e);
      return [];
    }
  }

  // Sample tasks for initial student experience
  const sampleTasks = [
    {
      id: 'sample-1',
      title: 'Review Chapter 4 calculus practice problems',
      subject: 'Mathematics',
      dueDate: getSampleDueDate(2),
      priority: 'high',
      completed: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'sample-2',
      title: 'Read assigned literature essay pages 45-70',
      subject: 'English Lit',
      dueDate: getSampleDueDate(4),
      priority: 'medium',
      completed: true,
      createdAt: new Date().toISOString()
    }
  ];
  saveTasks(sampleTasks);
  return sampleTasks;
}

// Helper to generate sample due dates (days from today)
function getSampleDueDate(daysAhead) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date.toISOString().split('T')[0];
}

// Save tasks to LocalStorage
function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// App State
let tasks = getSavedTasks();
let currentFilter = 'all';

// DOM Elements
const taskForm = document.getElementById('task-form');
const taskTitleInput = document.getElementById('task-title');
const taskSubjectInput = document.getElementById('task-subject');
const taskDueDateInput = document.getElementById('task-due-date');
const taskPriorityInput = document.getElementById('task-priority');
const taskListElement = document.getElementById('task-list');
const emptyStateElement = document.getElementById('empty-state');
const filterButtons = document.querySelectorAll('.filter-btn');

const statTotal = document.getElementById('stat-total');
const statPending = document.getElementById('stat-pending');
const statCompleted = document.getElementById('stat-completed');

// Format date nicely (e.g. "Oct 18, 2026")
function formatDate(dateString) {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

// Update statistics counters
function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;

  statTotal.textContent = total;
  statPending.textContent = pending;
  statCompleted.textContent = completed;
}

// Render the task list based on the active filter
function renderTasks() {
  updateStats();

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (currentFilter === 'pending') return !task.completed;
    if (currentFilter === 'completed') return task.completed;
    return true; // 'all'
  });

  // Handle empty state
  if (filteredTasks.length === 0) {
    taskListElement.innerHTML = '';
    emptyStateElement.style.display = 'block';
    return;
  }

  emptyStateElement.style.display = 'none';

  // Build task items
  taskListElement.innerHTML = filteredTasks
    .map(task => {
      const formattedDate = formatDate(task.dueDate);
      const subjectTag = task.subject
        ? `<span class="meta-subject">${escapeHtml(task.subject)}</span>`
        : '';
      const dateTag = formattedDate
        ? `<span class="meta-date">📅 ${escapeHtml(formattedDate)}</span>`
        : '';
      const priorityClass = `priority-${task.priority || 'medium'}`;

      return `
        <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
          <div class="task-left">
            <input 
              type="checkbox" 
              class="task-checkbox" 
              aria-label="Mark task complete"
              ${task.completed ? 'checked' : ''} 
              onchange="toggleTaskStatus('${task.id}')"
            />
            <div class="task-details">
              <span class="task-title-text">${escapeHtml(task.title)}</span>
              <div class="task-meta">
                ${subjectTag}
                ${dateTag}
                <span class="meta-priority ${priorityClass}">
                  ${escapeHtml(task.priority || 'medium')}
                </span>
              </div>
            </div>
          </div>
          <div class="task-right">
            <button 
              class="btn-delete" 
              title="Delete Task" 
              aria-label="Delete task" 
              onclick="deleteTask('${task.id}')"
            >
              🗑️
            </button>
          </div>
        </li>
      `;
    })
    .join('');
}

// Sanitize helper to prevent XSS
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Add a new task
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const title = taskTitleInput.value.trim();
  if (!title) return;

  const newTask = {
    id: 'task_' + Date.now(),
    title: title,
    subject: taskSubjectInput.value.trim(),
    dueDate: taskDueDateInput.value,
    priority: taskPriorityInput.value,
    completed: false,
    createdAt: new Date().toISOString()
  };

  tasks.unshift(newTask);
  saveTasks(tasks);
  renderTasks();

  // Reset form
  taskForm.reset();
  taskTitleInput.focus();
});

// Toggle task completed state
window.toggleTaskStatus = function(taskId) {
  tasks = tasks.map(task => {
    if (task.id === taskId) {
      return { ...task, completed: !task.completed };
    }
    return task;
  });
  saveTasks(tasks);
  renderTasks();
};

// Delete a task
window.deleteTask = function(taskId) {
  tasks = tasks.filter(task => task.id !== taskId);
  saveTasks(tasks);
  renderTasks();
};

// Filter tab switching
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

// Initial Render
renderTasks();

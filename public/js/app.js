// Global variables
let tasks = [];
let sprints = [];
let currentSprint = null;

// DOM elements
const kanbanBoard = document.getElementById('kanban-board');
const taskModal = document.getElementById('task-modal');
const sprintModal = document.getElementById('sprint-modal');
const taskForm = document.getElementById('task-form');
const sprintForm = document.getElementById('sprint-form');

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    await loadTasks();
    await loadSprints();
    await loadConfig();
    setupEventListeners();
    renderKanbanBoard();
    updateSprintInfo();
});

// API functions
async function fetchAPI(endpoint, options = {}) {
    try {
        const response = await fetch(endpoint, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return response.status === 204 ? null : await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

async function loadTasks() {
    try {
        tasks = await fetchAPI('/api/tasks');
    } catch (error) {
        console.error('Failed to load tasks:', error);
        tasks = [];
    }
}

async function loadSprints() {
    try {
        sprints = await fetchAPI('/api/sprints');
        currentSprint = sprints.find(sprint => sprint.status === 'active') || null;
    } catch (error) {
        console.error('Failed to load sprints:', error);
        sprints = [];
    }
}

async function loadConfig() {
    try {
        const config = await fetchAPI('/api/config');
        return config;
    } catch (error) {
        console.error('Failed to load config:', error);
        return null;
    }
}

async function createTask(taskData) {
    try {
        const newTask = await fetchAPI('/api/tasks', {
            method: 'POST',
            body: JSON.stringify(taskData)
        });
        tasks.push(newTask);
        return newTask;
    } catch (error) {
        console.error('Failed to create task:', error);
        throw error;
    }
}

async function updateTask(taskId, updates) {
    try {
        const updatedTask = await fetchAPI(`/api/tasks/${taskId}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
        
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            tasks[taskIndex] = updatedTask;
        }
        
        return updatedTask;
    } catch (error) {
        console.error('Failed to update task:', error);
        throw error;
    }
}

async function deleteTask(taskId) {
    try {
        await fetchAPI(`/api/tasks/${taskId}`, { method: 'DELETE' });
        tasks = tasks.filter(task => task.id !== taskId);
    } catch (error) {
        console.error('Failed to delete task:', error);
        throw error;
    }
}

async function createSprint(sprintData) {
    try {
        const newSprint = await fetchAPI('/api/sprints', {
            method: 'POST',
            body: JSON.stringify(sprintData)
        });
        sprints.push(newSprint);
        return newSprint;
    } catch (error) {
        console.error('Failed to create sprint:', error);
        throw error;
    }
}

// Event listeners
function setupEventListeners() {
    // Task modal
    document.getElementById('add-task-btn').addEventListener('click', () => openTaskModal());
    document.getElementById('close-modal').addEventListener('click', () => closeTaskModal());
    document.getElementById('cancel-task').addEventListener('click', () => closeTaskModal());
    
    // Sprint modal
    document.getElementById('manage-sprints-btn').addEventListener('click', () => openSprintModal());
    document.getElementById('close-sprint-modal').addEventListener('click', () => closeSprintModal());
    
    // Forms
    taskForm.addEventListener('submit', handleTaskFormSubmit);
    sprintForm.addEventListener('submit', handleSprintFormSubmit);
    
    // Close modals when clicking outside
    taskModal.addEventListener('click', (e) => {
        if (e.target === taskModal) closeTaskModal();
    });
    
    sprintModal.addEventListener('click', (e) => {
        if (e.target === sprintModal) closeSprintModal();
    });
}

// Modal functions
function openTaskModal(task = null) {
    const modalTitle = document.getElementById('modal-title');
    
    if (task) {
        modalTitle.textContent = 'Edit Task';
        populateTaskForm(task);
    } else {
        modalTitle.textContent = 'Add New Task';
        taskForm.reset();
    }
    
    populateSprintDropdown();
    taskModal.classList.add('active');
}

function closeTaskModal() {
    taskModal.classList.remove('active');
    taskForm.reset();
}

function openSprintModal() {
    renderSprintList();
    sprintModal.classList.add('active');
}

function closeSprintModal() {
    sprintModal.classList.remove('active');
    sprintForm.reset();
}

function populateTaskForm(task) {
    document.getElementById('task-title').value = task.title;
    document.getElementById('task-description').value = task.description;
    document.getElementById('task-priority').value = task.priority;
    document.getElementById('task-assignee').value = task.assignee;
    document.getElementById('task-sprint').value = task.sprintId || '';
    taskForm.dataset.taskId = task.id;
}

function populateSprintDropdown() {
    const sprintSelect = document.getElementById('task-sprint');
    sprintSelect.innerHTML = '<option value="">No Sprint</option>';
    
    sprints.forEach(sprint => {
        const option = document.createElement('option');
        option.value = sprint.id;
        option.textContent = sprint.name;
        sprintSelect.appendChild(option);
    });
}

// Form handlers
async function handleTaskFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(taskForm);
    const taskData = {
        title: formData.get('title'),
        description: formData.get('description'),
        priority: formData.get('priority'),
        assignee: formData.get('assignee'),
        sprintId: formData.get('sprintId') || null
    };
    
    try {
        const taskId = taskForm.dataset.taskId;
        
        if (taskId) {
            await updateTask(taskId, taskData);
        } else {
            await createTask(taskData);
        }
        
        renderKanbanBoard();
        closeTaskModal();
    } catch (error) {
        alert('Failed to save task. Please try again.');
    }
}

async function handleSprintFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(sprintForm);
    const sprintData = {
        name: formData.get('name'),
        description: formData.get('description'),
        startDate: formData.get('startDate'),
        endDate: formData.get('endDate'),
        status: 'planning'
    };
    
    try {
        await createSprint(sprintData);
        renderSprintList();
        sprintForm.reset();
    } catch (error) {
        alert('Failed to create sprint. Please try again.');
    }
}

// Render functions
function renderKanbanBoard() {
    const columns = ['todo', 'in-progress', 'review', 'done'];
    
    columns.forEach(status => {
        const columnTasks = tasks.filter(task => task.status === status);
        const columnElement = document.getElementById(`${status}-tasks`);
        const countElement = document.getElementById(`${status}-count`);
        
        columnElement.innerHTML = '';
        countElement.textContent = columnTasks.length;
        
        columnTasks.forEach(task => {
            const taskElement = createTaskElement(task);
            columnElement.appendChild(taskElement);
        });
    });
}

function createTaskElement(task) {
    const taskCard = document.createElement('div');
    taskCard.className = 'task-card';
    taskCard.draggable = true;
    taskCard.dataset.taskId = task.id;
    
    const sprintInfo = task.sprintId 
        ? sprints.find(s => s.id === task.sprintId)?.name || 'Unknown Sprint'
        : null;
    
    taskCard.innerHTML = `
        <div class="task-header">
            <div class="task-title">${escapeHtml(task.title)}</div>
            <div class="task-priority priority-${task.priority}">${task.priority}</div>
        </div>
        ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
        <div class="task-meta">
            <div class="task-sprint">${sprintInfo ? `📋 ${sprintInfo}` : ''}</div>
            ${task.assignee ? `<div class="task-assignee">${escapeHtml(task.assignee)}</div>` : ''}
        </div>
    `;
    
    // Add event listeners
    taskCard.addEventListener('click', () => openTaskModal(task));
    taskCard.addEventListener('dragstart', handleDragStart);
    taskCard.addEventListener('dragend', handleDragEnd);
    
    return taskCard;
}

function renderSprintList() {
    const sprintList = document.getElementById('sprint-list');
    sprintList.innerHTML = '';
    
    if (sprints.length === 0) {
        sprintList.innerHTML = '<p style="color: #7f8c8d; text-align: center;">No sprints created yet.</p>';
        return;
    }
    
    sprints.forEach(sprint => {
        const sprintElement = document.createElement('div');
        sprintElement.className = 'sprint-item';
        
        sprintElement.innerHTML = `
            <div class="sprint-item-header">
                <div class="sprint-name">${escapeHtml(sprint.name)}</div>
                <div class="sprint-status status-${sprint.status}">${sprint.status}</div>
            </div>
            ${sprint.description ? `<div style="color: #7f8c8d; font-size: 0.8rem; margin-bottom: 0.5rem;">${escapeHtml(sprint.description)}</div>` : ''}
            <div class="sprint-dates">
                ${formatDate(sprint.startDate)} - ${formatDate(sprint.endDate)}
            </div>
        `;
        
        sprintList.appendChild(sprintElement);
    });
}

function updateSprintInfo() {
    const sprintNameElement = document.getElementById('current-sprint-name');
    const sprintDatesElement = document.getElementById('current-sprint-dates');
    
    if (currentSprint) {
        sprintNameElement.textContent = currentSprint.name;
        sprintDatesElement.textContent = `${formatDate(currentSprint.startDate)} - ${formatDate(currentSprint.endDate)}`;
    } else {
        sprintNameElement.textContent = 'No active sprint';
        sprintDatesElement.textContent = '';
    }
}

// Drag and drop functionality
let draggedTask = null;

function handleDragStart(e) {
    draggedTask = e.target;
    e.target.style.opacity = '0.5';
    
    // Add drop zones
    document.querySelectorAll('.column-content').forEach(column => {
        column.addEventListener('dragover', handleDragOver);
        column.addEventListener('drop', handleDrop);
    });
}

function handleDragEnd(e) {
    e.target.style.opacity = '1';
    draggedTask = null;
    
    // Remove drop zone listeners
    document.querySelectorAll('.column-content').forEach(column => {
        column.removeEventListener('dragover', handleDragOver);
        column.removeEventListener('drop', handleDrop);
    });
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

async function handleDrop(e) {
    e.preventDefault();
    
    if (!draggedTask) return;
    
    const columnElement = e.currentTarget;
    const newStatus = columnElement.id.replace('-tasks', '');
    const taskId = draggedTask.dataset.taskId;
    
    try {
        await updateTask(taskId, { status: newStatus });
        renderKanbanBoard();
    } catch (error) {
        alert('Failed to update task status. Please try again.');
    }
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}
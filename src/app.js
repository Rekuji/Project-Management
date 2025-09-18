const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Data file paths
const DATA_DIR = path.join(__dirname, '../data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const SPRINTS_FILE = path.join(DATA_DIR, 'sprints.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize data files if they don't exist
function initializeDataFiles() {
    if (!fs.existsSync(TASKS_FILE)) {
        fs.writeFileSync(TASKS_FILE, JSON.stringify([], null, 2));
    }
    if (!fs.existsSync(SPRINTS_FILE)) {
        fs.writeFileSync(SPRINTS_FILE, JSON.stringify([], null, 2));
    }
    if (!fs.existsSync(CONFIG_FILE)) {
        const defaultConfig = {
            kanbanColumns: ['todo', 'in-progress', 'review', 'done'],
            priorities: ['low', 'medium', 'high', 'critical']
        };
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2));
    }
}

// Helper functions to read/write data
function readJSONFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
        return [];
    }
}

function writeJSONFile(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error writing ${filePath}:`, error);
        return false;
    }
}

// Routes

// Serve main kanban board
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../templates/index.html'));
});

// Get all tasks
app.get('/api/tasks', (req, res) => {
    const tasks = readJSONFile(TASKS_FILE);
    res.json(tasks);
});

// Create new task
app.post('/api/tasks', (req, res) => {
    const tasks = readJSONFile(TASKS_FILE);
    const newTask = {
        id: uuidv4(),
        title: req.body.title || '',
        description: req.body.description || '',
        status: req.body.status || 'todo',
        priority: req.body.priority || 'medium',
        assignee: req.body.assignee || '',
        sprintId: req.body.sprintId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    tasks.push(newTask);
    if (writeJSONFile(TASKS_FILE, tasks)) {
        res.status(201).json(newTask);
    } else {
        res.status(500).json({ error: 'Failed to create task' });
    }
});

// Update task
app.put('/api/tasks/:id', (req, res) => {
    const tasks = readJSONFile(TASKS_FILE);
    const taskIndex = tasks.findIndex(task => task.id === req.params.id);
    
    if (taskIndex === -1) {
        return res.status(404).json({ error: 'Task not found' });
    }
    
    tasks[taskIndex] = {
        ...tasks[taskIndex],
        ...req.body,
        updatedAt: new Date().toISOString()
    };
    
    if (writeJSONFile(TASKS_FILE, tasks)) {
        res.json(tasks[taskIndex]);
    } else {
        res.status(500).json({ error: 'Failed to update task' });
    }
});

// Delete task
app.delete('/api/tasks/:id', (req, res) => {
    const tasks = readJSONFile(TASKS_FILE);
    const filteredTasks = tasks.filter(task => task.id !== req.params.id);
    
    if (tasks.length === filteredTasks.length) {
        return res.status(404).json({ error: 'Task not found' });
    }
    
    if (writeJSONFile(TASKS_FILE, filteredTasks)) {
        res.status(204).send();
    } else {
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

// Get all sprints
app.get('/api/sprints', (req, res) => {
    const sprints = readJSONFile(SPRINTS_FILE);
    res.json(sprints);
});

// Create new sprint
app.post('/api/sprints', (req, res) => {
    const sprints = readJSONFile(SPRINTS_FILE);
    const newSprint = {
        id: uuidv4(),
        name: req.body.name || '',
        description: req.body.description || '',
        startDate: req.body.startDate || new Date().toISOString().split('T')[0],
        endDate: req.body.endDate || '',
        status: req.body.status || 'planning',
        createdAt: new Date().toISOString()
    };
    
    sprints.push(newSprint);
    if (writeJSONFile(SPRINTS_FILE, sprints)) {
        res.status(201).json(newSprint);
    } else {
        res.status(500).json({ error: 'Failed to create sprint' });
    }
});

// Update sprint
app.put('/api/sprints/:id', (req, res) => {
    const sprints = readJSONFile(SPRINTS_FILE);
    const sprintIndex = sprints.findIndex(sprint => sprint.id === req.params.id);
    
    if (sprintIndex === -1) {
        return res.status(404).json({ error: 'Sprint not found' });
    }
    
    sprints[sprintIndex] = {
        ...sprints[sprintIndex],
        ...req.body
    };
    
    if (writeJSONFile(SPRINTS_FILE, sprints)) {
        res.json(sprints[sprintIndex]);
    } else {
        res.status(500).json({ error: 'Failed to update sprint' });
    }
});

// Get configuration
app.get('/api/config', (req, res) => {
    const config = readJSONFile(CONFIG_FILE);
    res.json(config);
});

// Initialize data files on startup
initializeDataFiles();

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Kanban Project Management Server is running!`);
    console.log(`📊 Access your kanban board at: http://localhost:${PORT}`);
    console.log(`📁 Data is stored in: ${DATA_DIR}`);
    console.log(`\nPress Ctrl+C to stop the server\n`);
});

module.exports = app;
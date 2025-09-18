const fs = require('fs');
const path = require('path');

// Data directory and file paths
const DATA_DIR = path.join(__dirname, '../data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const SPRINTS_FILE = path.join(DATA_DIR, 'sprints.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

console.log('🚀 Setting up Project Management Kanban System...\n');

// Create data directory
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log('✅ Created data directory');
} else {
    console.log('✅ Data directory already exists');
}

// Create sample configuration
const defaultConfig = {
    kanbanColumns: ['todo', 'in-progress', 'review', 'done'],
    priorities: ['low', 'medium', 'high', 'critical'],
    projectName: 'My Project'
};

if (!fs.existsSync(CONFIG_FILE)) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2));
    console.log('✅ Created configuration file');
} else {
    console.log('✅ Configuration file already exists');
}

// Create sample sprint
const sampleSprints = [
    {
        id: 'sprint-1',
        name: 'Sprint 1 - Initial Setup',
        description: 'First sprint to set up the project foundation',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 weeks from now
        status: 'active',
        createdAt: new Date().toISOString()
    }
];

if (!fs.existsSync(SPRINTS_FILE)) {
    fs.writeFileSync(SPRINTS_FILE, JSON.stringify(sampleSprints, null, 2));
    console.log('✅ Created sample sprint');
} else {
    console.log('✅ Sprints file already exists');
}

// Create sample tasks
const sampleTasks = [
    {
        id: 'task-1',
        title: 'Set up project repository',
        description: 'Initialize the project repository with basic structure and documentation',
        status: 'done',
        priority: 'high',
        assignee: 'Developer',
        sprintId: 'sprint-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'task-2',
        title: 'Design kanban board interface',
        description: 'Create wireframes and design mockups for the kanban board user interface',
        status: 'done',
        priority: 'medium',
        assignee: 'Designer',
        sprintId: 'sprint-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'task-3',
        title: 'Implement drag and drop functionality',
        description: 'Add drag and drop support for moving tasks between columns',
        status: 'in-progress',
        priority: 'high',
        assignee: 'Developer',
        sprintId: 'sprint-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'task-4',
        title: 'Add task creation modal',
        description: 'Create a modal dialog for adding new tasks with all necessary fields',
        status: 'review',
        priority: 'medium',
        assignee: 'Developer',
        sprintId: 'sprint-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'task-5',
        title: 'Write user documentation',
        description: 'Create comprehensive documentation for end users',
        status: 'todo',
        priority: 'low',
        assignee: 'Technical Writer',
        sprintId: 'sprint-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'task-6',
        title: 'Set up testing framework',
        description: 'Configure unit and integration testing tools',
        status: 'todo',
        priority: 'medium',
        assignee: 'QA Engineer',
        sprintId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

if (!fs.existsSync(TASKS_FILE)) {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(sampleTasks, null, 2));
    console.log('✅ Created sample tasks');
} else {
    console.log('✅ Tasks file already exists');
}

console.log('\n🎉 Setup complete! Your kanban project management system is ready.');
console.log('\nNext steps:');
console.log('1. Run "npm start" to start the server');
console.log('2. Open http://localhost:3000 in your browser');
console.log('3. Start managing your projects!\n');

console.log('📁 Data files location:', DATA_DIR);
console.log('📊 Sample data includes:');
console.log(`   - ${sampleTasks.length} sample tasks`);
console.log(`   - ${sampleSprints.length} sample sprint`);
console.log('   - Default configuration\n');
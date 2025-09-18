const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;

// Data file paths
const DATA_DIR = path.join(__dirname, '../data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const SPRINTS_FILE = path.join(DATA_DIR, 'sprints.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

// Simple UUID implementation for Node.js without external dependencies
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Helper functions
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

// Get MIME type for files
function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml'
    };
    return mimeTypes[ext] || 'text/plain';
}

// Create server
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Serve main page
    if (pathname === '/' || pathname === '/index.html') {
        const htmlPath = path.join(__dirname, '../templates/index.html');
        fs.readFile(htmlPath, (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('Page not found');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
        return;
    }
    
    // Serve static files
    if (pathname.startsWith('/css/') || pathname.startsWith('/js/')) {
        const filePath = path.join(__dirname, '../public', pathname);
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('File not found');
                return;
            }
            res.writeHead(200, { 'Content-Type': getMimeType(filePath) });
            res.end(data);
        });
        return;
    }
    
    // API routes
    if (pathname.startsWith('/api/')) {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            let parsedBody = {};
            if (body) {
                try {
                    parsedBody = JSON.parse(body);
                } catch (e) {
                    // Handle non-JSON bodies
                }
            }
            
            handleAPIRequest(req, res, pathname, parsedBody);
        });
        return;
    }
    
    // 404 for everything else
    res.writeHead(404);
    res.end('Not found');
});

// API request handler
function handleAPIRequest(req, res, pathname, body) {
    res.setHeader('Content-Type', 'application/json');
    
    try {
        // Tasks API
        if (pathname === '/api/tasks') {
            if (req.method === 'GET') {
                const tasks = readJSONFile(TASKS_FILE);
                res.writeHead(200);
                res.end(JSON.stringify(tasks));
            } else if (req.method === 'POST') {
                const tasks = readJSONFile(TASKS_FILE);
                const newTask = {
                    id: generateUUID(),
                    title: body.title || '',
                    description: body.description || '',
                    status: body.status || 'todo',
                    priority: body.priority || 'medium',
                    assignee: body.assignee || '',
                    sprintId: body.sprintId || null,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                
                tasks.push(newTask);
                if (writeJSONFile(TASKS_FILE, tasks)) {
                    res.writeHead(201);
                    res.end(JSON.stringify(newTask));
                } else {
                    res.writeHead(500);
                    res.end(JSON.stringify({ error: 'Failed to create task' }));
                }
            }
        }
        
        // Individual task operations
        else if (pathname.match(/^\/api\/tasks\/(.+)$/)) {
            const taskId = pathname.match(/^\/api\/tasks\/(.+)$/)[1];
            const tasks = readJSONFile(TASKS_FILE);
            
            if (req.method === 'PUT') {
                const taskIndex = tasks.findIndex(task => task.id === taskId);
                if (taskIndex === -1) {
                    res.writeHead(404);
                    res.end(JSON.stringify({ error: 'Task not found' }));
                    return;
                }
                
                tasks[taskIndex] = {
                    ...tasks[taskIndex],
                    ...body,
                    updatedAt: new Date().toISOString()
                };
                
                if (writeJSONFile(TASKS_FILE, tasks)) {
                    res.writeHead(200);
                    res.end(JSON.stringify(tasks[taskIndex]));
                } else {
                    res.writeHead(500);
                    res.end(JSON.stringify({ error: 'Failed to update task' }));
                }
            } else if (req.method === 'DELETE') {
                const filteredTasks = tasks.filter(task => task.id !== taskId);
                if (tasks.length === filteredTasks.length) {
                    res.writeHead(404);
                    res.end(JSON.stringify({ error: 'Task not found' }));
                    return;
                }
                
                if (writeJSONFile(TASKS_FILE, filteredTasks)) {
                    res.writeHead(204);
                    res.end();
                } else {
                    res.writeHead(500);
                    res.end(JSON.stringify({ error: 'Failed to delete task' }));
                }
            }
        }
        
        // Sprints API
        else if (pathname === '/api/sprints') {
            if (req.method === 'GET') {
                const sprints = readJSONFile(SPRINTS_FILE);
                res.writeHead(200);
                res.end(JSON.stringify(sprints));
            } else if (req.method === 'POST') {
                const sprints = readJSONFile(SPRINTS_FILE);
                const newSprint = {
                    id: generateUUID(),
                    name: body.name || '',
                    description: body.description || '',
                    startDate: body.startDate || new Date().toISOString().split('T')[0],
                    endDate: body.endDate || '',
                    status: body.status || 'planning',
                    createdAt: new Date().toISOString()
                };
                
                sprints.push(newSprint);
                if (writeJSONFile(SPRINTS_FILE, sprints)) {
                    res.writeHead(201);
                    res.end(JSON.stringify(newSprint));
                } else {
                    res.writeHead(500);
                    res.end(JSON.stringify({ error: 'Failed to create sprint' }));
                }
            }
        }
        
        // Config API
        else if (pathname === '/api/config') {
            if (req.method === 'GET') {
                const config = readJSONFile(CONFIG_FILE);
                res.writeHead(200);
                res.end(JSON.stringify(config));
            }
        }
        
        else {
            res.writeHead(404);
            res.end(JSON.stringify({ error: 'API endpoint not found' }));
        }
        
    } catch (error) {
        console.error('API Error:', error);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
}

// Start server
server.listen(PORT, () => {
    console.log(`\n🚀 Kanban Project Management Server is running!`);
    console.log(`📊 Access your kanban board at: http://localhost:${PORT}`);
    console.log(`📁 Data is stored in: ${DATA_DIR}`);
    console.log(`\nPress Ctrl+C to stop the server\n`);
});

module.exports = server;
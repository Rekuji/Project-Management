# Project Management - Kanban Sprint Board

A simple, file-based project management system featuring kanban boards and sprint management functionality.

## Features

- **Kanban Board**: Visual task management with drag-and-drop functionality
- **Sprint Management**: Create and manage sprints with start/end dates
- **Task Tracking**: Create, update, and track tasks through different stages
- **File-Based Storage**: No database required - uses JSON files for data persistence
- **Web Interface**: Clean, responsive web interface for managing projects

## Quick Start

1. **Setup the project:**
   ```bash
   npm run setup
   ```

2. **Start the application:**
   ```bash
   npm start
   ```

3. **Access the kanban board:**
   Open your browser and go to `http://localhost:3000`

## Project Structure

```
project-management/
├── src/                    # Application source code
├── data/                   # Data storage (JSON files)
├── public/                 # Static web assets
├── templates/             # HTML templates
├── scripts/               # Setup and utility scripts
└── README.md
```

## Kanban Board Columns

- **To Do**: Tasks that are planned but not started
- **In Progress**: Tasks currently being worked on
- **Review**: Tasks completed and awaiting review
- **Done**: Completed tasks

## Sprint Management

Create and manage sprints with:
- Sprint name and description
- Start and end dates
- Task assignment to sprints
- Sprint progress tracking

## Usage

### Creating Tasks
1. Click "Add Task" button
2. Fill in task details (title, description, priority, assignee)
3. Task will be added to "To Do" column

### Managing Sprints
1. Click "Manage Sprints" to create new sprints
2. Assign tasks to sprints
3. Track sprint progress

### Moving Tasks
- Drag and drop tasks between columns
- Click on tasks to edit details
- Mark tasks as complete

## Data Storage

All data is stored in JSON files in the `data/` directory:
- `tasks.json`: Task information
- `sprints.json`: Sprint information
- `config.json`: Application configuration

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev
```

## License

MIT License
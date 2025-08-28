# Workflow Designer

A web-based visual workflow designer that allows users to create, edit, and manage workflows through an intuitive drag-and-drop interface.

## Features

### Core Functionality
- **Visual Workflow Design**: Drag and drop interface for creating workflows
- **Multiple Node Types**: Support for Start, Process, Decision, and End nodes
- **Node Connections**: Connect nodes with visual flow arrows
- **Node Editing**: Double-click nodes to edit labels and descriptions
- **Selection Management**: Click to select nodes and connections
- **Keyboard Shortcuts**: Delete selected items with Delete/Backspace key

### Workflow Management
- **Save Workflows**: Save workflows to browser localStorage
- **Load Workflows**: Load previously saved workflows
- **Export Workflows**: Export workflows as JSON files
- **Import Workflows**: Import workflows from JSON files
- **New Workflow**: Clear current workflow to start fresh

### User Experience
- **Responsive Design**: Works on desktop and tablet devices
- **Grid Background**: Visual grid for better alignment
- **Connection Mode**: Click output points to start connections, input points to complete them
- **Visual Feedback**: Hover effects and selection indicators
- **Modal Editors**: Clean modal interface for node editing

## Getting Started

### Running the Application
1. Clone or download the repository
2. Open `index.html` in a modern web browser
3. Start designing your workflow!

### Browser Requirements
- Modern web browser with ES6 module support
- JavaScript enabled
- LocalStorage support for saving workflows

## How to Use

### Creating Nodes
1. Drag a node type from the left sidebar onto the canvas
2. The node will be placed where you drop it
3. Double-click any node to edit its properties

### Connecting Nodes
1. Click on the output connection point (bottom) of a source node
2. Click on the input connection point (top) of a target node
3. A curved arrow will connect the nodes

### Editing Nodes
1. Double-click any node to open the editor
2. Modify the label and description
3. Click "Save" to apply changes or "Delete" to remove the node

### Managing Workflows
- **New**: Clear the current workflow
- **Save**: Save the current workflow to browser storage
- **Load**: Load a previously saved workflow
- **Export**: Download the workflow as a JSON file

### Keyboard Shortcuts
- **Delete/Backspace**: Delete selected node or connection
- **Escape**: Clear selection and exit connection mode

## Technical Details

### Architecture
The application is built with vanilla JavaScript using ES6 modules:

- `main.js`: Main application controller and workflow designer
- `WorkflowNode.js`: Individual workflow node management
- `Connection.js`: Connection/arrow management between nodes
- `DragDrop.js`: Drag and drop functionality from palette
- `WorkflowManager.js`: Save/load/export functionality

### Node Types
- **Start Node**: Entry point for workflows (green)
- **Process Node**: Regular processing steps (blue)
- **Decision Node**: Conditional logic nodes (orange, diamond-shaped)
- **End Node**: Exit points for workflows (red)

### Data Structure
Workflows are stored as JSON with the following structure:
```json
{
  "nodes": [
    {
      "id": "node_1",
      "type": "start",
      "x": 100,
      "y": 100,
      "label": "Start",
      "description": "Starting point"
    }
  ],
  "connections": [
    {
      "id": "conn_1",
      "startNodeId": "node_1",
      "endNodeId": "node_2"
    }
  ]
}
```

### Browser Compatibility
- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Customization

### Adding New Node Types
1. Add the new type to the palette in `index.html`
2. Add styling in `styles/main.css`
3. Update the `getNodeIcon()` method in `WorkflowNode.js`
4. Add the default label in `getDefaultLabel()` in `main.js`

### Styling
The application uses CSS custom properties for easy theming. Main colors can be adjusted in the `:root` section of `styles/main.css`.

## File Structure
```
/
├── index.html              # Main HTML file
├── styles/
│   └── main.css           # Main stylesheet
├── js/
│   ├── main.js            # Main application logic
│   ├── WorkflowNode.js    # Node management
│   ├── Connection.js      # Connection management
│   ├── DragDrop.js        # Drag and drop handling
│   └── WorkflowManager.js # Save/load/export functionality
├── LICENSE                # MIT License
└── README.md             # This file
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
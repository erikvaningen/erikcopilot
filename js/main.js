import { WorkflowNode } from './WorkflowNode.js';
import { Connection } from './Connection.js';
import { DragDrop } from './DragDrop.js';
import { WorkflowManager } from './WorkflowManager.js';

class WorkflowDesigner {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.canvasOverlay = document.getElementById('canvasOverlay');
        this.nodes = new Map();
        this.connections = new Map();
        this.selectedNode = null;
        this.selectedConnection = null;
        this.connectionMode = false;
        this.connectionStart = null;
        this.nextNodeId = 1;
        this.nextConnectionId = 1;

        this.workflowManager = new WorkflowManager(this);
        this.dragDrop = new DragDrop(this);
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupToolbar();
        this.setupNodeEditor();
    }

    setupEventListeners() {
        // Canvas click handling
        this.canvasOverlay.addEventListener('click', (e) => {
            if (e.target === this.canvasOverlay) {
                this.clearSelection();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (this.selectedNode) {
                    this.deleteNode(this.selectedNode.id);
                } else if (this.selectedConnection) {
                    this.deleteConnection(this.selectedConnection.id);
                }
            } else if (e.key === 'Escape') {
                this.clearSelection();
                this.exitConnectionMode();
            }
        });

        // Context menu prevention
        this.canvasOverlay.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }

    setupToolbar() {
        document.getElementById('newWorkflow').addEventListener('click', () => {
            if (confirm('Create a new workflow? This will clear the current workflow.')) {
                this.clearWorkflow();
            }
        });

        document.getElementById('saveWorkflow').addEventListener('click', () => {
            this.workflowManager.saveWorkflow();
        });

        document.getElementById('loadWorkflow').addEventListener('click', () => {
            this.workflowManager.loadWorkflow();
        });

        document.getElementById('exportWorkflow').addEventListener('click', () => {
            this.workflowManager.exportWorkflow();
        });
    }

    setupNodeEditor() {
        const modal = document.getElementById('nodeEditor');
        const closeButtons = modal.querySelectorAll('.modal-close');
        const saveButton = document.getElementById('saveNode');
        const deleteButton = document.getElementById('deleteNode');

        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeNodeEditor();
            });
        });

        saveButton.addEventListener('click', () => {
            this.saveNodeChanges();
        });

        deleteButton.addEventListener('click', () => {
            if (this.selectedNode && confirm('Delete this node?')) {
                this.deleteNode(this.selectedNode.id);
                this.closeNodeEditor();
            }
        });

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeNodeEditor();
            }
        });
    }

    createNode(type, x, y, data = {}) {
        const nodeId = `node_${this.nextNodeId++}`;
        const nodeData = {
            id: nodeId,
            type,
            x,
            y,
            label: data.label || this.getDefaultLabel(type),
            description: data.description || '',
            ...data
        };

        const node = new WorkflowNode(nodeData, this);
        this.nodes.set(nodeId, node);
        
        return node;
    }

    getDefaultLabel(type) {
        const labels = {
            start: 'Start',
            process: 'Process',
            decision: 'Decision',
            end: 'End'
        };
        return labels[type] || 'Node';
    }

    deleteNode(nodeId) {
        const node = this.nodes.get(nodeId);
        if (!node) return;

        // Remove all connections to/from this node
        const connectionsToDelete = [];
        this.connections.forEach((connection, id) => {
            if (connection.startNodeId === nodeId || connection.endNodeId === nodeId) {
                connectionsToDelete.push(id);
            }
        });

        connectionsToDelete.forEach(id => this.deleteConnection(id));

        // Remove the node
        node.remove();
        this.nodes.delete(nodeId);
        
        if (this.selectedNode && this.selectedNode.id === nodeId) {
            this.selectedNode = null;
        }
    }

    createConnection(startNodeId, endNodeId) {
        // Check if connection already exists
        const existing = Array.from(this.connections.values()).find(
            conn => conn.startNodeId === startNodeId && conn.endNodeId === endNodeId
        );
        
        if (existing) return null;

        const connectionId = `conn_${this.nextConnectionId++}`;
        const connection = new Connection({
            id: connectionId,
            startNodeId,
            endNodeId
        }, this);

        this.connections.set(connectionId, connection);
        return connection;
    }

    deleteConnection(connectionId) {
        const connection = this.connections.get(connectionId);
        if (!connection) return;

        connection.remove();
        this.connections.delete(connectionId);
        
        if (this.selectedConnection && this.selectedConnection.id === connectionId) {
            this.selectedConnection = null;
        }
    }

    selectNode(node) {
        this.clearSelection();
        this.selectedNode = node;
        node.setSelected(true);
    }

    selectConnection(connection) {
        this.clearSelection();
        this.selectedConnection = connection;
        connection.setSelected(true);
    }

    clearSelection() {
        if (this.selectedNode) {
            this.selectedNode.setSelected(false);
            this.selectedNode = null;
        }
        if (this.selectedConnection) {
            this.selectedConnection.setSelected(false);
            this.selectedConnection = null;
        }
    }

    openNodeEditor(node) {
        this.selectNode(node);
        
        const modal = document.getElementById('nodeEditor');
        const labelInput = document.getElementById('nodeLabel');
        const descriptionInput = document.getElementById('nodeDescription');
        
        labelInput.value = node.data.label;
        descriptionInput.value = node.data.description;
        
        modal.classList.remove('hidden');
        labelInput.focus();
    }

    closeNodeEditor() {
        const modal = document.getElementById('nodeEditor');
        modal.classList.add('hidden');
    }

    saveNodeChanges() {
        if (!this.selectedNode) return;

        const labelInput = document.getElementById('nodeLabel');
        const descriptionInput = document.getElementById('nodeDescription');
        
        this.selectedNode.updateData({
            label: labelInput.value.trim() || this.getDefaultLabel(this.selectedNode.data.type),
            description: descriptionInput.value.trim()
        });

        this.closeNodeEditor();
    }

    enterConnectionMode(startNode) {
        this.connectionMode = true;
        this.connectionStart = startNode;
        this.canvasOverlay.style.cursor = 'crosshair';
        
        // Highlight potential target nodes
        this.nodes.forEach(node => {
            if (node !== startNode) {
                node.element.style.boxShadow = '0 0 0 2px rgba(52, 152, 219, 0.5)';
            }
        });
    }

    exitConnectionMode() {
        this.connectionMode = false;
        this.connectionStart = null;
        this.canvasOverlay.style.cursor = 'default';
        
        // Remove highlights
        this.nodes.forEach(node => {
            node.element.style.boxShadow = '';
        });
    }

    completeConnection(endNode) {
        if (!this.connectionMode || !this.connectionStart || this.connectionStart === endNode) {
            return;
        }

        this.createConnection(this.connectionStart.id, endNode.id);
        this.exitConnectionMode();
    }

    clearWorkflow() {
        // Clear all connections
        this.connections.forEach((connection, id) => {
            this.deleteConnection(id);
        });

        // Clear all nodes
        this.nodes.forEach((node, id) => {
            this.deleteNode(id);
        });

        this.clearSelection();
        this.nextNodeId = 1;
        this.nextConnectionId = 1;
    }

    getWorkflowData() {
        const nodes = Array.from(this.nodes.values()).map(node => ({
            id: node.id,
            type: node.data.type,
            x: node.data.x,
            y: node.data.y,
            label: node.data.label,
            description: node.data.description
        }));

        const connections = Array.from(this.connections.values()).map(conn => ({
            id: conn.id,
            startNodeId: conn.startNodeId,
            endNodeId: conn.endNodeId
        }));

        return {
            nodes,
            connections,
            nextNodeId: this.nextNodeId,
            nextConnectionId: this.nextConnectionId
        };
    }

    loadWorkflowData(data) {
        this.clearWorkflow();

        // Load nodes
        data.nodes.forEach(nodeData => {
            this.createNode(nodeData.type, nodeData.x, nodeData.y, nodeData);
        });

        // Load connections
        data.connections.forEach(connData => {
            const connection = new Connection(connData, this);
            this.connections.set(connData.id, connection);
        });

        // Restore counters
        this.nextNodeId = data.nextNodeId || 1;
        this.nextConnectionId = data.nextConnectionId || 1;
    }
}

// Initialize the workflow designer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.workflowDesigner = new WorkflowDesigner();
});

export { WorkflowDesigner };
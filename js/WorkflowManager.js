export class WorkflowManager {
    constructor(designer) {
        this.designer = designer;
        this.storageKey = 'workflowDesigner_workflows';
    }

    saveWorkflow() {
        const workflowName = prompt('Enter a name for this workflow:');
        if (!workflowName) return;

        const workflowData = {
            name: workflowName.trim(),
            data: this.designer.getWorkflowData(),
            timestamp: new Date().toISOString()
        };

        // Get existing workflows from localStorage
        const savedWorkflows = this.getSavedWorkflows();
        
        // Add or update the workflow
        savedWorkflows[workflowName.trim()] = workflowData;
        
        // Save back to localStorage
        localStorage.setItem(this.storageKey, JSON.stringify(savedWorkflows));
        
        alert(`Workflow "${workflowName}" saved successfully!`);
    }

    loadWorkflow() {
        const savedWorkflows = this.getSavedWorkflows();
        const workflowNames = Object.keys(savedWorkflows);
        
        if (workflowNames.length === 0) {
            alert('No saved workflows found.');
            return;
        }

        // Create a simple selection dialog
        const workflowList = workflowNames.map((name, index) => 
            `${index + 1}. ${name} (saved: ${new Date(savedWorkflows[name].timestamp).toLocaleString()})`
        ).join('\n');
        
        const selection = prompt(
            `Select a workflow to load:\n\n${workflowList}\n\nEnter the number or name:`
        );
        
        if (!selection) return;

        let selectedWorkflow = null;
        
        // Try to parse as number first
        const num = parseInt(selection);
        if (num >= 1 && num <= workflowNames.length) {
            selectedWorkflow = savedWorkflows[workflowNames[num - 1]];
        } else {
            // Try to find by name
            selectedWorkflow = savedWorkflows[selection.trim()];
        }

        if (!selectedWorkflow) {
            alert('Invalid selection.');
            return;
        }

        if (confirm(`Load workflow "${selectedWorkflow.name}"? This will replace the current workflow.`)) {
            this.designer.loadWorkflowData(selectedWorkflow.data);
            alert(`Workflow "${selectedWorkflow.name}" loaded successfully!`);
        }
    }

    exportWorkflow() {
        const workflowData = this.designer.getWorkflowData();
        
        // Add metadata
        const exportData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            workflow: workflowData
        };

        // Create and download the JSON file
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `workflow_${new Date().toISOString().split('T')[0]}.json`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(link.href);
    }

    importWorkflow(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const importData = JSON.parse(e.target.result);
                    
                    // Validate the import data structure
                    if (!importData.workflow || !importData.workflow.nodes) {
                        throw new Error('Invalid workflow file format');
                    }
                    
                    this.designer.loadWorkflowData(importData.workflow);
                    resolve(importData);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    getSavedWorkflows() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.error('Error loading saved workflows:', error);
            return {};
        }
    }

    deleteWorkflow(workflowName) {
        const savedWorkflows = this.getSavedWorkflows();
        
        if (savedWorkflows[workflowName]) {
            delete savedWorkflows[workflowName];
            localStorage.setItem(this.storageKey, JSON.stringify(savedWorkflows));
            return true;
        }
        
        return false;
    }

    validateWorkflow() {
        const workflowData = this.designer.getWorkflowData();
        const issues = [];

        // Check for start node
        const startNodes = workflowData.nodes.filter(node => node.type === 'start');
        if (startNodes.length === 0) {
            issues.push('Workflow must have at least one start node');
        } else if (startNodes.length > 1) {
            issues.push('Workflow should have only one start node');
        }

        // Check for end node
        const endNodes = workflowData.nodes.filter(node => node.type === 'end');
        if (endNodes.length === 0) {
            issues.push('Workflow must have at least one end node');
        }

        // Check for disconnected nodes
        const connectedNodeIds = new Set();
        workflowData.connections.forEach(conn => {
            connectedNodeIds.add(conn.startNodeId);
            connectedNodeIds.add(conn.endNodeId);
        });

        const disconnectedNodes = workflowData.nodes.filter(node => 
            node.type !== 'start' && node.type !== 'end' && !connectedNodeIds.has(node.id)
        );

        if (disconnectedNodes.length > 0) {
            issues.push(`${disconnectedNodes.length} disconnected node(s) found`);
        }

        // Check for nodes without labels
        const unlabeledNodes = workflowData.nodes.filter(node => !node.label || node.label.trim() === '');
        if (unlabeledNodes.length > 0) {
            issues.push(`${unlabeledNodes.length} node(s) without labels`);
        }

        return {
            isValid: issues.length === 0,
            issues
        };
    }

    showWorkflowValidation() {
        const validation = this.validateWorkflow();
        
        if (validation.isValid) {
            alert('Workflow validation passed! No issues found.');
        } else {
            const issueList = validation.issues.map((issue, index) => `${index + 1}. ${issue}`).join('\n');
            alert(`Workflow validation found issues:\n\n${issueList}`);
        }
        
        return validation;
    }
}
export class WorkflowNode {
    constructor(data, designer) {
        this.id = data.id;
        this.data = { ...data };
        this.designer = designer;
        this.element = null;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        
        this.createElement();
        this.setupEventListeners();
        this.updatePosition();
    }

    createElement() {
        this.element = document.createElement('div');
        this.element.className = `workflow-node ${this.data.type}`;
        this.element.innerHTML = `
            <div class="node-header">
                <div class="node-icon ${this.data.type}-icon">${this.getNodeIcon()}</div>
            </div>
            <div class="node-content">
                <div class="node-label">${this.data.label}</div>
                ${this.data.description ? `<div class="node-description">${this.data.description}</div>` : ''}
            </div>
            <div class="connection-point input" data-type="input"></div>
            <div class="connection-point output" data-type="output"></div>
        `;

        // Hide input connection point for start nodes
        if (this.data.type === 'start') {
            this.element.querySelector('.connection-point.input').style.display = 'none';
        }
        
        // Hide output connection point for end nodes
        if (this.data.type === 'end') {
            this.element.querySelector('.connection-point.output').style.display = 'none';
        }

        this.designer.canvasOverlay.appendChild(this.element);
    }

    getNodeIcon() {
        const icons = {
            start: '▶',
            process: '⚙',
            decision: '?',
            end: '⏹'
        };
        return icons[this.data.type] || '●';
    }

    setupEventListeners() {
        // Node selection and dragging
        this.element.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            
            if (e.target.classList.contains('connection-point')) {
                this.handleConnectionPoint(e);
                return;
            }

            this.designer.selectNode(this);
            this.startDrag(e);
        });

        // Double-click to edit
        this.element.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            this.designer.openNodeEditor(this);
        });

        // Connection point events
        const connectionPoints = this.element.querySelectorAll('.connection-point');
        connectionPoints.forEach(point => {
            point.addEventListener('mouseenter', (e) => {
                if (this.designer.connectionMode) {
                    e.target.style.transform = e.target.classList.contains('input') 
                        ? 'translateX(-50%) scale(1.5)' 
                        : 'translateX(-50%) scale(1.5)';
                }
            });

            point.addEventListener('mouseleave', (e) => {
                e.target.style.transform = e.target.classList.contains('input') 
                    ? 'translateX(-50%)' 
                    : 'translateX(-50%)';
            });
        });

        // Global mouse events for dragging
        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.drag(e);
            }
        });

        document.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.stopDrag();
            }
        });
    }

    handleConnectionPoint(e) {
        const isOutput = e.target.classList.contains('output');
        const isInput = e.target.classList.contains('input');

        if (isOutput && !this.designer.connectionMode) {
            // Start connection mode
            this.designer.enterConnectionMode(this);
        } else if (isInput && this.designer.connectionMode) {
            // Complete connection
            this.designer.completeConnection(this);
        }
    }

    startDrag(e) {
        this.isDragging = true;
        this.element.style.zIndex = '20';
        
        const rect = this.element.getBoundingClientRect();
        const canvasRect = this.designer.canvasOverlay.getBoundingClientRect();
        
        this.dragOffset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };

        this.element.style.cursor = 'grabbing';
        document.body.style.userSelect = 'none';
    }

    drag(e) {
        if (!this.isDragging) return;

        const canvasRect = this.designer.canvasOverlay.getBoundingClientRect();
        const x = e.clientX - canvasRect.left - this.dragOffset.x;
        const y = e.clientY - canvasRect.top - this.dragOffset.y;

        // Constrain to canvas bounds
        const nodeRect = this.element.getBoundingClientRect();
        const maxX = canvasRect.width - nodeRect.width;
        const maxY = canvasRect.height - nodeRect.height;

        this.data.x = Math.max(0, Math.min(x, maxX));
        this.data.y = Math.max(0, Math.min(y, maxY));

        this.updatePosition();
        this.updateConnections();
    }

    stopDrag() {
        this.isDragging = false;
        this.element.style.zIndex = '10';
        this.element.style.cursor = 'move';
        document.body.style.userSelect = '';
    }

    updatePosition() {
        this.element.style.left = `${this.data.x}px`;
        this.element.style.top = `${this.data.y}px`;
    }

    updateConnections() {
        // Update all connections that involve this node
        this.designer.connections.forEach(connection => {
            if (connection.startNodeId === this.id || connection.endNodeId === this.id) {
                connection.updatePath();
            }
        });
    }

    updateData(newData) {
        Object.assign(this.data, newData);
        
        // Update the visual representation
        const labelElement = this.element.querySelector('.node-label');
        if (labelElement) {
            labelElement.textContent = this.data.label;
        }

        let descriptionElement = this.element.querySelector('.node-description');
        if (this.data.description) {
            if (!descriptionElement) {
                descriptionElement = document.createElement('div');
                descriptionElement.className = 'node-description';
                this.element.querySelector('.node-content').appendChild(descriptionElement);
            }
            descriptionElement.textContent = this.data.description;
        } else if (descriptionElement) {
            descriptionElement.remove();
        }
    }

    setSelected(selected) {
        if (selected) {
            this.element.classList.add('selected');
        } else {
            this.element.classList.remove('selected');
        }
    }

    getConnectionPoint(type) {
        const point = this.element.querySelector(`.connection-point.${type}`);
        if (!point) return null;

        const rect = point.getBoundingClientRect();
        const canvasRect = this.designer.canvas.getBoundingClientRect();
        
        return {
            x: rect.left + rect.width / 2 - canvasRect.left,
            y: rect.top + rect.height / 2 - canvasRect.top
        };
    }

    remove() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}
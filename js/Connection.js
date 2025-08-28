export class Connection {
    constructor(data, designer) {
        this.id = data.id;
        this.startNodeId = data.startNodeId;
        this.endNodeId = data.endNodeId;
        this.designer = designer;
        this.pathElement = null;
        
        this.createElement();
        this.updatePath();
        this.setupEventListeners();
    }

    createElement() {
        this.pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.pathElement.classList.add('connection');
        this.pathElement.setAttribute('data-connection-id', this.id);
        
        this.designer.canvas.appendChild(this.pathElement);
    }

    setupEventListeners() {
        this.pathElement.addEventListener('click', (e) => {
            e.stopPropagation();
            this.designer.selectConnection(this);
        });

        this.pathElement.addEventListener('mouseenter', () => {
            this.pathElement.style.strokeWidth = '3';
        });

        this.pathElement.addEventListener('mouseleave', () => {
            if (!this.pathElement.classList.contains('selected')) {
                this.pathElement.style.strokeWidth = '2';
            }
        });
    }

    updatePath() {
        const startNode = this.designer.nodes.get(this.startNodeId);
        const endNode = this.designer.nodes.get(this.endNodeId);
        
        if (!startNode || !endNode) {
            this.pathElement.setAttribute('d', '');
            return;
        }

        const startPoint = startNode.getConnectionPoint('output');
        const endPoint = endNode.getConnectionPoint('input');
        
        if (!startPoint || !endPoint) {
            this.pathElement.setAttribute('d', '');
            return;
        }

        // Create a smooth curved path
        const path = this.createCurvedPath(startPoint, endPoint);
        this.pathElement.setAttribute('d', path);
    }

    createCurvedPath(start, end) {
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        
        // Control points for the bezier curve
        const controlOffset = Math.max(50, Math.abs(dy) * 0.5);
        
        const cp1x = start.x;
        const cp1y = start.y + controlOffset;
        const cp2x = end.x;
        const cp2y = end.y - controlOffset;

        return `M ${start.x} ${start.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${end.x} ${end.y}`;
    }

    setSelected(selected) {
        if (selected) {
            this.pathElement.classList.add('selected');
            this.pathElement.style.strokeWidth = '3';
        } else {
            this.pathElement.classList.remove('selected');
            this.pathElement.style.strokeWidth = '2';
        }
    }

    remove() {
        if (this.pathElement && this.pathElement.parentNode) {
            this.pathElement.parentNode.removeChild(this.pathElement);
        }
    }
}
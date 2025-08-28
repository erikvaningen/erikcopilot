export class DragDrop {
    constructor(designer) {
        this.designer = designer;
        this.draggedType = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        const paletteNodes = document.querySelectorAll('.palette-node');
        
        paletteNodes.forEach(node => {
            node.addEventListener('dragstart', (e) => {
                this.handleDragStart(e);
            });

            node.addEventListener('dragend', (e) => {
                this.handleDragEnd(e);
            });
        });

        // Canvas drop zone events
        this.designer.canvasOverlay.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.designer.canvasOverlay.classList.add('drag-over');
        });

        this.designer.canvasOverlay.addEventListener('dragleave', (e) => {
            // Only remove drag-over if we're leaving the canvas entirely
            if (!this.designer.canvasOverlay.contains(e.relatedTarget)) {
                this.designer.canvasOverlay.classList.remove('drag-over');
            }
        });

        this.designer.canvasOverlay.addEventListener('drop', (e) => {
            e.preventDefault();
            this.handleDrop(e);
        });
    }

    handleDragStart(e) {
        this.draggedType = e.target.dataset.type;
        e.target.classList.add('dragging');
        
        // Set drag image
        const dragImage = e.target.cloneNode(true);
        dragImage.style.transform = 'rotate(5deg)';
        dragImage.style.opacity = '0.8';
        document.body.appendChild(dragImage);
        e.dataTransfer.setDragImage(dragImage, 60, 30);
        
        // Clean up the temporary drag image
        setTimeout(() => {
            if (document.body.contains(dragImage)) {
                document.body.removeChild(dragImage);
            }
        }, 0);
    }

    handleDragEnd(e) {
        e.target.classList.remove('dragging');
        this.designer.canvasOverlay.classList.remove('drag-over');
        this.draggedType = null;
    }

    handleDrop(e) {
        e.preventDefault();
        this.designer.canvasOverlay.classList.remove('drag-over');

        if (!this.draggedType) return;

        // Calculate drop position relative to canvas
        const canvasRect = this.designer.canvasOverlay.getBoundingClientRect();
        const x = e.clientX - canvasRect.left - 60; // Offset to center the node
        const y = e.clientY - canvasRect.top - 40;

        // Ensure the position is within canvas bounds
        const constrainedX = Math.max(0, Math.min(x, canvasRect.width - 120));
        const constrainedY = Math.max(0, Math.min(y, canvasRect.height - 80));

        // Create the new node
        this.designer.createNode(this.draggedType, constrainedX, constrainedY);
        
        this.draggedType = null;
    }
}
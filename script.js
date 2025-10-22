class MemeMaker {
    constructor() {
        this.textElements = [];
        this.selectedElement = null;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        document.getElementById('addTextBtn').addEventListener('click', () => this.addTextElement());
        document.getElementById('downloadBtn').addEventListener('click', () => this.downloadMeme());
    }
    
    addTextElement() {
        const canvas = document.getElementById('memeCanvas');
        const textElement = document.createElement('div');
        textElement.className = 'text-element';
        textElement.innerHTML = `
            <input type="text" value="Your text here" />
            <div class="text-controls">
                <select class="font-select">
                    <option value="font-anton">Anton</option>
                    <option value="font-bangers">Bangers</option>
                    <option value="font-great-vibes">Great Vibes</option>
                    <option value="font-tinos" selected>Tinos</option>
                </select>
                <button class="delete-btn" onclick="memeMaker.deleteTextElement(this)">×</button>
            </div>
        `;
        
        // Position randomly on the canvas
        const canvasRect = canvas.getBoundingClientRect();
        const randomX = Math.random() * (canvasRect.width - 100);
        const randomY = Math.random() * (canvasRect.height - 50);
        
        textElement.style.left = randomX + 'px';
        textElement.style.top = randomY + 'px';
        
        canvas.appendChild(textElement);
        this.textElements.push(textElement);
        
        // Make it draggable
        this.makeDraggable(textElement);
        
        // Add font change listener
        const fontSelect = textElement.querySelector('.font-select');
        fontSelect.addEventListener('change', (e) => {
            console.log('Font changed to:', e.target.value); // Debug log
            this.changeFont(textElement, e.target.value);
        });
        
        // Focus on the input
        const input = textElement.querySelector('input');
        input.focus();
        input.select();
    }
    
    makeDraggable(element) {
        const input = element.querySelector('input');
        
        element.addEventListener('mousedown', (e) => {
            if (e.target === input) return; // Don't drag when clicking on input
            
            this.isDragging = true;
            this.selectedElement = element;
            element.classList.add('selected');
            
            const rect = element.getBoundingClientRect();
            this.dragOffset.x = e.clientX - rect.left;
            this.dragOffset.y = e.clientY - rect.top;
            
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!this.isDragging || !this.selectedElement) return;
            
            const canvas = document.getElementById('memeCanvas');
            const canvasRect = canvas.getBoundingClientRect();
            
            let newX = e.clientX - canvasRect.left - this.dragOffset.x;
            let newY = e.clientY - canvasRect.top - this.dragOffset.y;
            
            // Keep element within canvas bounds
            const elementRect = this.selectedElement.getBoundingClientRect();
            const elementWidth = elementRect.width;
            const elementHeight = elementRect.height;
            
            newX = Math.max(0, Math.min(newX, canvasRect.width - elementWidth));
            newY = Math.max(0, Math.min(newY, canvasRect.height - elementHeight));
            
            this.selectedElement.style.left = newX + 'px';
            this.selectedElement.style.top = newY + 'px';
        });
        
        document.addEventListener('mouseup', () => {
            this.isDragging = false;
            if (this.selectedElement) {
                this.selectedElement.classList.remove('selected');
                this.selectedElement = null;
            }
        });
    }
    
    changeFont(element, fontClass) {
        console.log('Changing font to:', fontClass); // Debug log
        
        // Remove all font classes
        element.classList.remove('font-anton', 'font-bangers', 'font-great-vibes', 'font-tinos');
        // Add the selected font class
        element.classList.add(fontClass);
        
        // Also apply the font to the input element inside
        const input = element.querySelector('input');
        if (input) {
            const fontFamily = this.getFontFamily(fontClass);
            input.style.fontFamily = fontFamily;
            console.log('Applied font family:', fontFamily); // Debug log
        }
        
        // Force a reflow to ensure the change is applied
        element.offsetHeight;
    }
    
    getFontFamily(fontClass) {
        const fontMap = {
            'font-anton': "'Anton', sans-serif",
            'font-bangers': "'Bangers', cursive",
            'font-great-vibes': "'Great Vibes', cursive",
            'font-tinos': "'Tinos', serif"
        };
        return fontMap[fontClass] || "'Tinos', serif";
    }
    
    deleteTextElement(deleteBtn) {
        const textElement = deleteBtn.closest('.text-element');
        const index = this.textElements.indexOf(textElement);
        if (index > -1) {
            this.textElements.splice(index, 1);
        }
        textElement.remove();
    }
    
    async downloadMeme() {
        const canvas = document.getElementById('memeCanvas');
        const baseImage = document.getElementById('baseImage');
        
        // Create a canvas for rendering
        const canvasElement = document.createElement('canvas');
        const ctx = canvasElement.getContext('2d');
        
        // Set canvas size to match the base image
        canvasElement.width = baseImage.naturalWidth;
        canvasElement.height = baseImage.naturalHeight;
        
        // Draw the base image
        ctx.drawImage(baseImage, 0, 0);
        
        // Draw all text elements
        for (const textElement of this.textElements) {
            const input = textElement.querySelector('input');
            const text = input.value;
            if (!text.trim()) continue;
            
            // Get position relative to the canvas
            const canvasRect = canvas.getBoundingClientRect();
            const elementRect = textElement.getBoundingClientRect();
            
            const x = (elementRect.left - canvasRect.left) * (baseImage.naturalWidth / canvasRect.width);
            const y = (elementRect.top - canvasRect.top) * (baseImage.naturalHeight / canvasRect.height);
            
            // Get font properties
            const computedStyle = window.getComputedStyle(textElement);
            const fontSize = parseInt(computedStyle.fontSize) * (baseImage.naturalWidth / canvasRect.width);
            const fontFamily = computedStyle.fontFamily;
            const color = computedStyle.color;
            
            // Set font properties
            ctx.font = `${fontSize}px ${fontFamily}`;
            ctx.fillStyle = color;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            
            // Add text shadow
            ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
            ctx.shadowBlur = 2;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            
            // Draw the text
            ctx.fillText(text, x, y);
            
            // Reset shadow
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        }
        
        // Convert to blob and download
        canvasElement.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'meme.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 'image/png');
    }
}

// Initialize the meme maker when the page loads
let memeMaker;
document.addEventListener('DOMContentLoaded', () => {
    memeMaker = new MemeMaker();
});

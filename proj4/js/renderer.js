class Renderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        // Disable smoothing for pixel look
        this.ctx.imageSmoothingEnabled = false;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Helper to draw a pixel "rect"
    drawPixel(x, y, size, color) {
        this.ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
        this.ctx.fillRect(x, y, size, size);
    }

    draw(game) {
        const pet = game.pet;
        const time = game.time;
        const garden = game.garden;

        this.clear();

        // 1. Draw Day/Night Overlay Background
        // We can fill the canvas with a color based on time.phase and use 'multiply' or just alpha
        let overlayColor = 'rgba(0,0,0,0)';
        if (time.phase === 'EVENING') overlayColor = 'rgba(255, 100, 50, 0.2)'; // Orange tint
        else if (time.phase === 'NIGHT') overlayColor = 'rgba(0, 0, 50, 0.5)'; // Dark Blue tint

        // Save context to restore after overlay
        this.ctx.save();

        // Draw Pet first (under overlay? or overlay is global?)
        // Let's draw Pet first
        this.drawPet(pet, game.frame);

        // Draw Garden (Bottom)
        this.drawGarden(garden);

        // Apply Time Overlay
        this.ctx.fillStyle = overlayColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.restore();
    }

    drawGarden(garden) {
        const plotY = this.canvas.height - 60;
        const plotWidth = this.canvas.width / 3;

        garden.plots.forEach(plot => {
            const x = plot.id * plotWidth;

            // Draw Soil
            this.ctx.fillStyle = plot.watered ? '#5d4037' : '#8d6e63'; // Darker if watered
            this.ctx.fillRect(x + 5, plotY, plotWidth - 10, 50);

            // Draw Crop
            if (plot.crop) {
                const centerX = x + plotWidth / 2;
                const bottomY = plotY + 40;

                if (plot.state === 'READY') {
                    // Draw Fruit
                    if (plot.crop.type.includes('turnip')) {
                        this.drawRect(centerX - 5, bottomY - 10, 10, { r: 255, g: 255, b: 255 }); // White base
                        this.drawRect(centerX - 5, bottomY - 15, 10, { r: 200, g: 100, b: 200 }); // Purple top
                    } else {
                        this.drawRect(centerX - 8, bottomY - 12, 16, { r: 255, g: 150, b: 0 }); // Pumpkin Orange
                    }
                } else {
                    // Draw Seed/Sprout
                    const color = { r: 50, g: 200, b: 50 }; // Green
                    const size = plot.crop.stage === 0 ? 4 : 8; // Small or Big
                    this.drawRect(centerX - size / 2, bottomY - size, size, color);
                }
            }
        });
    }

    drawPet(pet, frame) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const scale = 8; // Pixel scale

        // Bounce animation
        const bounce = Math.sin(frame * 0.1) * 5;

        // Body color
        const color = pet.color;

        // Draw simple slime/blob shape
        // 10x10 grid relative to center
        //   . . X X X X . .
        //   . X X X X X X .
        //   X X X X X X X X
        //   X X X X X X X X
        //   X X X X X X X X
        //   . X X X X X X .
        //   . . X X X X . .

        // Simple procedural pixel art circle/blob
        const radius = 10;

        for (let y = -radius; y <= radius; y++) {
            for (let x = -radius; x <= radius; x++) {
                if (x * x + y * y < radius * radius - 2) {
                    // Main body
                    this.drawRect(centerX + x * scale, centerY + y * scale + bounce, scale, color);
                } else if (x * x + y * y < radius * radius) {
                    // Border (darker)
                    this.drawRect(centerX + x * scale, centerY + y * scale + bounce, scale, {
                        r: Math.max(0, color.r - 50),
                        g: Math.max(0, color.g - 50),
                        b: Math.max(0, color.b - 50)
                    });
                }
            }
        }

        // Eyes
        const eyeOffset = 3 * scale;
        const eyeY = centerY - 2 * scale + bounce;

        // Left Eye
        this.drawRect(centerX - eyeOffset, eyeY, scale, { r: 0, g: 0, b: 0 });
        // Right Eye
        this.drawRect(centerX + eyeOffset, eyeY, scale, { r: 0, g: 0, b: 0 });

        // Mouth (changes with happiness or hunger)
        const mouthY = centerY + 3 * scale + bounce;
        if (pet.happiness > 50) {
            // Smile
            this.drawRect(centerX - scale, mouthY, scale, { r: 0, g: 0, b: 0 });
            this.drawRect(centerX + scale, mouthY, scale, { r: 0, g: 0, b: 0 });
            this.drawRect(centerX, mouthY + scale, scale, { r: 0, g: 0, b: 0 });
        } else {
            // Flat or sad
            this.drawRect(centerX - scale, mouthY + scale, scale, { r: 0, g: 0, b: 0 });
            this.drawRect(centerX + scale, mouthY + scale, scale, { r: 0, g: 0, b: 0 });
            this.drawRect(centerX, mouthY + scale, scale, { r: 0, g: 0, b: 0 });
        }

        // Feature/Pattern rendering (simple icon on forehead/belly)
        if (pet.type === 'FIRE') {
            this.drawRect(centerX, centerY - 8 * scale + bounce, scale, { r: 255, g: 50, b: 50 });
        } else if (pet.type === 'WATER') {
            this.drawRect(centerX, centerY - 8 * scale + bounce, scale, { r: 50, g: 50, b: 255 });
        } else if (pet.type === 'GRASS') {
            this.drawRect(centerX, centerY - 8 * scale + bounce, scale, { r: 50, g: 200, b: 50 });
        }
    }

    drawRect(x, y, w, color) {
        this.ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
        this.ctx.fillRect(Math.floor(x), Math.floor(y), w, w);
    }
}

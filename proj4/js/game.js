// Imports removed for local execution compatibility

class Game {
    constructor() {
        this.time = new TimeManager();
        this.economy = new Economy();
        this.garden = new Garden();

        this.pet = new Pet();
        this.renderer = new Renderer('pet-canvas');
        this.ui = new UI(this);
        this.frame = 0;

        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);
    }

    loop() {
        // Logic Tick (every 60 frames approx)
        if (this.frame % 30 === 0) { // Faster ticks for smoother feel? Keep 30 for now
            this.time.tick();
            this.pet.tick();

            // Sync systems
            if (this.time.phase === 'NIGHT') {
                this.pet.isSleeping = true;
            } else {
                this.pet.isSleeping = false;
            }

            this.garden.tick();
            this.ui.update(this.pet, this.time, this.economy);
        }

        // New Day Logic trigger
        if (this.time.time === 600 && this.time.tickCounter === 0) {
            this.garden.newDay();
            this.pet.ageOneYear(); // Age +1 only on new day
            this.ui.showNotification("New Day! Crops dry, Pet aged +1");
            this.ui.update(this.pet, this.time, this.economy); // Force update to show age change
        }

        this.garden.tick();
        this.ui.update(this.pet, this.time, this.economy);

        this.renderer.draw(this); // Pass entire game state to renderer

        this.frame++;
        requestAnimationFrame(this.loop);
    }

    handleFeed() {
        // Prioritize Crops
        if (this.economy.inventory['pumpkin'] > 0) {
            this.economy.inventory['pumpkin']--;
            this.pet.feed(50); // Big boost
            this.ui.showNotification("Yum! Pumpkin pie!");
        } else if (this.economy.inventory['turnip'] > 0) {
            this.economy.inventory['turnip']--;
            this.pet.feed(25);
            this.ui.showNotification("Cronch! Turnip!");
        } else {
            // Basic fallback (survival)
            this.pet.feed(10);
            this.ui.showNotification("Fed dry biscuit...");
        }
        this.ui.update(this.pet, this.time, this.economy);
    }

    handleMinigame(choice) {
        const result = Minigame.play(choice);

        let coinReward = 0;
        if (result.result === 'WIN') coinReward = 15;
        if (result.result === 'TIE') coinReward = 5;

        if (coinReward > 0) {
            this.economy.coins += coinReward;
            this.ui.showNotification(`+${coinReward} Coins!`);
        }

        this.pet.play(result.result);
        this.ui.showMinigameResult(result);
        this.ui.update(this.pet, this.time, this.economy);
    }

    handleBreed() {
        // Generate random mate
        const mate = new Pet({
            color: Genetics.mixColor({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }), // Randomish
            type: Genetics.TYPES[Math.floor(Math.random() * Genetics.TYPES.length)],
            pattern: 'NONE'
        });

        // Actually random color for mate to be interesting
        mate.color = {
            r: Math.floor(Math.random() * 255),
            g: Math.floor(Math.random() * 255),
            b: Math.floor(Math.random() * 255)
        };

        const childDNA = {
            color: Genetics.mixColor(this.pet.color, mate.color),
            type: Genetics.mixType(this.pet.type, mate.type),
            pattern: Genetics.mixPattern(this.pet.pattern, mate.pattern)
        };

        this.ui.showBreedingResult(mate, childDNA);

        // Reset game with new child after delay
        setTimeout(() => {
            this.pet = new Pet(childDNA);
        }, 3000);
    }

    // Farm Actions
    handlePlotClick(plotId) {
        const plot = this.garden.plots[plotId];

        // 1. Harvest if ready
        if (plot.state === 'READY') {
            const item = this.garden.harvest(plotId);
            if (item) {
                this.economy.inventory[item] = (this.economy.inventory[item] || 0) + 1;
                this.ui.showNotification(`Harvested ${item} !`);
            }
            return;
        }

        // 2. Water if growing and dry
        if (plot.state !== 'EMPTY' && !plot.watered) {
            this.garden.water(plotId);
            this.ui.showNotification("Watered!"); // No energy cost for now
            return;
        }

        // 3. Plant if empty
        if (plot.state === 'EMPTY') {
            // Check inventory for seeds
            if (this.economy.inventory['turnip_seed'] > 0) {
                this.economy.inventory['turnip_seed']--;
                this.garden.plant(plotId, 'turnip_seed');
                this.ui.showNotification("Planted Turnip!");
            } else if (this.economy.inventory['pumpkin_seed'] > 0) {
                this.economy.inventory['pumpkin_seed']--;
                this.garden.plant(plotId, 'pumpkin_seed');
                this.ui.showNotification("Planted Pumpkin!");
            } else {
                this.ui.showNotification("No seeds!");
            }
        }
    }

    buyItem(itemId) {
        if (this.economy.buy(itemId)) {
            this.ui.showNotification("Purchased!");
            this.ui.updateShop(); // Refresh shop UI
        } else {
            this.ui.showNotification("Not enough money!");
        }
    }
}

// Start Game
window.game = new Game();

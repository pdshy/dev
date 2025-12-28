class Pet {
    constructor(dna = null) {
        if (dna) {
            this.color = dna.color;
            this.type = dna.type;
            this.pattern = dna.pattern;
        } else {
            // Default starter pet
            this.color = { r: 100, g: 200, b: 255 }; // Light Blue
            this.type = 'NORMAL';
            this.pattern = 'NONE';
        }

        this.hunger = 100; // 0-100, 100 is full
        this.happiness = 100; // 0-100
        this.energy = 100;
        this.age = 0; // In logic ticks
        this.stage = 'EGG'; // EGG, BABY, ADULT

        this.ageStageThresholds = {
            BABY: 10,  // Hatch quickly (10s)
            ADULT: 30  // Adult quickly (30s)
        };
    }

    tick() {
        // Decrease stats
        if (this.stage !== 'EGG') {
            this.hunger = Math.max(0, this.hunger - 0.05);

            if (this.hunger < 20) {
                this.happiness = Math.max(0, this.happiness - 0.1);
            }

            // Random boredom
            if (Math.random() < 0.01) {
                this.happiness = Math.max(0, this.happiness - 1);
            }
        }
    }

    // Age is now manual
    ageOneYear() {
        this.age++;
        // Growth logic
        if (this.stage === 'EGG' && this.age > this.ageStageThresholds.BABY) {
            this.stage = 'BABY';
        } else if (this.stage === 'BABY' && this.age > this.ageStageThresholds.ADULT) {
            this.stage = 'ADULT';
        }
    }

    feed() {
        if (this.stage === 'EGG') return;
        this.hunger = Math.min(100, this.hunger + 20);
        this.happiness = Math.min(100, this.happiness + 5);
    }

    play(result) {
        if (this.stage === 'EGG') return;

        this.energy = Math.max(0, this.energy - 10);

        if (result === 'WIN') {
            this.happiness = Math.min(100, this.happiness + 20);
        } else if (result === 'LOSS' || result === 'DRAW') {
            // Even a loss gives some happiness for interaction, but less
            this.happiness = Math.min(100, this.happiness + 5);
        }
    }
}

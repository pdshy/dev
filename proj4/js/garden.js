class Garden {
    constructor() {
        // 3 Plots
        this.plots = [
            { id: 0, crop: null, state: 'EMPTY', watered: false },
            { id: 1, crop: null, state: 'EMPTY', watered: false },
            { id: 2, crop: null, state: 'EMPTY', watered: false }
        ];

        this.cropTypes = {
            'turnip_seed': { name: 'Turnip', growTime: 200, output: 'turnip' }, // Fast
            'pumpkin_seed': { name: 'Pumpkin', growTime: 600, output: 'pumpkin' } // Slow
        };
    }

    plant(plotId, seedId) {
        const plot = this.plots[plotId];
        if (plot.state === 'EMPTY') {
            plot.crop = {
                type: seedId,
                progress: 0,
                maxProgress: this.cropTypes[seedId].growTime,
                stage: 0 // 0: Seed, 1: Sprout, 2: Mature
            };
            plot.state = 'GROWING';
            return true;
        }
        return false;
    }

    water(plotId) {
        const plot = this.plots[plotId];
        if (plot.state !== 'EMPTY') {
            plot.watered = true;
            return true;
        }
        return false;
    }

    harvest(plotId) {
        const plot = this.plots[plotId];
        if (plot.state === 'READY') {
            const product = this.cropTypes[plot.crop.type].output;
            // Reset plot
            plot.crop = null;
            plot.state = 'EMPTY';
            plot.watered = false;
            return product;
        }
        return null;
    }

    tick() {
        this.plots.forEach(plot => {
            if (plot.state === 'GROWING' && plot.crop) {
                // Growth logic: Needs water to grow? Let's say yes, 2x speed if watered
                let growth = 1;
                if (plot.watered) growth = 3;

                plot.crop.progress += growth;

                // Update Visual Stage
                if (plot.crop.progress >= plot.crop.maxProgress) {
                    plot.state = 'READY';
                } else if (plot.crop.progress > plot.crop.maxProgress / 2) {
                    plot.crop.stage = 1; // Sprout
                }
            }
        });
    }

    // Call this on new day to dry soil
    newDay() {
        this.plots.forEach(plot => plot.watered = false);
    }
}

class Economy {
    constructor() {
        this.coins = 100; // Starting money
        this.inventory = {
            'turnip_seed': 2,
            'pumpkin_seed': 0,
            'turnip': 0,
            'pumpkin': 0
        };

        this.shopItems = [
            { id: 'turnip_seed', name: 'Turnip Seed', price: 20, type: 'SEED' },
            { id: 'pumpkin_seed', name: 'Pumpkin Seed', price: 50, type: 'SEED' }
        ];

        this.sellPrices = {
            'turnip': 40,
            'pumpkin': 120
        };
    }

    buy(itemId) {
        const item = this.shopItems.find(i => i.id === itemId);
        if (item && this.coins >= item.price) {
            this.coins -= item.price;
            this.inventory[itemId] = (this.inventory[itemId] || 0) + 1;
            return true;
        }
        return false;
    }

    sell(itemId) {
        if (this.inventory[itemId] > 0 && this.sellPrices[itemId]) {
            this.inventory[itemId]--;
            this.coins += this.sellPrices[itemId];
            return true;
        }
        return false;
    }
}

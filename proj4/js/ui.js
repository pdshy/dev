class UI {
    constructor(game) {
        this.game = game;

        // Element caching
        this.gaugeHunger = document.getElementById('gauge-hunger');
        this.gaugeHappiness = document.getElementById('gauge-happiness');
        this.valueAge = document.getElementById('value-age');

        this.modalOverlay = document.getElementById('modal-overlay');
        this.modalTitle = document.getElementById('modal-title');
        this.minigameUI = document.getElementById('minigame-ui');
        this.breedUI = document.getElementById('breed-ui');
        this.minigameResult = document.getElementById('minigame-result');
        this.btnCloseModal = document.getElementById('btn-close-modal');

        // Buttons
        document.getElementById('btn-toggle-pet').addEventListener('click', () => this.togglePetView());
        document.getElementById('btn-feed').addEventListener('click', () => this.game.handleFeed());
        document.getElementById('btn-play').addEventListener('click', () => this.openMinigame());
        document.getElementById('btn-breed').addEventListener('click', () => this.openBreed());
        document.getElementById('btn-shop').addEventListener('click', () => this.openShop());

        this.btnCloseModal.addEventListener('click', () => this.closeModal());

        // Canvas Interaction for Farming
        const canvas = document.getElementById('pet-canvas');
        canvas.addEventListener('mousedown', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Check if click is in bottom area (Garden)
            // Canvas logic for plots (mapped to screen coordinates roughly for now)
            // Renderer will handle layout, let's say bottom 60px is 3 plots
            const plotY = canvas.height - 60;
            if (y > plotY) {
                const plotWidth = canvas.width / 3;
                const plotId = Math.floor(x / plotWidth);
                if (plotId >= 0 && plotId < 3) {
                    this.game.handlePlotClick(plotId);
                }
            }
        });

        // Minigame buttons
        document.querySelectorAll('.hand-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const choice = e.target.dataset.choice || e.target.parentElement.dataset.choice;
                this.game.handleMinigame(choice);
            });
        });
    }

    update(pet, time, economy) {
        this.gaugeHunger.style.width = `${pet.hunger}%`;
        this.gaugeHappiness.style.width = `${pet.happiness}%`;
        this.valueAge.textContent = `${pet.age} (${pet.stage})`;

        // Color changes for fun (low stat warning)
        if (pet.hunger < 20) this.gaugeHunger.style.background = '#ff0000';
        else this.gaugeHunger.style.background = '#ff6b6b';

        // Update HUD
        document.getElementById('hud-time').textContent = `DAY ${time.day} | ${time.getFormattedTime()}`;
        document.getElementById('hud-money').textContent = `💰 ${economy.coins}G`;
    }

    showNotification(msg) {
        // Simple console or overlay? Let's use the modal title area temporarily or create a toast?
        // Using modal title is distracting. Let's create a floaty text eventually.
        // For now, console log and maybe a dedicated HUD area
        const notif = document.getElementById('notification-area');
        if (notif) {
            notif.textContent = msg;
            notif.style.opacity = 1;
            setTimeout(() => notif.style.opacity = 0, 2000);
        }
    }

    openShop() {
        this.showModal('SHOP');
        this.minigameUI.classList.add('hidden');
        this.breedUI.classList.add('hidden');
        this.btnCloseModal.classList.remove('hidden');

        const shopContainer = document.createElement('div');
        shopContainer.id = 'shop-ui';
        shopContainer.innerHTML = '';

        this.game.economy.shopItems.forEach(item => {
            const div = document.createElement('div');
            div.style.margin = '10px';
            div.innerHTML = `
                <span>${item.name} (${item.price}G)</span>
                <button onclick="game.buyItem('${item.id}')">BUY</button>
            `;
            shopContainer.appendChild(div);
        });

        // Inventory View
        const invDiv = document.createElement('div');
        invDiv.innerHTML = '<hr><h3>INVENTORY</h3>';
        for (let k in this.game.economy.inventory) {
            invDiv.innerHTML += `<p>${k}: ${this.game.economy.inventory[k]}</p>`;
        }
        shopContainer.appendChild(invDiv);

        // Replace content
        // Clean up previous shop injections if any (simple hack for now)
        const existing = this.modalTitle.parentElement.querySelector('#shop-ui');
        if (existing) existing.remove();

        this.modalTitle.parentElement.insertBefore(shopContainer, this.btnCloseModal);
    }

    updateShop() {
        // Re-render if open? 
        if (!this.modalOverlay.classList.contains('hidden') && this.modalTitle.textContent === 'SHOP') {
            this.openShop();
        }
    }

    openMinigame() {
        this.showModal('MINIGAME');
        this.minigameUI.classList.remove('hidden');
        this.breedUI.classList.add('hidden');
        this.minigameResult.textContent = 'CHOOSE YOUR HAND';
        this.btnCloseModal.classList.add('hidden'); // Force play to exit? Or allow close. Let's allow close.
        this.btnCloseModal.classList.remove('hidden');
    }

    openBreed() {
        if (this.game.pet.stage !== 'ADULT') {
            alert("Your pet is too young to breed!");
            return;
        }
        this.showModal('BREEDING');
        this.minigameUI.classList.add('hidden');
        this.breedUI.classList.remove('hidden');
        this.breedUI.innerHTML = '<p>Finding a mate...</p>';
        this.btnCloseModal.classList.add('hidden');

        // Simulate search delay
        setTimeout(() => {
            this.game.handleBreed();
        }, 2000);
    }

    showModal(title) {
        this.modalOverlay.classList.remove('hidden');
        this.modalTitle.textContent = title;
    }

    closeModal() {
        this.modalOverlay.classList.add('hidden');
    }

    showMinigameResult(result) {
        let msg = '';
        if (result.result === 'WIN') msg = 'YOU WON! (+20 HAP)';
        else if (result.result === 'LOSS') msg = 'YOU LOST... (+5 HAP)';
        else msg = 'DRAW! TRY AGAIN';

        this.minigameResult.textContent = `You: ${result.player} vs CPU: ${result.cpu} -> ${msg}`;
    }

    showBreedingResult(mate, child) {
        this.breedUI.innerHTML = `
            <p>Mate Found!</p>
            <div style="display:flex; justify-content:center; gap:10px; margin: 10px;">
                <div style="width:20px; height:20px; background:rgb(${mate.color.r},${mate.color.g},${mate.color.b})"></div>
                <span>+</span>
                <div style="width:20px; height:20px; background:rgb(${this.game.pet.color.r},${this.game.pet.color.g},${this.game.pet.color.b})"></div>
            </div>
            <p>A new egg is born!</p>
        `;
        setTimeout(() => {
            this.closeModal();
        }, 3000);
    }

    togglePetView() {
        const canvas = document.getElementById('pet-canvas');
        if (canvas.style.display === 'none' || getComputedStyle(canvas).display === 'none') {
            canvas.style.display = 'block';
        } else {
            canvas.style.display = 'none';
        }
    }
}

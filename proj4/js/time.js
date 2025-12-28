class TimeManager {
    constructor() {
        this.time = 0; // 0 - 2400 (Hours * 100)
        this.day = 1;
        this.phase = 'MORNING'; // MORNING, NOON, EVENING, NIGHT
        this.tickCounter = 0;
        this.ticksPerMinute = 2; // How fast time passes
    }

    tick() {
        this.tickCounter++;
        if (this.tickCounter >= 10) { // Slower time (Every 10 logic ticks = 10 mins)
            this.time += 10; // +10 minutes
            this.tickCounter = 0;
        }

        if (this.time >= 2400) {
            this.time = 600; // Reset to 6 AM (Skip sleeping time logic handled elsewhere)
            this.day++;
        }

        this.updatePhase();
    }

    updatePhase() {
        if (this.time >= 600 && this.time < 1200) this.phase = 'MORNING';
        else if (this.time >= 1200 && this.time < 1700) this.phase = 'NOON';
        else if (this.time >= 1700 && this.time < 2000) this.phase = 'EVENING';
        else this.phase = 'NIGHT';
    }

    getFormattedTime() {
        let hour = Math.floor(this.time / 100);
        let minute = this.time % 100;
        let ampm = hour >= 12 ? 'PM' : 'AM';
        if (hour > 12) hour -= 12;
        if (hour === 0) hour = 12; // 00:00 -> 12 AM logic if needed, but we reset to 600
        return `${hour}:${minute.toString().padStart(2, '0')} ${ampm}`;
    }
}

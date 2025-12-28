class Minigame {
    static CHOICES = ['rock', 'paper', 'scissors'];

    static play(playerChoice) {
        const cpuChoice = this.CHOICES[Math.floor(Math.random() * this.CHOICES.length)];
        let result = 'DRAW';

        if (
            (playerChoice === 'rock' && cpuChoice === 'scissors') ||
            (playerChoice === 'paper' && cpuChoice === 'rock') ||
            (playerChoice === 'scissors' && cpuChoice === 'paper')
        ) {
            result = 'WIN';
        } else if (playerChoice !== cpuChoice) {
            result = 'LOSS';
        }

        return {
            player: playerChoice,
            cpu: cpuChoice,
            result: result
        };
    }
}

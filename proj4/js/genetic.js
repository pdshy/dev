class Genetics {
    static TYPES = ['NORMAL', 'FIRE', 'WATER', 'GRASS'];
    static PATTERNS = ['NONE', 'SPOTS', 'STRIPES', 'HEART'];

    static mixColor(c1, c2) {
        // Parse RGB objects or strings if necessary, assuming {r, g, b} objects
        const mutationChance = 0.15;

        if (Math.random() < mutationChance) {
            // Mutation: Random bright pastel color
            return {
                r: Math.floor(Math.random() * 100) + 155,
                g: Math.floor(Math.random() * 100) + 155,
                b: Math.floor(Math.random() * 100) + 155
            };
        }

        // Average
        return {
            r: Math.floor((c1.r + c2.r) / 2),
            g: Math.floor((c1.g + c2.g) / 2),
            b: Math.floor((c1.b + c2.b) / 2)
        };
    }

    static mixType(t1, t2) {
        if (t1 === t2) return t1;
        // Rare fusion chance ? For now random parent
        return Math.random() < 0.5 ? t1 : t2;
    }

    static mixPattern(p1, p2) {
        // 10% chance for new pattern if parents have none
        if (p1 === 'NONE' && p2 === 'NONE') {
            return Math.random() < 0.1 ? this.PATTERNS[Math.floor(Math.random() * this.PATTERNS.length)] : 'NONE';
        }
        return Math.random() < 0.5 ? p1 : p2;
    }
}

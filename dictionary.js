let DICTIONARY = new Set();

async function loadDictionary() {
    try {
        const response = await fetch('dictionary.txt');
        const text = await response.text();
        const words = text.split('\n').map(word => word.trim().toUpperCase()).filter(word => word.length >= 3);
        DICTIONARY = new Set(words);
        console.log(`Dictionary loaded with ${DICTIONARY.size} words`);
    } catch (error) {
        console.error('Failed to load dictionary:', error);
        // Fallback to a basic set of common words if dictionary fails to load
        DICTIONARY = new Set([
            'THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'CAN', 'HER', 'WAS', 'ONE', 'OUR', 'OUT', 'HIS', 'HAS', 'HAD',
            'CAT', 'DOG', 'RUN', 'SIT', 'EAT', 'TOP', 'RED', 'BOX', 'FUN', 'SUN', 'BAT', 'HAT', 'MAT', 'RAT', 'SAT', 'FAT'
        ]);
    }
}

// Load dictionary when the script loads
loadDictionary();
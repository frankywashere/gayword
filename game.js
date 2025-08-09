let gameState = {
    score: 0,
    timer: 60,
    streak: 0,
    bestStreak: 0,
    isPlaying: false,
    selectedTiles: [],
    currentWord: '',
    foundWords: new Set(),
    grid: [],
    timerInterval: null,
    touchStartTile: null,
    isDragging: false
};

const GRID_SIZE = 4;
const LETTER_FREQUENCIES = {
    'E': 12, 'A': 9, 'I': 9, 'O': 8, 'N': 7, 'R': 6, 'T': 6, 'L': 5, 'S': 5,
    'U': 4, 'D': 4, 'G': 3, 'B': 2, 'C': 3, 'M': 3, 'P': 2, 'F': 2, 'H': 2,
    'V': 1, 'W': 2, 'Y': 2, 'K': 1, 'J': 1, 'X': 1, 'Q': 1, 'Z': 1
};

const LETTER_VALUES = {
    'E': 1, 'A': 1, 'I': 1, 'O': 1, 'N': 1, 'R': 1, 'T': 1, 'L': 1, 'S': 1,
    'U': 2, 'D': 2, 'G': 2, 'B': 3, 'C': 3, 'M': 3, 'P': 3, 'F': 4, 'H': 4,
    'V': 4, 'W': 4, 'Y': 4, 'K': 5, 'J': 8, 'X': 8, 'Q': 10, 'Z': 10
};

function getWeightedRandomLetter() {
    const vowels = ['A', 'E', 'I', 'O', 'U'];
    const consonants = Object.keys(LETTER_FREQUENCIES).filter(l => !vowels.includes(l));
    
    if (Math.random() < 0.4) {
        return vowels[Math.floor(Math.random() * vowels.length)];
    }
    
    let totalWeight = 0;
    for (let letter in LETTER_FREQUENCIES) {
        if (!vowels.includes(letter)) {
            totalWeight += LETTER_FREQUENCIES[letter];
        }
    }
    
    let random = Math.random() * totalWeight;
    let currentWeight = 0;
    
    for (let letter of consonants) {
        currentWeight += LETTER_FREQUENCIES[letter];
        if (random <= currentWeight) {
            return letter;
        }
    }
    
    return consonants[0];
}

function initializeGrid() {
    const gridElement = document.getElementById('grid');
    gridElement.innerHTML = '';
    gameState.grid = [];
    
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
        const letter = getWeightedRandomLetter();
        const value = LETTER_VALUES[letter];
        
        gameState.grid.push({ letter, value, index: i });
        
        const tile = document.createElement('div');
        tile.className = 'letter-tile';
        tile.dataset.index = i;
        tile.innerHTML = `
            ${letter}
            <span class="letter-value">${value}</span>
        `;
        
        gridElement.appendChild(tile);
    }
    
    addTouchEvents();
}

function getTileElement(index) {
    return document.querySelector(`[data-index="${index}"]`);
}

function getNeighbors(index) {
    const row = Math.floor(index / GRID_SIZE);
    const col = index % GRID_SIZE;
    const neighbors = [];
    
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            
            const newRow = row + dr;
            const newCol = col + dc;
            
            if (newRow >= 0 && newRow < GRID_SIZE && newCol >= 0 && newCol < GRID_SIZE) {
                neighbors.push(newRow * GRID_SIZE + newCol);
            }
        }
    }
    
    return neighbors;
}

function isValidMove(fromIndex, toIndex) {
    return getNeighbors(fromIndex).includes(toIndex);
}

function selectTile(index) {
    if (gameState.selectedTiles.includes(index)) return false;
    
    if (gameState.selectedTiles.length > 0) {
        const lastIndex = gameState.selectedTiles[gameState.selectedTiles.length - 1];
        if (!isValidMove(lastIndex, index)) return false;
    }
    
    gameState.selectedTiles.push(index);
    gameState.currentWord += gameState.grid[index].letter;
    
    const tile = getTileElement(index);
    tile.classList.add('selected');
    
    updateCurrentWordDisplay();
    drawConnection();
    
    return true;
}

function drawConnection() {
    const canvas = document.getElementById('trail-canvas');
    const ctx = canvas.getContext('2d');
    
    if (gameState.selectedTiles.length < 2) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }
    
    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width;
        canvas.height = rect.height;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    
    for (let i = 0; i < gameState.selectedTiles.length; i++) {
        const tile = getTileElement(gameState.selectedTiles[i]);
        const tileRect = tile.getBoundingClientRect();
        const x = tileRect.left + tileRect.width / 2 - rect.left;
        const y = tileRect.top + tileRect.height / 2 - rect.top;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    
    ctx.stroke();
}

function clearSelection() {
    gameState.selectedTiles.forEach(index => {
        const tile = getTileElement(index);
        tile.classList.remove('selected');
    });
    
    gameState.selectedTiles = [];
    gameState.currentWord = '';
    
    const canvas = document.getElementById('trail-canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    updateCurrentWordDisplay();
}

function updateCurrentWordDisplay() {
    const display = document.getElementById('current-word');
    display.textContent = gameState.currentWord;
    display.classList.remove('valid', 'invalid');
    
    if (gameState.currentWord.length >= 3) {
        if (isValidWord(gameState.currentWord)) {
            display.classList.add('valid');
        } else {
            display.classList.add('invalid');
        }
    }
}

function isValidWord(word) {
    return DICTIONARY.has(word.toUpperCase());
}

function submitWord() {
    const word = gameState.currentWord;
    
    if (word.length < 3) {
        clearSelection();
        return;
    }
    
    if (gameState.foundWords.has(word)) {
        clearSelection();
        return;
    }
    
    if (!isValidWord(word)) {
        gameState.streak = 0;
        updateStreak();
        clearSelection();
        return;
    }
    
    let wordScore = 0;
    gameState.selectedTiles.forEach(index => {
        wordScore += gameState.grid[index].value;
    });
    
    const lengthBonus = word.length >= 5 ? (word.length - 4) * 10 : 0;
    const streakBonus = gameState.streak * 5;
    const totalScore = wordScore + lengthBonus + streakBonus;
    
    gameState.score += totalScore;
    gameState.streak++;
    gameState.foundWords.add(word);
    
    if (gameState.streak > gameState.bestStreak) {
        gameState.bestStreak = gameState.streak;
    }
    
    updateScore();
    updateStreak();
    addFoundWord(word);
    showBonusPoints(totalScore);
    
    if (word.length > (document.getElementById('best-word').textContent === '-' ? 0 : 
        document.getElementById('best-word').textContent.length)) {
        document.getElementById('best-word').textContent = word;
    }
    
    clearSelection();
}


function showMessage(text) {
    const msgElement = document.createElement('div');
    msgElement.className = 'message-popup';
    msgElement.textContent = text;
    msgElement.style.left = '50%';
    msgElement.style.top = '30%';
    msgElement.style.transform = 'translate(-50%, -50%)';
    document.body.appendChild(msgElement);
    
    setTimeout(() => msgElement.remove(), 500);
}

function showBonusPoints(points) {
    const bonusElement = document.createElement('div');
    bonusElement.className = 'bonus-points';
    bonusElement.textContent = `+${points}`;
    bonusElement.style.left = '50%';
    bonusElement.style.top = '45%';
    bonusElement.style.transform = 'translateX(-50%)';
    document.body.appendChild(bonusElement);
    
    setTimeout(() => bonusElement.remove(), 600);
}

function updateScore() {
    document.getElementById('score').textContent = gameState.score;
}

function updateStreak() {
    document.getElementById('streak').textContent = gameState.streak;
}

function addFoundWord(word) {
    const container = document.getElementById('found-words');
    const wordElement = document.createElement('div');
    wordElement.className = 'found-word';
    wordElement.textContent = word;
    container.insertBefore(wordElement, container.firstChild);
}

function startTimer() {
    gameState.timerInterval = setInterval(() => {
        gameState.timer--;
        document.getElementById('timer').textContent = gameState.timer;
        
        if (gameState.timer <= 0) {
            endGame();
        }
    }, 1000);
}

function endGame() {
    clearInterval(gameState.timerInterval);
    gameState.isPlaying = false;
    
    document.getElementById('final-score').textContent = gameState.score;
    document.getElementById('words-found').textContent = gameState.foundWords.size;
    document.getElementById('longest-word').textContent = 
        document.getElementById('best-word').textContent;
    document.getElementById('best-streak').textContent = gameState.bestStreak;
    
    document.getElementById('game-over-modal').style.display = 'flex';
}

function startGame() {
    gameState = {
        score: 0,
        timer: 60,
        streak: 0,
        bestStreak: 0,
        isPlaying: true,
        selectedTiles: [],
        currentWord: '',
        foundWords: new Set(),
            grid: [],
        timerInterval: null,
        touchStartTile: null,
        isDragging: false
    };
    
    document.getElementById('score').textContent = '0';
    document.getElementById('timer').textContent = '60';
    document.getElementById('streak').textContent = '0';
    document.getElementById('best-word').textContent = '-';
    document.getElementById('current-word').textContent = '';
    document.getElementById('found-words').innerHTML = '';
    document.getElementById('game-over-modal').style.display = 'none';
    document.getElementById('start-screen').style.display = 'none';
    
    initializeGrid();
    startTimer();
}

function addTouchEvents() {
    const gridElement = document.getElementById('grid');
    const tiles = gridElement.querySelectorAll('.letter-tile');
    
    tiles.forEach(tile => {
        tile.addEventListener('touchstart', handleTouchStart, { passive: false });
        tile.addEventListener('touchmove', handleTouchMove, { passive: false });
        tile.addEventListener('touchend', handleTouchEnd, { passive: false });
        
        tile.addEventListener('mousedown', handleMouseDown);
        tile.addEventListener('mouseenter', handleMouseEnter);
    });
    
    document.addEventListener('mouseup', handleMouseUp);
}

function handleTouchStart(e) {
    e.preventDefault();
    if (!gameState.isPlaying) return;
    
    const index = parseInt(e.target.closest('.letter-tile').dataset.index);
    gameState.touchStartTile = index;
    gameState.isDragging = true;
    selectTile(index);
}

function handleTouchMove(e) {
    e.preventDefault();
    if (!gameState.isPlaying || !gameState.isDragging) return;
    
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (element && element.classList.contains('letter-tile')) {
        const index = parseInt(element.dataset.index);
        if (index !== gameState.touchStartTile) {
            selectTile(index);
            gameState.touchStartTile = index;
        }
    }
}

function handleTouchEnd(e) {
    e.preventDefault();
    if (!gameState.isPlaying) return;
    
    gameState.isDragging = false;
    submitWord();
}

function handleMouseDown(e) {
    if (!gameState.isPlaying) return;
    
    const index = parseInt(e.target.closest('.letter-tile').dataset.index);
    gameState.isDragging = true;
    selectTile(index);
}

function handleMouseEnter(e) {
    if (!gameState.isPlaying || !gameState.isDragging) return;
    
    const index = parseInt(e.target.closest('.letter-tile').dataset.index);
    selectTile(index);
}

function handleMouseUp() {
    if (!gameState.isPlaying || !gameState.isDragging) return;
    
    gameState.isDragging = false;
    submitWord();
}

window.addEventListener('load', () => {
    const gridElement = document.getElementById('grid');
    gridElement.addEventListener('contextmenu', e => e.preventDefault());
});
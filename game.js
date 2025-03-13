let board = [];
let score = 0;
let playerName = '';
let gameStarted = false;
let highScores = [];

// Load high scores from localStorage
function loadHighScores() {
    const savedScores = localStorage.getItem('highScores');
    highScores = savedScores ? JSON.parse(savedScores) : [];
    updateHighScoresList();
}

// Save high scores to localStorage
function saveHighScore() {
    highScores.push({
        name: playerName,
        score: score,
        date: new Date().toLocaleDateString()
    });

    // Sort by score (highest first) and keep only top 10
    highScores.sort((a, b) => b.score - a.score);
    if (highScores.length > 10) {
        highScores = highScores.slice(0, 10);
    }

    localStorage.setItem('highScores', JSON.stringify(highScores));
    updateHighScoresList();
}

// Update the high scores display
function updateHighScoresList() {
    const list = document.getElementById('high-scores-list');
    list.innerHTML = '';

    highScores.forEach((entry, index) => {
        const div = document.createElement('div');
        div.className = 'high-score-entry';
        div.innerHTML = `
            <span>${index + 1}. ${entry.name}</span>
            <span>${entry.score} (${entry.date})</span>
        `;
        list.appendChild(div);
    });
}

// Clear all high scores
function clearHighScores() {
    if (confirm('Are you sure you want to clear all high scores?')) {
        highScores = [];
        localStorage.removeItem('highScores');
        updateHighScoresList();
        document.getElementById('high-score').textContent = '0';
    }
}

// Initialize the game board
function initBoard() {
    board = Array(4).fill().map(() => Array(4).fill(0));
    addNewTile();
    addNewTile();
    updateDisplay();
}

// Add a new tile (2 or 4) to a random empty cell
function addNewTile() {
    const emptyCells = [];
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (board[i][j] === 0) {
                emptyCells.push({ x: i, y: j });
            }
        }
    }
    if (emptyCells.length > 0) {
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        board[randomCell.x][randomCell.y] = Math.random() < 0.9 ? 2 : 4;
    }
}

// Update the display
function updateDisplay() {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            if (board[i][j] !== 0) {
                tile.textContent = board[i][j];
                tile.setAttribute('data-value', board[i][j]);
            }
            gameBoard.appendChild(tile);
        }
    }
    document.getElementById('score').textContent = score;
    document.getElementById('player-name').textContent = playerName;
}

// Move tiles in a direction
function moveTiles(direction) {
    if (!gameStarted) return;

    let moved = false;
    const newBoard = JSON.parse(JSON.stringify(board));

    function merge(arr) {
        const merged = [];
        for (let i = 0; i < arr.length; i++) {
            if (i < arr.length - 1 && arr[i] === arr[i + 1]) {
                merged.push(arr[i] * 2);
                score += arr[i] * 2;
                i++;
            } else if (arr[i] !== 0) {
                merged.push(arr[i]);
            }
        }
        while (merged.length < 4) {
            merged.push(0);
        }
        return merged;
    }

    // Process each row/column based on direction
    for (let i = 0; i < 4; i++) {
        let line = [];
        for (let j = 0; j < 4; j++) {
            switch (direction) {
                case 'ArrowLeft':
                    line.push(board[i][j]);
                    break;
                case 'ArrowRight':
                    line.push(board[i][3 - j]);
                    break;
                case 'ArrowUp':
                    line.push(board[j][i]);
                    break;
                case 'ArrowDown':
                    line.push(board[3 - j][i]);
                    break;
            }
        }

        // Remove zeros and merge
        line = line.filter(x => x !== 0);
        line = merge(line);
        while (line.length < 4) {
            direction === 'ArrowLeft' || direction === 'ArrowUp' ?
                line.push(0) : line.unshift(0);
        }

        // Update the board
        for (let j = 0; j < 4; j++) {
            switch (direction) {
                case 'ArrowLeft':
                    newBoard[i][j] = line[j];
                    break;
                case 'ArrowRight':
                    newBoard[i][3 - j] = line[j];
                    break;
                case 'ArrowUp':
                    newBoard[j][i] = line[j];
                    break;
                case 'ArrowDown':
                    newBoard[3 - j][i] = line[j];
                    break;
            }
        }
    }

    // Check if the board changed
    moved = JSON.stringify(board) !== JSON.stringify(newBoard);
    if (moved) {
        board = newBoard;
        addNewTile();
        updateDisplay();
        checkGameOver();
        updateHighScore();
    }
}

// Check if game is over
function checkGameOver() {
    // Check for empty cells
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (board[i][j] === 0) return false;
        }
    }

    // Check for possible merges
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (i < 3 && board[i][j] === board[i + 1][j]) return false;
            if (j < 3 && board[i][j] === board[i][j + 1]) return false;
        }
    }

    // Game is over
    saveHighScore();
    const playAgain = confirm(`Game Over! Final score: ${score}\n\nWould you like to play again?`);
    if (playAgain) {
        restartGame();
    }
    return true;
}

// Restart game function
function restartGame() {
    score = 0;
    board = Array(4).fill().map(() => Array(4).fill(0));
    addNewTile();
    addNewTile();
    updateDisplay();
}

// Update high score
function updateHighScore() {
    const currentHighScore = parseInt(document.getElementById('high-score').textContent);
    if (score > currentHighScore) {
        document.getElementById('high-score').textContent = score;
        // Save high score to localStorage
        localStorage.setItem('highScore', score);
    }
}

// Start the game
function startGame() {
    const nameInput = document.getElementById('player-name-input');
    playerName = nameInput.value.trim();

    if (playerName === '') {
        alert('Please enter your name!');
        return;
    }

    // Hide name input container
    document.getElementById('name-input-container').style.display = 'none';

    // Initialize game
    score = 0;
    gameStarted = true;
    initBoard();

    // Load high scores
    loadHighScores();
}

// Handle keyboard events
document.addEventListener('keydown', (event) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
        moveTiles(event.key);
    }
}); 
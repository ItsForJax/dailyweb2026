const gameBoard = document.getElementById('gameBoard');
const moveCountEl = document.getElementById('moveCount');
const finalMovesEl = document.getElementById('finalMoves');
const winMessage = document.getElementById('winMessage');
const resetBtn = document.getElementById('resetBtn');

const emojis = ['🎮', '🎲', '🎯', '🎪', '🎨', '🎭', '🎵', '🎸'];

let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let canFlip = true;

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function createCard(emoji, index) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.emoji = emoji;
    card.dataset.index = index;

    card.innerHTML = `
        <div class="card-inner">
            <div class="card-back"></div>
            <div class="card-front">${emoji}</div>
        </div>
    `;

    card.addEventListener('click', () => flipCard(card));
    return card;
}

function flipCard(card) {
    if (!canFlip) return;
    if (card.classList.contains('flipped')) return;
    if (card.classList.contains('matched')) return;
    if (flippedCards.length >= 2) return;

    card.classList.add('flipped');
    flippedCards.push(card);

    if (flippedCards.length === 2) {
        moves++;
        moveCountEl.textContent = moves;
        checkMatch();
    }
}

function checkMatch() {
    canFlip = false;
    const [card1, card2] = flippedCards;

    if (card1.dataset.emoji === card2.dataset.emoji) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        matchedPairs++;
        flippedCards = [];
        canFlip = true;

        if (matchedPairs === emojis.length) {
            setTimeout(() => {
                finalMovesEl.textContent = moves;
                winMessage.classList.remove('hidden');
            }, 500);
        }
    } else {
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            flippedCards = [];
            canFlip = true;
        }, 1000);
    }
}

function initGame() {
    gameBoard.innerHTML = '';
    cards = [];
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    canFlip = true;
    moveCountEl.textContent = '0';
    winMessage.classList.add('hidden');

    const cardPairs = [...emojis, ...emojis];
    shuffle(cardPairs);

    cardPairs.forEach((emoji, index) => {
        const card = createCard(emoji, index);
        cards.push(card);
        gameBoard.appendChild(card);
    });
}

resetBtn.addEventListener('click', initGame);

initGame();

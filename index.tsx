// --- DOM Elements ---
const mainMenuContainer = document.getElementById('main-menu-container') as HTMLDivElement;
const createContainer = document.getElementById('create-container') as HTMLDivElement;
const gameContainer = document.getElementById('game-container') as HTMLDivElement;

const startGameBtn = document.getElementById('start-game-btn') as HTMLButtonElement;
const createWordsBtn = document.getElementById('create-words-btn') as HTMLButtonElement;

const wordInput = document.getElementById('word-input') as HTMLInputElement;
const addWordBtn = document.getElementById('add-word-btn') as HTMLButtonElement;
const wordList = document.getElementById('word-list') as HTMLUListElement;
const saveWordsBtn = document.getElementById('save-words-btn') as HTMLButtonElement;

const wordDisplay = document.getElementById('word-display') as HTMLDivElement;
const nextBtn = document.getElementById('next-btn') as HTMLButtonElement;
const prevBtn = document.getElementById('prev-btn') as HTMLButtonElement;
const answerBtn = document.getElementById('answer-btn') as HTMLButtonElement;
const homeBtn = document.getElementById('home-btn') as HTMLButtonElement;
const stepIndicator = document.getElementById('step-indicator') as HTMLDivElement;
const questionIndicator = document.getElementById('question-indicator') as HTMLDivElement;
const fireworksContainer = document.getElementById('fireworks-container') as HTMLDivElement;


// --- Game State ---
let words: string[] = [];
let tempWords: string[] = [];
let currentWordIndex = 0;
let currentLevel = 0;
let isGameFinished = false;

// Multipliers for spacing characters from the center using translateX.
// 0 = perfect overlap, 1.0 = normal spacing.
const SPACING_MULTIPLIERS = [0, 0.15, 0.3, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6]; // 10 stages
const WORD_STORAGE_KEY = 'geulgyeob-words';

// --- Functions ---

/**
 * Hides all screens and shows the one with the specified ID.
 * @param screenId The ID of the screen to show.
 */
function showScreen(screenId: 'main' | 'create' | 'game') {
    mainMenuContainer.classList.add('hidden');
    createContainer.classList.add('hidden');
    gameContainer.classList.add('hidden');

    switch (screenId) {
        case 'main':
            mainMenuContainer.classList.remove('hidden');
            break;
        case 'create':
            createContainer.classList.remove('hidden');
            break;
        case 'game':
            gameContainer.classList.remove('hidden');
            break;
    }
}

/**
 * Loads words from localStorage into the game state.
 */
function loadWords() {
    const storedWords = localStorage.getItem(WORD_STORAGE_KEY);
    if (storedWords) {
        words = JSON.parse(storedWords);
    }
}

/**
 * Saves the current list of words to localStorage.
 */
function saveWords() {
    localStorage.setItem(WORD_STORAGE_KEY, JSON.stringify(words));
}

/**
 * Renders the temporary word list in the create screen.
 */
function renderTempWordList() {
    wordList.innerHTML = '';
    tempWords.forEach((word, index) => {
        const li = document.createElement('li');
        li.textContent = word;
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'x';
        removeBtn.ariaLabel = `${word} 삭제`;
        removeBtn.onclick = () => {
            tempWords.splice(index, 1);
            renderTempWordList();
        };
        li.appendChild(removeBtn);
        wordList.appendChild(li);
    });
}

/**
 * Updates the word display with the current word and spacing level.
 */
function updateWordDisplay() {
    fireworksContainer.innerHTML = '';
    if (isGameFinished) {
        wordDisplay.innerHTML = `<div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%);">끝</div>`;
        stepIndicator.classList.add('hidden');
        questionIndicator.classList.add('hidden');
        nextBtn.textContent = '메인화면으로';
        prevBtn.classList.add('hidden');
        answerBtn.classList.add('hidden');
        return;
    }

    stepIndicator.classList.remove('hidden');
    questionIndicator.classList.remove('hidden');
    answerBtn.classList.remove('hidden');

    if (words.length === 0 || currentWordIndex >= words.length) {
        isGameFinished = true;
        updateWordDisplay();
        return;
    }
    
    const currentWord = words[currentWordIndex];
    wordDisplay.innerHTML = ''; // Clear previous content

    const characters = currentWord.split('');
    const middleIndex = (characters.length - 1) / 2;
    const spacingMultiplier = SPACING_MULTIPLIERS[currentLevel];

    characters.forEach((char, index) => {
        const span = document.createElement('span');
        span.textContent = char;
        
        const offset = (index - middleIndex) * spacingMultiplier;
        span.style.transform = `translate(-50%, -50%) translateX(${offset}ch)`;
        
        wordDisplay.appendChild(span);
    });

    stepIndicator.textContent = `${currentLevel + 1}단계`;
    questionIndicator.textContent = `${currentWordIndex + 1}번 문제`;

    if (currentLevel === SPACING_MULTIPLIERS.length - 1) {
        nextBtn.textContent = '다음 문항';
    } else {
        nextBtn.textContent = '다음';
    }

    if (currentWordIndex === 0 && currentLevel === 0) {
        prevBtn.classList.add('hidden');
    } else {
        prevBtn.classList.remove('hidden');
    }
}

/**
 * Starts the game.
 */
function startGame() {
    if (words.length === 0) {
        alert('먼저 "제작" 메뉴에서 단어를 추가해주세요!');
        showScreen('create');
        return;
    }
    isGameFinished = false;
    currentWordIndex = 0;
    currentLevel = 0;
    updateWordDisplay();
    showScreen('game');
}


/**
 * Moves the game to the next question.
 */
function goToNextQuestion() {
    currentLevel = 0;
    currentWordIndex++;
    if (currentWordIndex >= words.length) {
        isGameFinished = true;
    }
    updateWordDisplay();
}

/**
 * Creates and triggers the fireworks animation.
 */
function createFireworks() {
    fireworksContainer.innerHTML = ''; // Clear previous
    const NUM_PARTICLES = 30;
    const COLORS = ['#ff3b30', '#ff9500', '#ffcc00', '#34c759', '#007aff', '#5856d6', '#af52de'];

    for (let i = 0; i < NUM_PARTICLES; i++) {
        const particle = document.createElement('div');
        particle.classList.add('firework');
        
        const angle = Math.random() * 360;
        const distance = Math.random() * 100 + 50;
        const x = Math.cos(angle * Math.PI / 180) * distance;
        const y = Math.sin(angle * Math.PI / 180) * distance;

        particle.style.setProperty('--translateX', `${x}px`);
        particle.style.setProperty('--translateY', `${y}px`);
        particle.style.backgroundColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        
        particle.style.top = '50%';
        particle.style.left = '50%';

        fireworksContainer.appendChild(particle);
    }
}


// --- Event Handlers ---

function handleStartClick() {
    startGame();
}

function handleCreateClick() {
    tempWords = [...words];
    renderTempWordList();
    showScreen('create');
}

function handleAddWord() {
    const newWord = wordInput.value.trim();
    if (newWord) {
        tempWords.push(newWord);
        wordInput.value = '';
        renderTempWordList();
        wordInput.focus();
    }
}

function handleSaveAndReturn() {
    words = [...tempWords];
    saveWords();
    showScreen('main');
}

function handleNextClick() {
    if (isGameFinished) {
        showScreen('main');
        return;
    }

    if (currentLevel >= SPACING_MULTIPLIERS.length - 1) {
        goToNextQuestion();
    } else {
        currentLevel++;
        updateWordDisplay();
    }
}

function handlePrevClick() {
    if (isGameFinished) {
        return;
    }

    currentLevel--;
    if (currentLevel < 0) {
        if (currentWordIndex > 0) {
            currentWordIndex--;
            currentLevel = SPACING_MULTIPLIERS.length - 1;
        } else {
            currentLevel = 0;
        }
    }
    updateWordDisplay();
}

function handleAnswerClick() {
    if (isGameFinished) return;

    createFireworks();

    setTimeout(() => {
        goToNextQuestion();
    }, 1000);
}


// --- Initialization ---

function init() {
    // Main menu buttons
    startGameBtn.addEventListener('click', handleStartClick);
    createWordsBtn.addEventListener('click', handleCreateClick);

    // Create screen buttons and input
    addWordBtn.addEventListener('click', handleAddWord);
    wordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleAddWord();
    });
    saveWordsBtn.addEventListener('click', handleSaveAndReturn);

    // Game screen buttons
    nextBtn.addEventListener('click', handleNextClick);
    prevBtn.addEventListener('click', handlePrevClick);
    answerBtn.addEventListener('click', handleAnswerClick);
    homeBtn.addEventListener('click', () => showScreen('main'));
    
    // Initial setup
    loadWords();
    showScreen('main');
}

init();
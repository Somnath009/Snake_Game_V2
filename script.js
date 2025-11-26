const board = document.querySelector(".board");
const startButton = document.querySelector(".btn-start");
const modal = document.querySelector(".modal");
const startGameModal = document.querySelector(".start-game");
const gameOverModal = document.querySelector(".game-over");
const restartButton = document.querySelector(".btn-restart");

const highScoreElement = document.querySelector("#high-score");
const scoreElement = document.querySelector("#score");
const timeElement = document.querySelector("#time");
const eatSound = document.querySelector("#eat-sound");


const blockHeight = 80;
const blockWidth = 80;

let highScore = Number(localStorage.getItem("highScore")) || 0;
let score = 0;
let time = "00:00";

highScoreElement.innerText = String(highScore).padStart(2, "0");
scoreElement.innerText = String(score).padStart(2, "0");
timeElement.innerText = time;

const blocks = [];
let snake = [
  { x: 1, y: 3 }
];

let direction = "down";
let intervalId = null;
let timerIntervalId = null;

const cols = Math.floor(board.clientWidth / blockWidth);
const rows = Math.floor(board.clientHeight / blockHeight);

function isOnSnake(x, y) {
  return snake.some(segment => segment.x === x && segment.y === y);
}

function getRandomFood() {
  let newFood;
  do {
    newFood = {
      x: Math.floor(Math.random() * rows),
      y: Math.floor(Math.random() * cols)
    };
  } while (isOnSnake(newFood.x, newFood.y));
  return newFood;
}

let food = getRandomFood();

// create grid blocks
for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {
    const block = document.createElement("div");
    block.classList.add("block");
    board.appendChild(block);
    blocks[`${row}-${col}`] = block;
  }
}

function endGame() {
  clearInterval(intervalId);
  clearInterval(timerIntervalId);
  intervalId = null;
  timerIntervalId = null;

  modal.style.display = "flex";
  startGameModal.style.display = "none";
  gameOverModal.style.display = "flex";
}

function startTimer() {
  timerIntervalId = setInterval(() => {
    let [min, sec] = time.split(":").map(Number);

    if (sec === 59) {
      min += 1;
      sec = 0;
    } else {
      sec += 1;
    }

    const formattedMin = String(min).padStart(2, "0");
    const formattedSec = String(sec).padStart(2, "0");

    time = `${formattedMin}:${formattedSec}`;
    timeElement.innerText = time;
  }, 1000);
}

function startGame() {
  intervalId = setInterval(render, 300);
  startTimer();
}

function render() {
  let head;

  // calculate new head position
  if (direction === "left") {
    head = { x: snake[0].x, y: snake[0].y - 1 };
  } else if (direction === "right") {
    head = { x: snake[0].x, y: snake[0].y + 1 };
  } else if (direction === "down") {
    head = { x: snake[0].x + 1, y: snake[0].y };
  } else if (direction === "up") {
    head = { x: snake[0].x - 1, y: snake[0].y };
  }

  // wall collision
  if (head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols) {
    endGame();
    return;
  }

  // self collision
  if (isOnSnake(head.x, head.y)) {
    endGame();
    return;
  }

  // clear old snake from UI
  snake.forEach((segment) => {
    blocks[`${segment.x}-${segment.y}`].classList.remove("fill");
  });

  // check food collision
  if (head.x === food.x && head.y === food.y) {
    // grow: add head, keep tail
    snake.unshift(head);

    // update score
    score += 10;
    scoreElement.innerText = String(score).padStart(2, "0");

    // update high score
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore.toString());
      highScoreElement.innerText = String(highScore).padStart(2, "0");
    }

    // play eat sound
    if (eatSound) {
      eatSound.currentTime = 0;
      eatSound.play().catch(() => {});
    }

    // remove old food & spawn new
    blocks[`${food.x}-${food.y}`].classList.remove("food");
    food = getRandomFood();
  } else {
    // normal move: add head, remove tail
    snake.unshift(head);
    snake.pop();
  }

  // draw snake
  snake.forEach((segment) => {
    blocks[`${segment.x}-${segment.y}`].classList.add("fill");
  });

  // draw food
  blocks[`${food.x}-${food.y}`].classList.add("food");
}

// START BUTTON
startButton.addEventListener("click", () => {
  modal.style.display = "none";
  startGameModal.style.display = "flex";
  gameOverModal.style.display = "none";

  if (!intervalId) {
    startGame();
  }
});

// RESTART BUTTON
restartButton.addEventListener("click", restartGame);

function restartGame() {
  clearInterval(intervalId);
  clearInterval(timerIntervalId);
  intervalId = null;
  timerIntervalId = null;

  // clear snake & food from UI
  blocks[`${food.x}-${food.y}`].classList.remove("food");
  snake.forEach((segment) => {
    blocks[`${segment.x}-${segment.y}`].classList.remove("fill");
  });

  // reset values
  score = 0;
  time = "00:00";

  scoreElement.innerText = String(score).padStart(2, "0");
  timeElement.innerText = time;
  highScoreElement.innerText = String(highScore).padStart(2, "0");

  modal.style.display = "none";
  startGameModal.style.display = "flex";
  gameOverModal.style.display = "none";

  snake = [{ x: 1, y: 3 }];
  direction = "down";
  food = getRandomFood();

  startGame();
}

// KEYBOARD CONTROLS
addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp" && direction !== "down") {
    direction = "up";
  } else if (e.key === "ArrowDown" && direction !== "up") {
    direction = "down";
  } else if (e.key === "ArrowRight" && direction !== "left") {
    direction = "right";
  } else if (e.key === "ArrowLeft" && direction !== "right") {
    direction = "left";
  }
});

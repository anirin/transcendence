// ゲームの設定
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PADDLE_WIDTH = 20;
const PADDLE_HEIGHT = 100;
const BALL_SIZE = 10;
const BALL_SPEED = 5;
const PADDLE_SPEED = 8;

// ゲーム要素の取得
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const leftScoreElement = document.getElementById('leftScore');
const rightScoreElement = document.getElementById('rightScore');
const playerStatusElement = document.getElementById('playerStatus');

// キャンバスのサイズ設定
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// ゲーム状態
let gameStarted = false;
let leftScore = 0;
let rightScore = 0;
let playerPosition = null; // 'left' または 'right'
let canPlay = false;

// ゲームオブジェクト
let ball = {
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    dx: BALL_SPEED,
    dy: BALL_SPEED
};

let leftPaddle = {
    x: 0,
    y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT
};

let rightPaddle = {
    x: CANVAS_WIDTH - PADDLE_WIDTH,
    y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT
};

// WebSocket接続
const ws = new WebSocket('ws://localhost:8080');

ws.onopen = () => {
    console.log('WebSocket接続が確立されました');
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    if (data.type === 'playerAssignment') {
        playerPosition = data.position;
        canPlay = data.canPlay;
        updatePlayerStatus();
    }
    else if (data.type === 'gameState') {
        updateGameState(data);
    }
    else if (data.type === 'gameReady') {
        startButton.disabled = false;
    }
};

ws.onclose = () => {
    console.log('WebSocket接続が切断されました');
    gameStarted = false;
    playerPosition = null;
    canPlay = false;
    updatePlayerStatus();
};

// プレイヤーステータスの更新
function updatePlayerStatus() {
    if (!playerPosition) {
        playerStatusElement.textContent = '接続中...';
    } else if (!canPlay) {
        playerStatusElement.textContent = '観戦モード';
    } else {
        playerStatusElement.textContent = `あなたは${playerPosition === 'left' ? '左側' : '右側'}のプレイヤーです`;
    }
}

// キーボード入力の処理
const keys = {};
document.addEventListener('keydown', (e) => keys[e.key] = true);
document.addEventListener('keyup', (e) => keys[e.key] = false);

// ゲーム開始ボタンの処理
startButton.addEventListener('click', () => {
    if (!gameStarted && canPlay) {
        gameStarted = true;
        startButton.disabled = true;
        ws.send(JSON.stringify({ type: 'startGame' }));
    }
});

// ゲーム状態の更新
function updateGameState(data) {
    ball = data.ball;
    leftPaddle = data.leftPaddle;
    rightPaddle = data.rightPaddle;
    leftScore = data.leftScore;
    rightScore = data.rightScore;
    
    leftScoreElement.textContent = leftScore;
    rightScoreElement.textContent = rightScore;
}

// パドルの移動
function movePaddle() {
    if (!canPlay) return;

    if (keys['ArrowUp']) {
        ws.send(JSON.stringify({ type: 'movePaddle', direction: 'up' }));
    }
    if (keys['ArrowDown']) {
        ws.send(JSON.stringify({ type: 'movePaddle', direction: 'down' }));
    }
}

// ゲームの描画
function draw() {
    // キャンバスのクリア
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // ボールの描画
    ctx.fillStyle = '#fff';
    ctx.fillRect(ball.x - BALL_SIZE / 2, ball.y - BALL_SIZE / 2, BALL_SIZE, BALL_SIZE);

    // パドルの描画
    ctx.fillStyle = '#fff';
    ctx.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
    ctx.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);
}

// ゲームループ
function gameLoop() {
    if (gameStarted) {
        movePaddle();
        draw();
    }
    requestAnimationFrame(gameLoop);
}

// ゲームループの開始
gameLoop(); 
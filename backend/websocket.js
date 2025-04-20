const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

// ゲームの設定
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PADDLE_WIDTH = 20;
const PADDLE_HEIGHT = 100;
const BALL_SIZE = 10;
const BALL_SPEED = 5;
const PADDLE_SPEED = 8;

// ゲーム状態
let gameStarted = false;
let leftScore = 0;
let rightScore = 0;
let players = new Set();
let leftPlayer = null;
let rightPlayer = null;

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

// HTTPサーバーの作成
const server = http.createServer((req, res) => {
    // 静的ファイルの提供
    let filePath = path.join(__dirname, '../frontend', req.url === '/' ? 'index.html' : req.url);
    
    // ファイルの拡張子に基づいてContent-Typeを設定
    const extname = path.extname(filePath);
    let contentType = 'text/html';
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
    }

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Server error: ' + error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// WebSocketサーバーの作成
const wss = new WebSocket.Server({ server });

// ゲームの更新
function updateGame() {
    if (!gameStarted) return;

    // ボールの移動
    ball.x += ball.dx;
    ball.y += ball.dy;

    // 壁との衝突
    if (ball.y <= BALL_SIZE / 2 || ball.y >= CANVAS_HEIGHT - BALL_SIZE / 2) {
        ball.dy = -ball.dy;
    }

    // パドルとの衝突
    if (ball.x <= leftPaddle.x + leftPaddle.width &&
        ball.y >= leftPaddle.y &&
        ball.y <= leftPaddle.y + leftPaddle.height) {
        ball.dx = Math.abs(ball.dx);
    }

    if (ball.x >= rightPaddle.x - BALL_SIZE &&
        ball.y >= rightPaddle.y &&
        ball.y <= rightPaddle.y + rightPaddle.height) {
        ball.dx = -Math.abs(ball.dx);
    }

    // スコアの更新
    if (ball.x <= 0) {
        rightScore++;
        resetBall();
    }
    if (ball.x >= CANVAS_WIDTH) {
        leftScore++;
        resetBall();
    }
}

// ボールのリセット
function resetBall() {
    ball.x = CANVAS_WIDTH / 2;
    ball.y = CANVAS_HEIGHT / 2;
    ball.dx = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
    ball.dy = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
}

// パドルの移動
function movePaddle(paddle, direction) {
    if (direction === 'up' && paddle.y > 0) {
        paddle.y -= PADDLE_SPEED;
    }
    if (direction === 'down' && paddle.y < CANVAS_HEIGHT - paddle.height) {
        paddle.y += PADDLE_SPEED;
    }
}

// プレイヤーの割り当て
function assignPlayer(ws) {
    if (!leftPlayer) {
        leftPlayer = ws;
        return { position: 'left', canPlay: true };
    } else if (!rightPlayer) {
        rightPlayer = ws;
        return { position: 'right', canPlay: true };
    }
    return { position: null, canPlay: false };
}

// ゲーム状態のブロードキャスト
function broadcastGameState() {
    const gameState = {
        type: 'gameState',
        ball,
        leftPaddle,
        rightPaddle,
        leftScore,
        rightScore
    };

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(gameState));
        }
    });
}

// ゲーム準備状態の通知
function notifyGameReady() {
    if (leftPlayer && rightPlayer) {
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'gameReady' }));
            }
        });
    }
}

// ゲームループ
setInterval(() => {
    updateGame();
    broadcastGameState();
}, 1000 / 60);

// WebSocket接続の処理
wss.on('connection', (ws) => {
    console.log('新しいクライアントが接続しました');
    players.add(ws);

    // プレイヤーの割り当て
    const assignment = assignPlayer(ws);
    ws.send(JSON.stringify({
        type: 'playerAssignment',
        ...assignment
    }));

    // ゲーム準備状態の通知
    notifyGameReady();

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'startGame' && leftPlayer && rightPlayer) {
            gameStarted = true;
            resetBall();
        }
        else if (data.type === 'movePaddle') {
            if (ws === leftPlayer) {
                movePaddle(leftPaddle, data.direction);
            } else if (ws === rightPlayer) {
                movePaddle(rightPaddle, data.direction);
            }
        }
    });

    ws.on('close', () => {
        console.log('クライアントが切断しました');
        players.delete(ws);
        
        if (ws === leftPlayer) {
            leftPlayer = null;
        } else if (ws === rightPlayer) {
            rightPlayer = null;
        }

        if (players.size < 2) {
            gameStarted = false;
            leftScore = 0;
            rightScore = 0;
        }
    });
});

const PORT = 8080;
server.listen(PORT, () => {
    console.log(`サーバーが起動しました: http://localhost:${PORT}`);
}); 
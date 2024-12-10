// Получаем доступ к холсту
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Переменные для игры
let plane = {
    x: canvas.width / 2,
    y: canvas.height - 100,
    width: 40,
    height: 40
};
let bullets = [];
let obstacles = [];
let explosions = []; // Массив для взрывов

let score = 0;
let health = 3;

// Переменные для управления движением самолёта
let leftPressed = false;
let rightPressed = false;
let planeSpeed = 5;

// Добавляем прослушку клавиш
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") leftPressed = true;
    if (e.key === "ArrowRight") rightPressed = true;
    // Пробел для выстрела
    if (e.key === " ") {
        bullets.push({ 
            x: plane.x, 
            y: plane.y, 
            width: 5, 
            height: 10 
        });
    }
});

document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft") leftPressed = false;
    if (e.key === "ArrowRight") rightPressed = false;
});

// Функция рисования самолёта
// Сделаем простой треугольный силуэт:
// - Нос самолёта сверху
// - Крылья по бокам
function drawPlane() {
    ctx.fillStyle = "blue";
    ctx.beginPath();
    // Координаты рассчитываем от центра (plane.x, plane.y)
    ctx.moveTo(plane.x, plane.y - plane.height / 2);      // Нос
    ctx.lineTo(plane.x - plane.width / 2, plane.y + plane.height / 2);  // Левая "ногa" треугольника
    ctx.lineTo(plane.x + plane.width / 2, plane.y + plane.height / 2);  // Правая "ногa"
    ctx.closePath();
    ctx.fill();
}

// Рисуем пули
function drawBullets() {
    ctx.fillStyle = "red";
    bullets.forEach((bullet, index) => {
        ctx.fillRect(bullet.x - bullet.width/2, bullet.y, bullet.width, bullet.height);
        bullet.y -= 7;
        // Удаляем пулю, если она ушла за верхний край
        if (bullet.y < 0) bullets.splice(index, 1);
    });
}

// Рисуем препятствия
function drawObstacles() {
    ctx.fillStyle = "black";
    obstacles.forEach((obstacle, index) => {
        ctx.fillRect(obstacle.x, obstacle.y, 40, 40);
        obstacle.y += 3;

        // Если препятствие улетело за экран
        if (obstacle.y > canvas.height) {
            obstacles.splice(index, 1);
            health -= 1; // Минус жизнь за пропущенное препятствие
        }
    });
}

// Функция для взрывов
// Каждый взрыв - объект {x, y, radius, maxRadius}
// С каждым кадром радиус увеличивается, прозрачность уменьшается.
function drawExplosions() {
    for (let i = explosions.length - 1; i >= 0; i--) {
        let exp = explosions[i];
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 165, 0, ${1 - exp.radius/exp.maxRadius})`;
        // оранжевый цвет, который становится прозрачным к краю
        ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2);
        ctx.fill();
        exp.radius += 2;
        if (exp.radius > exp.maxRadius) {
            // Взрыв закончен, удаляем
            explosions.splice(i, 1);
        }
    }
}

// Добавим столкновения
function checkCollisions() {
    // Столкновения пуль с препятствиями
    bullets.forEach((bullet, bulletIndex) => {
        obstacles.forEach((obstacle, obstacleIndex) => {
            if (
                bullet.x < obstacle.x + 40 &&
                bullet.x + bullet.width > obstacle.x &&
                bullet.y < obstacle.y + 40 &&
                bullet.y + bullet.height > obstacle.y
            ) {
                // Попадание пули в препятствие
                bullets.splice(bulletIndex, 1);
                obstacles.splice(obstacleIndex, 1);
                score++;

                // Добавляем взрыв
                explosions.push({
                    x: obstacle.x + 20,
                    y: obstacle.y + 20,
                    radius: 0,
                    maxRadius: 30
                });
            }
        });
    });

    // Столкновения самолёта с препятствиями
    obstacles.forEach((obstacle, obstacleIndex) => {
        if (
            plane.x - plane.width/2 < obstacle.x + 40 &&
            plane.x + plane.width/2 > obstacle.x &&
            plane.y - plane.height/2 < obstacle.y + 40 &&
            plane.y + plane.height/2 > obstacle.y
        ) {
            // Столкновение самолёта с препятствием
            obstacles.splice(obstacleIndex, 1);
            health -= 1;

            // Добавляем взрыв в месте самолёта
            explosions.push({
                x: plane.x,
                y: plane.y,
                radius: 0,
                maxRadius: 50
            });
        }
    });
}

// Обновление игры
function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Проверяем, не закончились ли жизни
    if (health <= 0) {
        ctx.fillStyle = "black";
        ctx.font = "50px Arial";
        ctx.fillText("GAME OVER", canvas.width / 2 - 100, canvas.height / 2);
        return; // Остановим игру здесь
    }

    // Движение самолёта
    if (leftPressed && plane.x > plane.width/2) plane.x -= planeSpeed;
    if (rightPressed && plane.x < canvas.width - plane.width/2) plane.x += planeSpeed;

    drawPlane();
    drawBullets();
    drawObstacles();
    drawExplosions();
    checkCollisions();

    // Выводим счёт и жизни
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 20);
    ctx.fillText("Health: " + health, 10, 50);

    requestAnimationFrame(updateGame);
}

// Периодически создаём препятствия
setInterval(() => {
    let x = Math.random() * (canvas.width - 40);
    obstacles.push({ x: x, y: -40 });
}, 2000);

// Запускаем игру
updateGame();

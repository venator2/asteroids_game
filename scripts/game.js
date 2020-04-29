let canv;
let keys = [];
let canvHeight = 600;
let canvWidth = 700;
let spaceship;
let ctx;
let score = 0;
let lives = 3;
let bullets = [];
let roids = [];


// HOMEWORK SOLUTION - Contributed by luckyboysunday
let highScore;
let localStorageName = "HighScore";

document.addEventListener('DOMContentLoaded', SetupCanvas);

function SetupCanvas() {
    canv = document.getElementById("my-canvas");
    ctx = canv.getContext("2d");
    canv.width = canvWidth;
    canv.height = canvHeight;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canv.width, canv.height);
    spaceship = new Spaceship();

    for (let i = 0; i < 4; i++) {
        roids.push(new Roid());
    }


    document.body.addEventListener("keydown", HandleKeyDown);
    document.body.addEventListener("keyup", HandleKeyUp);

    // HOMEWORK SOLUTION - Contributed by luckyboysunday
    // Retrieves locally stored high scores
    if (localStorage.getItem(localStorageName) == null) {
        highScore = 0;
    } else {
        highScore = localStorage.getItem(localStorageName);
    }

    Render();
}

// HOMEWORK SOLUTION
// Move event handling functions so that we can turn off
// event handling if game over is reached
function HandleKeyDown(e) {
    keys[e.keyCode] = true;
}
function HandleKeyUp(e) {
    keys[e.keyCode] = false;
    if (e.keyCode === 32) {
        bullets.push(new Bullet(spaceship.angle));
    }
}

class Spaceship {
    constructor() {
        this.x = canvWidth / 2;
        this.y = canvHeight / 2;
        this.speed = 0.1;
        this.velX = 0;
        this.velY = 0;
        this.visible = true;
        this.movingForward = false;
        this.strokeColor = 'white';
        this.rotateSpeed = 0.001;
        this.radius = 15;
        this.angle = 0;
        // Used to know where to fire the bullet from
        this.noseX = canvWidth / 2 + 15;
        this.noseY = canvHeight / 2;
    }
    Draw() {
        ctx.strokeStyle = this.strokeColor;
        ctx.beginPath();
        // Angle between vertices of the ship
        let vertAngle = ((Math.PI * 2) / 3);

        let radians = this.angle / Math.PI * 180;
        // Where to fire bullet from
        this.noseX = this.x - this.radius * Math.cos(radians);
        this.noseY = this.y - this.radius * Math.sin(radians);

        for (let i = 0; i < 3; i++) {
            ctx.lineTo(this.x - this.radius * Math.cos(vertAngle * i + radians), this.y - this.radius * Math.sin(vertAngle * i + radians));
        }
        ctx.closePath();
        ctx.stroke();
    }
    Rotate(dir) {
        this.angle += this.rotateSpeed * dir;
    }
    Update() {
        // Get current direction ship is facing
        let radians = this.angle / Math.PI * 180;

        // If moving forward calculate changing values of x & y
        // If you want to find the new point x use the 
        if (this.movingForward) {
            this.velX += Math.cos(radians) * this.speed;
            this.velY += Math.sin(radians) * this.speed;
        }
        // If ship goes off board place it on the opposite
        // side    
        if (this.x < this.radius) {
            this.x = canv.width;
        }
        if (this.x > canv.width) {
            this.x = this.radius;
        }
        if (this.y < this.radius) {
            this.y = canv.height;
        }
        if (this.y > canv.height) {
            this.y = this.radius;
        }

        // Change value of x & y while accounting for
        // air friction    
        this.x -= this.velX;
        this.y -= this.velY;
        // Slow ship speed when not holding key
        this.velX *= 0.99;
        this.velY *= 0.99;

    }
}

class Roid {
    constructor(x, y, radius, level, collisionRadius) {
        this.visible = true;
        this.radius = radius || 50;
        this.angle = Math.floor(Math.random() * 359);
        this.strokeColor = 'white';
        this.x = x || Math.floor(Math.random() * canvWidth);
        this.y = y || Math.floor(Math.random() * canvHeight);
        this.speed = 1;
        this.collisionRadius = collisionRadius || 46;
        // Used to decide if this asteroid can be broken into smaller pieces
        this.level = level || 1;
    }
    Draw() {
        ctx.beginPath();
        let vertAngle = ((Math.PI * 2) / 6);
        var radians = this.angle / Math.PI * 180;
        for (let i = 0; i < 6; i++) {
            ctx.lineTo(this.x - this.radius * Math.cos(vertAngle * i + radians), this.y - this.radius * Math.sin(vertAngle * i + radians));
        }
        ctx.closePath();
        ctx.stroke();
    }
    Update() {
        let radians = this.angle / Math.PI * 180;
        this.x += Math.cos(radians) * this.speed;
        this.y += Math.sin(radians) * this.speed;
        if (this.x < this.radius) {
            this.x = canv.width;
        }
        if (this.x > canv.width) {
            this.x = this.radius;
        }
        if (this.y < this.radius) {
            this.y = canv.height;
        }
        if (this.y > canv.height) {
            this.y = this.radius;
        }
    }
}

class Bullet {
    constructor(angle) {
        this.visible = true;
        this.height = 4;
        this.width = 4;
        this.x = spaceship.noseX;
        this.y = spaceship.noseY;
        this.speed = 7;
        this.velX = 0;
        this.velY = 0;
        this.angle = angle;
    }
    Draw() {
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x, this.y, this.height, this.width);
    }
    Update() {
        let radians = this.angle / Math.PI * 180;
        this.x -= Math.cos(radians) * this.speed;
        this.y -= Math.sin(radians) * this.speed;
    }
}



function CircleCollision(p1x, p1y, r1, p2x, p2y, r2) {
    let radiusSum;
    let xDiff;
    let yDiff;

    radiusSum = r1 + r2;
    xDiff = p1x - p2x;
    yDiff = p1y - p2y;

    if (radiusSum > Math.sqrt((xDiff * xDiff) + (yDiff * yDiff))) {
        return true;
    } else {
        return false;
    }
}

// Handles drawing life ships on screen
function DrawLifeShips() {
    let startX = 1350;
    let startY = 10;
    let points = [[9, 9], [-9, 9]];
    ctx.strokeStyle = 'white'; // Stroke color of ships
    // Cycle through all live ships remaining
    for (let i = 0; i < lives; i++) {
        // Start drawing ship
        ctx.beginPath();
        // Move to origin point
        ctx.moveTo(startX, startY);
        // Cycle through all other points
        for (let j = 0; j < points.length; j++) {
            ctx.lineTo(startX + points[j][0],
                startY + points[j][1]);
        }
        // Draw from last point to 1st origin point
        ctx.closePath();
        // Stroke the ship shape white
        ctx.stroke();
        // Move next shape 30 pixels to the left
        startX -= 30;
    }
}

function Render() {
    // Check if the ship is moving forward
    spaceship.movingForward = (keys[87]);

    if (keys[68]) {
        // d key rotate right
        spaceship.Rotate(1);
    }
    if (keys[65]) {
        // a key rotate left
        spaceship.Rotate(-1);
    }

    ctx.clearRect(0, 0, canvWidth, canvHeight);

    // Display score
    ctx.fillStyle = 'white';
    ctx.font = '21px Arial';
    ctx.fillText("SCORE : " + score.toString(), 20, 35);

    // If no lives signal game over
    if (lives <= 0) {
        // HOMEWORK SOLUTION
        // If Game over remove event listeners to stop getting keyboard input
        document.body.removeEventListener("keydown", HandleKeyDown);
        document.body.removeEventListener("keyup", HandleKeyUp);

        spaceship.visible = false;
        ctx.fillStyle = 'white';
        ctx.font = '50px Arial';
        ctx.fillText("GAME OVER", canvWidth / 2 - 150, canvHeight / 2);
    }



    // HOME WORK SOLUTION : Creates a new level and increases asteroid speed
    if (roids.length === 0) {
        spaceship.x = canvWidth / 2;
        spaceship.y = canvHeight / 2;
        spaceship.velX = 0;
        spaceship.velY = 0;
        for (let i = 0; i < 8; i++) {
            let roid = new Roid();
            roid.speed += .5;
            roids.push(roid);
        }
    }

    // Draw life ships
    DrawLifeShips();



    // Check for collision with bullet and asteroid
    if (roids.length !== 0 && bullets.length != 0) {
        loop1:
        for (let l = 0; l < roids.length; l++) {
            for (let m = 0; m < bullets.length; m++) {
                if (CircleCollision(bullets[m].x, bullets[m].y, 3, roids[l].x, roids[l].y, roids[l].collisionRadius)) {
                    // Check if asteroid can be broken into smaller pieces
                    if (roids[l].level === 1) {
                        roids.push(new Roid(roids[l].x - 5, roids[l].y - 5, 25, 2, 22));
                        roids.push(new Roid(roids[l].x + 5, roids[l].y + 5, 25, 2, 22));
                    } else if (roids[l].level === 2) {
                        roids.push(new Roid(roids[l].x - 5, roids[l].y - 5, 15, 3, 12));
                        roids.push(new Roid(roids[l].x + 5, roids[l].y + 5, 15, 3, 12));
                    }
                    roids.splice(l, 1);
                    bullets.splice(m, 1);
                    score += 20;

                    // Used to break out of loops because splicing arrays
                    // you are looping through will break otherwise
                    break loop1;
                }
            }
        }
    }

    // Check for collision of ship with asteroid
    if (roids.length !== 0) {
        for (let k = 0; k < roids.length; k++) {
            if (CircleCollision(spaceship.x, spaceship.y, 11, roids[k].x, roids[k].y, roids[k].collisionRadius)) {
                spaceship.x = canvWidth / 2;
                spaceship.y = canvHeight / 2;
                spaceship.velX = 0;
                spaceship.velY = 0;
                lives -= 1;
            }
        }
    }

    if (spaceship.visible) {
        spaceship.Update();
        spaceship.Draw();
    }

    if (bullets.length !== 0) {
        for (let i = 0; i < bullets.length; i++) {
            bullets[i].Update();
            bullets[i].Draw();
        }
    }
    if (roids.length !== 0) {
        for (let j = 0; j < roids.length; j++) {
            roids[j].Update();
            // Pass j so we can track which asteroid points
            // to store
            roids[j].Draw(j);
        }
    }


    //number of attempts(lives)
    ctx.font = '21px Arial';
    ctx.fillText("lIVES : " + lives.toString(), 20, 100);

    // HOMEWORK SOLUTION
    // Updates the high score using local storage
    highScore = Math.max(score, highScore);
    localStorage.setItem(localStorageName, highScore);
    ctx.font = '21px Arial';
    ctx.fillText("HIGH SCORE : " + highScore.toString(), 20, 70);

    requestAnimationFrame(Render);
}

// GameBoard code below

function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function Circle(game) {
    //this.player = 1;
    this.radius = 10;
   // this.visualRadius = 500;
    this.setNotIt();
    Entity.call(this, game, this.radius + Math.random() * (800 - this.radius * 2), this.radius + Math.random() * (800 - this.radius * 2));
    this.tail = [{ X : this.x, y: this.y}];
    this.velocity = { x: Math.random() * 1000, y: Math.random() * 1000 };
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }
};

Circle.prototype = new Entity();
Circle.prototype.constructor = Circle;

Circle.prototype.storePos = function (xP, yP) {
    this.tail.push({ x: xP, y: yP });

    if (this.tail.length > trailLen) {
        this.tail.shift();
    }
}

Circle.prototype.setIt = function () {
    this.it = true;
    this.color = "red";
    this.visualRadius = 500;
};

Circle.prototype.setNotIt = function () {
    this.it = false;
    this.color = "white";
    this.visualRadius = 200;
};

Circle.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Circle.prototype.collideLeft = function () {
    return (this.x - this.radius) < 20;
};

Circle.prototype.collideRight = function () {
    return (this.x + this.radius) > 730;
};

Circle.prototype.collideTop = function () {
    return (this.y - this.radius) < 20;
};

Circle.prototype.collideBottom = function () {
    return (this.y + this.radius) > 730;
};

Circle.prototype.rule1 = function () {
    tempVect = { x: 0, y: 0 };
    nCount = 0;
    for (var i = 0; i < this.game.boids.length; i++) {
        ent = this.game.boids[i];
        if (ent !== this && distance(this, ent) <= neighborRad) {
            tempVect.x += ent.x;
            tempVect.y += ent.y;
            nCount++;
        }
    }
    if (nCount > 0) {
        tempVect.x /= nCount;// (this.game.boids.length - 1);
        tempVect.y /= nCount;//(this.game.boids.length - 1);

        tempVect.x = (tempVect.x - this.x) / cohesion;
        tempVect.y = (tempVect.y - this.y) / cohesion;
    }
    return tempVect;
    
}

Circle.prototype.rule2 = function () {
    tempVect = { x: 0, y: 0 };
    for (var i = 0; i < this.game.boids.length; i++) {
        ent = this.game.boids[i];
        if (ent !== this) {
            if (distance(ent, this) < separation) {
                tempVect.x -= (ent.x - this.x);
                tempVect.y -= (ent.y - this.y);
            }
        }
    }
    return tempVect;
}

Circle.prototype.rule3 = function () {
    tempVect = { x: 0, y: 0 };
    nCount = 0;
    for (var i = 0; i < this.game.boids.length; i++) {
        ent = this.game.boids[i];
        if (ent !== this && distance(this, ent) <= neighborRad) {
            tempVect.x += ent.velocity.x;
            tempVect.y += ent.velocity.y;
            nCount++;
        }
    }
    if (nCount > 0) {
        tempVect.x /= nCount;//(this.game.boids.length - 1);
        tempVect.y /= nCount;//(this.game.boids.length - 1);

        tempVect.x = (tempVect.x - this.velocity.x) / alignment;
        tempVect.y = (tempVect.y - this.velocity.y) / alignment;
    }
    return tempVect;
}

Circle.prototype.rule4 = function () {
    tempVect = { x: 0, y: 0 };

    if (this.collideLeft()) {
        tempVect.x = steer;
    } else if (this.collideRight()) {
        tempVect.x = -1 * steer;
    }

    if (this.collideTop()) {
        tempVect.y = steer;
    } else if (this.collideBottom()) {
        tempVect.y = -1 * steer;
    }

    return tempVect;
}

Circle.prototype.rule5 = function () {
    tempVect = { x: 0, y: 0 };
    tempVect.x = -(badBoi.x - this.x / 100);
    tempVect.y = -(badBoi.x - this.y / 100);

    return tempVect
}

Circle.prototype.rule6 = function () {
    tempVect = { x: 0, y: 0 };
    bCount = 0;
    for (var i = 0; i < this.game.bullets.length; i++) {
        bull = this.game.bullets[i];
        if (distance(this, bull) <= bulletAvoid) { 
            tempVect.x += -(bull.x - this.x / 100);
            tempVect.y += -(bull.y - this.y / 100);
            bCount++;
        }
    }
    return tempVect;
}

Circle.prototype.update = function () {
    Entity.prototype.update.call(this);
/*
 generate a way for boids to avoid bullets/some entity type
    create a lil shooty boi who will let ya try to kill boids
    Maybe wrap the edges? to be decided
    */

    v1 = this.rule1();
    v2 = this.rule2();
    v3 = this.rule3();
    v4 = this.rule4();
    v5 = this.rule5();
    v6 = this.rule6();

    this.velocity.x += (v1.x * m1) + (v2.x * m2) + (v3.x * m3) + v4.x + v6.x;
    this.velocity.y += (v1.y * m1) + (v2.y * m2) + (v3.y * m3) + v4.y + v6.y;

    if (!this.it && distance(this, badBoi) < neighborRad * 2) {
        this.velocity.x += v5.x;
        this.velocity.y += v5.y;
    }

    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed && m1) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }
    this.storePos(this.x, this.y);
    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;

    if (badBoi.removeFromWorld) {
        num = getRandomInt(0, this.game.boids.length);
        badBoi = this.game.boids[num];
        badBoi.setIt();
        console.log(badBoi);
    }

};

var rBow = ["rgba(0,0,0, ", "rgba(133,133,133, ", "rgba(0,2,146, ", "rgba(19,14,152, ",
    "rgba(38,60,227, ", "rgba(82,170,251, "];

Circle.prototype.draw = function (ctx) {
    for (var i = 0; i < this.tail.length; i++) {
        var ratio = (i + 1) / this.tail.length;

        ctx.beginPath();
        ctx.arc(this.tail[i].x, this.tail[i].y, this.radius * ratio, 0, 2 * Math.PI, true);
        ctx.fillStyle = rBow[i] + ratio / 2 + ")";

        ctx.fill();
    }
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();

};



// the "main" code begins here
var friction = 1;
var acceleration = 1000000;
var maxSpeed = 300;
var cohesion = 25; // percentage a boid draws itself into the flock
var separation = 30; // distance boids keep between eachother 
var alignment = 8; // try to match average direction 
var steer = 10; // amount of turn back when leaves the canvas 
//multipliers to affect the strength of flocking rules
var m1 = 1;
var m2 = 1;
var m3 = 1;
var badBoi = null; //variable to keep info on the It circle
var neighborRad = 40;
var trailLen = 6;
var bulletAvoid = 25; // radius a boid detects to avoid a bullet

var ASSET_MANAGER = new AssetManager();

//ASSET_MANAGER.queueDownload("./img/960px-Blank_Go_board.png");
//ASSET_MANAGER.queueDownload("./img/black.png");
//ASSET_MANAGER.queueDownload("./img/white.png");
ASSET_MANAGER.queueDownload("./img/gun.png");

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var gameEngine = new GameEngine();
    var gun = new Gun(gameEngine, ASSET_MANAGER.getAsset("./img/gun.png"), 340, 750);
    gameEngine.gun = gun;
    var circle = new Circle(gameEngine);
    circle.setIt();
    badBoi = circle;
    gameEngine.addBoid(circle);

    for (var i = 0; i < 49; i++) {
        circle = new Circle(gameEngine);
        gameEngine.addBoid(circle);
    }
    gameEngine.init(ctx);
    gameEngine.start();
});

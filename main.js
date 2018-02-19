
// GameBoard code below

function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function Circle(game) {
    //this.player = 1;
    this.radius = 20;
    this.visualRadius = 500;
    this.colors = ["Red", "Green", "Blue", "White"];
    this.setNotIt();
    Entity.call(this, game, this.radius + Math.random() * (800 - this.radius * 2), this.radius + Math.random() * (800 - this.radius * 2));

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

Circle.prototype.setIt = function () {
    this.it = true;
    this.color = 0;
    this.visualRadius = 500;
};

Circle.prototype.setNotIt = function () {
    this.it = false;
    this.color = 3;
    this.visualRadius = 200;
};

Circle.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Circle.prototype.collideLeft = function () {
    return (this.x - this.radius) < 0;
};

Circle.prototype.collideRight = function () {
    return (this.x + this.radius) > 800;
};

Circle.prototype.collideTop = function () {
    return (this.y - this.radius) < 0;
};

Circle.prototype.collideBottom = function () {
    return (this.y + this.radius) > 800;
};

Circle.prototype.rule1 = function () {
    tempVect = { x: 0, y: 0 };
    for (var i = 0; i < this.game.entities.length; i++) {
        ent = this.game.entities[i];
        if (ent !== this) {
            tempVect.x += ent.x;
            tempVect.y += ent.y;
        }
    }
    tempVect.x /= (this.game.entities.length - 1);
    tempVect.y /= (this.game.entities.length - 1);

    tempVect.x = (tempVect.x - this.x) / (100 * cohesion);
    tempVect.y = (tempVect.y - this.y) / (100 * cohesion);

    return tempVect;
    
}

Circle.prototype.rule2 = function () {
    tempVect = { x: 0, y: 0 };
    for (var i = 0; i < this.game.entities.length; i++) {
        ent = this.game.entities[i];
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
    for (var i = 0; i < this.game.entities.length; i++) {
        ent = this.game.entities[i];
        if (ent !== this) {
            tempVect.x += ent.velocity.x;
            tempVect.y += ent.velocity.y;
        }
    }
    tempVect.x /= (this.game.entities.length - 1);
    tempVect.y /= (this.game.entities.length - 1);

    tempVect.x = (tempVect.x  - this.velocity.x) / alignment;
    tempVect.y = (tempVect.y - this.velocity.y) / alignment;
    return tempVect;
}

Circle.prototype.rule4 = function () {
    tempVect = { x: 0, y: 0 };

    if (boid.collideLeft) {
        console.log("left");
        tempVect.x = steer;
    } else if (boid.collideRight) {
        console.log("right");
        tempVect.x = -1 * steer;
    }

    if (boid.collideTop) {
        console.log("top");
        tempVect.y = steer;
    } else if (boid.collideBottom) {
        console.log("bottom");
        tempVect.y = -1 * steer;
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

    if (this.collideLeft() || this.collideRight()) {
        this.velocity.x = -this.velocity.x * friction;
        if (this.collideLeft()) this.x = this.radius;
        if (this.collideRight()) this.x = 800 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    if (this.collideTop() || this.collideBottom()) {
        this.velocity.y = -this.velocity.y * friction;
        if (this.collideTop()) this.y = this.radius;
        if (this.collideBottom()) this.y = 800 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    v1 = this.rule1();
    v2 = this.rule2();
    v3 = this.rule3();

    this.velocity.x += v1.x + v2.x + v3.x;
    this.velocity.y += v1.y + v2.y + v3.y;

    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;

    //this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    //this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;
};

Circle.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.colors[this.color];
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();

};



// the "main" code begins here
var friction = 1;
var acceleration = 1000000;
var maxSpeed = 200;
var cohesion = 1; // percentage a boid draws itself into the flock
var separation = 50; // distance boids keep between eachother 
var alignment = 8; // try to match average direction 
var steer = 500; // amount of turn back when leaves the canvas 

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/960px-Blank_Go_board.png");
ASSET_MANAGER.queueDownload("./img/black.png");
ASSET_MANAGER.queueDownload("./img/white.png");

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');


    var gameEngine = new GameEngine();
    var circle = new Circle(gameEngine);
    circle.setIt();
    gameEngine.addEntity(circle);

    for (var i = 0; i < 10; i++) {
        circle = new Circle(gameEngine);
        gameEngine.addEntity(circle);
    }
    gameEngine.init(ctx);
    gameEngine.start();
});

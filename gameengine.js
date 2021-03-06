// This game shell was happily copied from Googler Seth Ladd's "Bad Aliens" game and his Google IO talk in 2011

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (/* function */ callback, /* DOMElement */ element) {
                window.setTimeout(callback, 1000 / 60);
            };
})();


function Timer() {
    this.gameTime = 0;
    this.maxStep = 0.05;
    this.wallLastTimestamp = 0;
}

Timer.prototype.tick = function () {
    var wallCurrent = Date.now();
    var wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000;
    this.wallLastTimestamp = wallCurrent;

    var gameDelta = Math.min(wallDelta, this.maxStep);
    this.gameTime += gameDelta;
    return gameDelta;
}

function GameEngine() {
    this.boids = [];
    this.bullets = [];
    this.gun = null;
    this.showOutlines = false;
    this.ctx = null;
    this.click = null;
    this.mouse = null;
    this.wheel = null;
    this.surfaceWidth = null;
    this.surfaceHeight = null;
}

GameEngine.prototype.init = function (ctx) {
    this.ctx = ctx;
    this.surfaceWidth = this.ctx.canvas.width;
    this.surfaceHeight = this.ctx.canvas.height;
    this.startInput();
    this.timer = new Timer();
    console.log('game initialized');
}

GameEngine.prototype.start = function () {
    console.log("starting game");
    var that = this;
    (function gameLoop() {
        if (that.boids.length == 0) {
            alert("Wow, were you a little bored?");
        } else {
            that.loop();
            requestAnimFrame(gameLoop, that.ctx.canvas);
        }
    })();
}

GameEngine.prototype.startInput = function () {
    console.log('Starting input');
    var that = this;

    var getXandY = function (e) {
        var x = e.clientX - that.ctx.canvas.getBoundingClientRect().left;
        var y = e.clientY - that.ctx.canvas.getBoundingClientRect().top;

        return { x: x, y: y };
    }

    this.ctx.canvas.addEventListener("keydown", function (e) {
        if (e.keyCode == 83) {
            console.log("save game!");
            saveGameState(that);
        } else if (e.keyCode == 76) {
            console.log("load game!");
            socket.emit("load", { studentname: "Stephanie Day", statename: "astroState" });
        }
    }, false);

    this.ctx.canvas.addEventListener("click", function (e) {
        console.log(getXandY(e));
        that.click = getXandY(e);
        that.gun.fire(that.click.x, that.click.y);
    }, false);

    console.log('Input started');
}

GameEngine.prototype.addBoid = function (boid) {
    console.log("added boid");
    this.boids.push(boid);
}

GameEngine.prototype.addBullet = function (bullet) {
    console.log("added bullet");
    this.bullets.push(bullet);
}

GameEngine.prototype.draw = function () {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.save();
    for (var i = 0; i < this.boids.length; i++) {
        this.boids[i].draw(this.ctx);
    }

    for (var i = 0; i < this.bullets.length; i++) {
        this.bullets[i].draw(this.ctx);
    }

    this.gun.draw(this.ctx);
    this.ctx.restore();
}

GameEngine.prototype.update = function () {
    var boidsCount = this.boids.length;

    for (var i = 0; i < boidsCount; i++) {
        var entity = this.boids[i];

        if (!entity.removeFromWorld) {
            entity.update();
        }
    }

    for (var i = 0; i < this.bullets.length; i++) {
        var ent = this.bullets[i];

        if (!ent.removeFromWorld) {
            ent.update();
        }
    }

    for (var i = this.boids.length - 1; i >= 0; --i) {
        if (this.boids[i].removeFromWorld) {
            this.boids.splice(i, 1);
        }
    }

    for (var i = this.bullets.length - 1; i >= 0; --i) {
        if (this.bullets[i].removeFromWorld) {
            this.bullets.splice(i, 1);
        }
    }
}

GameEngine.prototype.loop = function () {
    this.clockTick = this.timer.tick();
    this.update();
    this.draw();
    this.click = null;
    this.rightclick = null;
    this.wheel = null;
}

function Entity(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.removeFromWorld = false;
}

Entity.prototype.update = function () {
}

Entity.prototype.draw = function (ctx) {
    if (this.game.showOutlines && this.radius) {
        this.game.ctx.beginPath();
        this.game.ctx.strokeStyle = "green";
        this.game.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.game.ctx.stroke();
        this.game.ctx.closePath();
    }
}

function Bullet(game, x, y, cX, cY) {
    this.radius = 5;
    this.color = "blue";
    Entity.call(this, game, x, y);
    this.tail = [{ X: this.x, Y: this.y }];
    this.velocity = { x: cX - 400, y: -maxSpeed};
}

Bullet.prototype = new Entity();
Bullet.prototype.constructor = Bullet;

Bullet.prototype.update = function () {
    for (var i = 0; i < this.game.boids.length; i++) {
        boid = this.game.boids[i];
        if (this.collide(boid)) {
            this.removeFromWorld = true;
            boid.removeFromWorld = true;
        }
    }
    if (this.leaveBox()) this.removeFromWorld = true;

    this.storePos(this.x, this.y);
    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;
}

Bullet.prototype.draw = function (ctx) {
    for (var i = 0; i < this.tail.length; i++) {
        var ratio = (i + 1) / this.tail.length;

        ctx.beginPath();
        ctx.arc(this.tail[i].x, this.tail[i].y, this.radius * ratio, 0, 2 * Math.PI, true);

        ctx.fillStyle = "rgba(0, 0, 255, " + ratio / 2 + ")";
        ctx.fill();
    }
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
}

Bullet.prototype.storePos = function (xP, yP) {
    this.tail.push({ x: xP, y: yP });

    if (this.tail.length > trailLen) {
        this.tail.shift();
    }
}

Bullet.prototype.leaveBox = function () {
    return (this.x - this.radius < 0 || this.y - this.radius < 0) ||
        (this.x + this.radius > 800 || this.y + this.radius > 800);
}

Bullet.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};


function Gun(game, img, x, y) {
    Entity.call(this, game, x, y);
    this.radius = 30;
    this.img = img;
}

Gun.prototype = new Entity();
Gun.prototype.constructor = Gun;

Gun.prototype.draw = function (ctx) {
    ctx.drawImage(this.img, this.x, this.y, 100, 100);
    Entity.prototype.draw.call(this);
}

Gun.prototype.fire = function (x, y) {
    m1 = -5;
    for (var i = 0; i < this.game.boids.length; i++) {
        b = this.game.boids[i];
        b.velocity.x = b.velocity.x * 10;
        b.velocity.y = b.velocity.y * 10;
    }
    setTimeout(function () {
        m1 = 1;
    }, 2000);
    var bullet = new Bullet(this.game, this.x + 50, this.y, x, y);
    this.game.addBullet(bullet);
}
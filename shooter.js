function Bullet(game, x, y) {
    this.radius = 5;
    this.color = "blue";
    Entity.call(this, game, x, y);
    this.tail = [{ X: this.x, Y: this.y }];
    this.velocity = { x: maxSpeed, y: maxSpeed};

}

Bullet.prototype = new Entity();
Bullet.prototype.constructor = Bullet;

Bullet.prototype.update = function () {
    for (var i = 0; i < this.game.boids.length; i++) {
        boid = this.game.boids[i];
        if (this.collide(this, boid)) {
            this.removeFromWorld = true;
            boid.removeFromWorld = true;
        }
    }
    if (this.leaveBox()) this.removeFromWorld = true;

    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;
}

Bullet.prototype.draw = function () {
    for (var i = 0; i < this.tail.length; i++) {
        var ratio = (i + 1) / this.tail.length;

        ctx.beginPath();
        ctx.arc(this.tail[i].x, this.tail[i].y, this.radius * ratio, 0, 2 * Math.PI, true);

        ctx.fillStyle = "rgba(0, 0, 255, " + ratio / 2 + ")";
        ctx.fill();
    }
    ctx.beginPath();
    ctx.fillStyle = this.colors[this.color];
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
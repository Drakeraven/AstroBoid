
//TODO: Connect it to the server and save/load.
var socket = io.connect("http://24.16.255.56:8888");

window.onload = function () {
    socket.on("ping", function (ping) {
        console.log("returned ping: " + ping);
        socket.emit("pong");
    });

    socket.on("connect", function () {
        console.log("socket connected.");
    });

    socket.on("disconnect", function () {
        console.log("socket disconnected.");
    });

    socket.on("reconnect", function () {
        console.log("socket reconnected.");
    });

    socket.on("load", function (data) {
        boidState = data['boids'];
        bulletState = data['bullets'];
        loadGameState(boidState, bulletState, gameEngine);
    });

}

var boidState = null;
var bulletState = null;

function saveGameState(game) {
    temp1 = JSON.stringify(game.boids, ['velocity', 'x', 'y', 'it']);
    temp2 = JSON.stringify(game.bullets, ['x', 'y', 'velocity']);

    socket.emit("save", { studentname: "Stephanie Day", statename: "astroState", boids: temp1, bullets: temp2 });
}

function loadGameState(boids, bullets, game) {
    let boidReset = [];
    let bulletReset = [];
    
    if (boidState != null && bulletState != null) {
        boids = JSON.parse(boidState);
        bullets = JSON.parse(bulletState);

        for (var i = 0; i < boids.length; i++) {
            temp = new Circle(game);
            temp.velocity = boids[i].velocity;
            temp.x = boids[i].x;
            temp.y = boids[i].y;
            temp.it = boids[i].it;
            if (boids[i].it) {
                temp.setIt();
            }
            boidReset.push(temp);
        }

        for (var i = 0; i < bullets.length; i++) {
            temp = new Bullet(game, bullets[i].x, bullets[i].y, 0, 0);
            temp.velocity = bullets[i].velocity;
            bulletReset.push(temp);

        }

    }
    game.boids = boidReset;
    game.bullets = bulletReset;
}

var ASSET_MANAGER = new AssetManager();
var gameEngine = new GameEngine();

ASSET_MANAGER.queueDownload("./img/gun.png");

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

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

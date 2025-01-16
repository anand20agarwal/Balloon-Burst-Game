const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let game = new Phaser.Game(config);
let balloons = [];
let pumpButton;
let currentBalloonIndex = 0;
let maxSize = 0.35;

function preload() {
    this.load.image('balloon1', 'IMAGES/baloon1.png');
    this.load.image('balloon2', 'IMAGES/baloon2.png');
    this.load.image('balloon3', 'IMAGES/baloon3.png');
    this.load.image('balloon4', 'IMAGES/baloon4.png');
    this.load.image('balloon5', 'IMAGES/baloon5.png');
    this.load.image('char1', 'IMAGES/Char1.png');
    this.load.image('char2', 'IMAGES/Char2.png');
    this.load.image('char3', 'IMAGES/Char3.png');
    this.load.image('char4', 'IMAGES/Char4.png');
    this.load.image('char5', 'IMAGES/Char5.png');
    this.load.image('pump', 'IMAGES/pump.png');
    this.load.image('background', 'IMAGES/background.png');
    this.load.image('pop', 'IMAGES/Pop.png');
    this.load.image('thread', 'IMAGES/Thred.png');
}

function create() {
    this.add.image(config.width / 2, config.height / 2, 'background').setScale(0.65);

    for (let i = 0; i < 5; i++) {
        const balloonImage = `balloon${i + 1}`;
        const charImage = `char${i + 1}`;
        const balloonContainer = this.add.container(config.width - 200, config.height - 150);

        const balloon = this.physics.add.sprite(0, 0, balloonImage).setScale(0.1).setAlpha(0);
        const char = this.add.sprite(0, 0, charImage).setScale(0.05).setAlpha(0);
        const thread = this.add.sprite(10, 100, 'thread').setScale(0.3).setAlpha(0);

        balloonContainer.add(balloon);
        balloonContainer.add(char); 
        balloonContainer.add(thread);

        balloonContainer.balloon = balloon;
        balloonContainer.char = char;
        balloonContainer.thread = thread;   
        balloonContainer.isFlying = false;
        balloonContainer.defaultImage = balloonImage;
        balloonContainer.pumpCount = 0;
        balloonContainer.startTime = 0;
        balloonContainer.targetScale = null;

        balloonContainer.setInteractive(new Phaser.Geom.Circle(0, 0, 50), Phaser.Geom.Circle.Contains);
        balloonContainer.on('pointerdown', () => {
            burstBalloon.call(this, balloonContainer);
        });

        balloons.push(balloonContainer);
    }

    pumpButton = this.add.sprite(config.width - 100, config.height - 105, 'pump').setInteractive();
    pumpButton.setScale(0.3);
    pumpButton.on('pointerdown', inflateBalloon, this);

    activateBalloon(currentBalloonIndex, false);
}

function update(time) {
    balloons.forEach(balloonContainer => {  
        const balloon = balloonContainer.balloon;
        const thread = balloonContainer.thread;

        if (balloonContainer.targetScale && balloon.scale < balloonContainer.targetScale) {
            const scaleStep = 0.01;
            balloon.setScale(Math.min(balloon.scale + scaleStep, balloonContainer.targetScale));
        }

        if (balloonContainer.targetScale && balloon.scale >= balloonContainer.targetScale) {
            balloonContainer.targetScale = null;
        }

        if (balloonContainer.isFlying) {
            balloonContainer.x -= 1.2;
            balloonContainer.y -= 1 + Math.sin((time - balloonContainer.startTime) / 200) * 2;

            if (balloonContainer.x < -50 || balloonContainer.y < -50) {
                activateBalloon(currentBalloonIndex, false);
            }
        }

        if (!balloonContainer.isFlying && thread.alpha === 1) {
            thread.setAlpha(0);
        }
    });
}

function inflateBalloon() {
    const balloonContainer = balloons[currentBalloonIndex];
    const balloon = balloonContainer.balloon;
    const char = balloonContainer.char;
    const thread = balloonContainer.thread;

    if (!balloonContainer.isFlying) {
        balloon.setAlpha(1);
        char.setAlpha(1);

        if (!balloonContainer.targetScale) {
            balloonContainer.targetScale = Math.min(balloon.scale + 0.05, maxSize);
        }

        if (balloonContainer.targetScale <= maxSize) {
            balloon.setScale(Math.min(balloon.scale + 0.01, balloonContainer.targetScale));
            char.setScale(Math.min(char.scale + 0.5, balloonContainer.targetScale * 0.5));
            balloonContainer.pumpCount += 1;
            balloonContainer.y -= 9;
        }

        if (balloon.scale >= maxSize && !balloonContainer.isFlying) {
            thread.setAlpha(1);
            balloonContainer.isFlying = true;
            balloonContainer.startTime = this.time.now;
            currentBalloonIndex = (currentBalloonIndex + 1) % balloons.length;
            activateBalloon(currentBalloonIndex, false);
        }
    }
}

function activateBalloon(index, isVisible) {
    const balloonContainer = balloons[index];
    const balloon = balloonContainer.balloon;
    const char = balloonContainer.char;
    const thread = balloonContainer.thread;

    balloon.setTexture(balloonContainer.defaultImage);
    balloon.setAlpha(isVisible ? 1 : 0).setScale(0.1);
    char.setAlpha(isVisible ? 1 : 0).setScale(0.05);
    thread.setAlpha(isVisible ? 1 : 0).setScale(0.3);
    balloonContainer.isFlying = false;
    balloonContainer.setPosition(config.width - 180, config.height - 135);
    balloonContainer.pumpCount = 0;
    balloonContainer.targetScale = null;
}

function burstBalloon(balloonContainer) {
    const balloon = balloonContainer.balloon;
    const char = balloonContainer.char;
    const thread = balloonContainer.thread;

    balloonContainer.isFlying = false;

    balloon.setTexture('pop');
    balloon.setScale(0.4);
    char.setAlpha(0);
    thread.setAlpha(0);

    this.time.delayedCall(200, () => {
        balloon.setAlpha(0);
        char.setAlpha(0);
        thread.setAlpha(0);
        balloonContainer.setPosition(-1000, -1000);
        balloonContainer.setInteractive(false);

        balloon.setTexture(balloonContainer.defaultImage);
        activateBalloon(currentBalloonIndex, false);
    });
}

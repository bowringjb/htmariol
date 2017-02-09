function App() {

	var app = this;
	this.facing = 'left';
	app.jumpstate = "Standing";

	this.init = function(FullScreenButton, createCallback) {
		app.createCallback = createCallback;
		app.fullScreenButton = FullScreenButton;
		app.game = new Phaser.Game(427, 240, Phaser.AUTO, 'phaser-example', { preload: this.preload, create: this.create, update: this.update });
		app.actionManager = new ActionManager(app);
	}
	this.preload = function() {
		app.game.load.tilemap('mario', 'maps/sample.json', null, Phaser.Tilemap.TILED_JSON);
		app.game.load.image('tiles', 'img/source_sheets/sheet.png');
		app.game.load.spritesheet("tilessprite", "img/source_sheets/sheet.png", 16, 16, 924)
		app.game.load.spritesheet('dude', 'img/source_sheets/mario.png', 18, 18);
	}
	this.create = function() {

		app.game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
		app.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		app.game.scale.pageAlignVertically = true;
		app.game.scale.pageAlignHorizontally = true;
		app.game.stage.backgroundColor = '#000';

		app.map = app.game.add.tilemap('mario');
		app.map.addTilesetImage('sheet', 'tiles');

		app.layerSky = app.map.createLayer('Sky');
		app.layerDistant = app.map.createLayer('Distant');
		app.layerClose = app.map.createLayer('Close');
		app.layerSky.resizeWorld();

		// Add PowerUps
		app.powerups = app.game.add.group();
		app.powerups.enableBody = true;
		app.map.createFromObjects('Items', 'PowerUp', 'tilessprite', 24, true, false, app.powerups);
		app.powerups.callAll('animations.add', 'animations', 'pulse', [24, 25, 26], 3, true);
		app.powerups.callAll('animations.play', 'animations', 'pulse');
		app.powerups.forEach(function(item) {
			item.body.allowGravity = false;
			item.body.immovable = true;
		});

		// Add Coins
		app.coins = app.game.add.group();
		app.coins.enableBody = true;
		app.map.createFromObjects('Items', 'Coin', 'tilessprite', 57, true, false, app.coins);
		app.coins.callAll('animations.add', 'animations', 'pulse', [57, 58, 59], 3, true);
		app.coins.callAll('animations.play', 'animations', 'pulse');
		app.coins.forEach(function(item) {
			item.body.allowGravity = false;
			item.body.immovable = true;
		});

		var coin = app.game.add.sprite(16, 16, "tilessprite", 58);
		coin.animations.add("flash", [57, 58, 59], 10, true, true);
		coin.animations.play("flash");

		app.player = app.game.add.sprite(64, 100, 'dude');
		app.game.physics.arcade.enable(app.player);
		app.game.physics.arcade.gravity.y = 450;

		app.player.body.bounce.y = 0;
		app.player.body.collideWorldBounds = true;
		app.player.body.setSize(16, 16, 1, 1);

		app.player.animations.add('left', [2, 4, 3], 10, true);
		app.player.animations.add('right', [7, 9, 8], 10, true);

		app.jumpButton = app.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		app.jumpTimer = 0;

		app.map.setCollisionBetween(1, 10000, true, app.layerClose);
		app.map.setCollisionBetween(1, 10000, true, app.layerDistant);
		app.map.setCollisionBetween(1, 10000, true, app.layerSky);

		app.game.camera.follow(app.player);

		app.fullScreenButton.onclick = function() {
			app.game.scale.startFullScreen(false);
		}

		app.createCallback();
	}
	this.update = function() {

		app.game.physics.arcade.collide(app.player, app.layerClose);
		app.game.physics.arcade.collide(app.player, app.powerups, app.playerPowerUpCollision, null);
		app.game.physics.arcade.overlap(app.player, app.coins, app.playerCoinCollision, null);

		app.player.body.maxVelocity .x = 200;
		app.player.body.drag.x = 1500;


		// CONTROLS
		if(app.actionManager.isInputReady) {
			if (app.actionManager.getInputState('LEFT') > 0.2)
			{
				//app.player.body.velocity.x = -150 * app.actionManager.getInputState('LEFT');
				app.player.body.acceleration.x = -250 * app.actionManager.getInputState('LEFT');;


				if (app.facing != 'left')
				{
					app.player.animations.play('left');
					app.facing = 'left';
				}
			}
			else if (app.actionManager.getInputState('RIGHT') > 0.2)
			{
				app.player.body.acceleration.x = 250 * app.actionManager.getInputState('RIGHT');

				if (app.facing != 'right')
				{
					app.player.animations.play('right');
					app.facing = 'right';
				}
			}
			else
			{
				app.player.body.acceleration.x = 0;
				if (app.facing != 'idle')
				{
					app.player.animations.stop();

					if (app.facing == 'left')
					{
						app.player.frame = 5;
					}
					else
					{
						app.player.frame = 6;
					}

					facing = 'idle';
				}
			}

			if (app.actionManager.getInputState('JUMP') && (app.player.body.onFloor() || app.player.body.touching.down) && app.game.time.now > app.jumpTimer)
			{
				app.player.body.velocity.y = -250;
				app.jumpTimer = app.game.time.now + 750;
			}

			if(!app.player.body.onFloor()) {
				app.player.animations.stop();
				if (app.facing == 'left') app.player.frame = 0;
				else app.player.frame = 11;
			}

		}
	}

	this.playerPowerUpCollision = function(obj1, obj2) {
		if(obj1.body.touching.up) {
			PowerUp.powerUpActivate(app.game, obj2);
		}

	}

	this.playerCoinCollision = function(obj1, obj2) {
		obj2.destroy();
	}
}
this.render = function() {
	app.game.debug.body(app.player);
}
$(document).ready(function() {
	var app = new App();
	app.init( $("#GoFullscreen")[0], function() {
		app.actionManager.bindSetupControls($("#SetupControls"), $("#InputSetter"), function() {
			// Controls ready
		});
	} );
});

var PowerUp = {
	_game:null,
	_obj:null,
	powerUpActivate:function(game, obj) {
		_game = game;
		_obj = obj;

		var bounce= game.add.tween(obj);
	    bounce.to({ y: obj.y - 3 }, 100, Phaser.Easing.Sinusoidal.Out);
	    bounce.onComplete.add(PowerUp.powerUpBounceMax, this);
	    bounce.start();
	},

	powerUpBounceMax:function() {
		var bounce= _game.add.tween(_obj);
	    bounce.to({ y: _obj.y + 3 }, 100, Phaser.Easing.Sinusoidal.In);
	    bounce.start();
		_obj.animations.stop();
		_obj.frame = 27;
	}
}

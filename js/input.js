function ActionManager (app) {
	var am = this;
	am.app = app;
	am.game = app.game;
	am.assignedControls = [];
	am.controlsAvailablecallback;
	am.isInputReady = false;

	am.bindSetupControls = function($SetupButton, $InputPrompts, callback) {
		am.$InputPrompts = $InputPrompts;
		am.controlsAvailablecallback = callback;
		am.game.input.gamepad.start();
		$SetupButton.click(function() {
			am.WAITSTATE = "WANTS_UP";
			$InputPrompts.children().first().show();
			$InputPrompts.fadeIn();
			am.scanTimer = setInterval(function() {
				am.listenForInput();
			},1);
		})
	}
	am.listenForInput = function() {
		var inp = am.scanPadForButtonInput(am.game.input.gamepad.pad2);

		if(inp != -1) {
			console.log(inp);
			switch(am.WAITSTATE) {
				case 'WANTS_UP':
					inp.action = "UP";
					am.assignedControls.push(inp);
					am.WAITSTATE = 'WANTS_DOWN';
					am.advanceWantedUI();
					break;
				case 'WANTS_DOWN':
					inp.action = "DOWN";
					am.assignedControls.push(inp);
					am.WAITSTATE = 'WANTS_LEFT';
					am.advanceWantedUI();
					break;
				case 'WANTS_LEFT':
					inp.action = "LEFT";
					am.assignedControls.push(inp);
					am.WAITSTATE = 'WANTS_RIGHT';
					am.advanceWantedUI();
					break;
				case 'WANTS_RIGHT':
					inp.action = "RIGHT";
					am.assignedControls.push(inp);
					am.WAITSTATE = 'WANTS_JUMP';
					am.advanceWantedUI();
					break;
				case 'WANTS_JUMP':
					inp.action = "JUMP";
					am.assignedControls.push(inp);
					am.WAITSTATE = 'WANTS_RUN';
					am.advanceWantedUI();
					break;
				case 'WANTS_RUN':
					inp.action = "RUN";
					am.assignedControls.push(inp);
					am.WAITSTATE = 'WANTS_PAUSE';
					am.advanceWantedUI();
					break;
				case 'WANTS_PAUSE':
					inp.action = "PAUSE";
					am.assignedControls.push(inp);
					am.configComplete();
					break;
			}
		}
	}
	am.scanPadForButtonInput = function(pad) {
		for(var i =0; i<pad._rawPad.buttons.length; i++) {
			var button = pad._rawPad.buttons[i];
			if(button.pressed) {
				return {type:'button', index:i};
			}
		}
		for(var i =0; i<pad._rawPad.axes.length; i++) {
			var axes = Math.abs(pad._rawPad.axes[i]);
			if(axes >= 0.9 && axes <= 1.0) {
				return {type:'axes', index:i, pos: (pad._rawPad.axes[i]>0)?true:false};
			}
		}
		return -1;
	}
	am.advanceWantedUI = function() {
		am.$InputPrompts.children(":visible")
			.first()
			.hide()
			.next()
			.show();
			clearInterval(am.scanTimer);
			setTimeout(function() {
				am.scanTimer = setInterval(function() {
					am.listenForInput();
				},1);
			},500);
	}
	am.configComplete = function() {
		am.$InputPrompts.children().hide();
		am.$InputPrompts.hide();
		clearInterval(am.scanTimer);
		am.isInputReady = true;
		am.controlsAvailablecallback();
	}
	am.getInputState = function(action) {
		for(var i in am.assignedControls) {
			var control = am.assignedControls[i];
			if(control.action == action) {
				if(control.type == 'button') {
					return am.game.input.gamepad.pad2._rawPad.buttons[control.index].pressed;
				}
				if(control.type == 'axes') {
					var axes = am.game.input.gamepad.pad2._rawPad.axes[control.index];
					if(control.pos == true) {
						return axes;
					} else {
						if(axes < 0) return Math.abs(axes);
						return 0;
					}
				}
			}

		}
	}
}

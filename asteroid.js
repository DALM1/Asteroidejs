function ready(fun) {
	if (document.readyState != 'loading') {
		fun();
	}
	else if (document.addEventListener) {
		document.addEventListener('DOMContentLoaded', fun);
	}
	else {
		document.attachEvent('onreadystatechange', function() {
			if (document.readyState != 'loading') {
				fun();
			}
		});
	}
}

ready(function() {
	const TAU = 2 * Math.PI;

	var renderContext = document.getElementById("canvas").getContext("2d");
	renderContext.lineWidth = 1;
	renderContext.strokeStyle = "#fff";

	function drawClosedShape(x, y, coords, theta, scale) {
		var cos = Math.cos(theta);
		var sin = Math.sin(theta);

		var rotatedX = 0.0;
		var rotatedY = 0.0;

		renderContext.beginPath();
		rotatedX = cos * coords[i] + sin * coords[i + 1];
		rotatedY = sin * coords[i] - cos * coords[i + 1];
		renderContext.moveTo(x + scale * rotatedX, y + scale * rotatedY);

		for (var i = 2; i < coords.length; i += 2) {
			rotatedX = cos * coords[i] + sin * coords[i + 1];
			rotatedY = sin * coords[i] - cos * coords[i + 1];
			renderContext.lineTo(x + scale * rotatedX, y + scale * rotatedY);
		}
		renderContext.closePath();

		renderContext.stroke();
	}
	function drawLineSegments(x, y, lineSegments, theta, scale) {
		var cos = Math.cos(theta);
		var sin = Math.sin(theta);

		var rotatedX = 0.0;
		var rotatedY = 0.0;

		if (!scale) {
			scale = 1.0;
		}

		renderContext.beginPath();
		for (var i = 0; i < lineSegments.length; i += 4) {
			rotatedX = cos * lineSegments[i] + sin * lineSegments[i + 1];
			rotatedY = sin * lineSegments[i] - cos * lineSegments[i + 1];
			renderContext.moveTo(x + scale * rotatedX, y + scale * rotatedY);

			rotatedX = cos * lineSegments[i + 2] + sin * lineSegments[i + 3];
			rotatedY = sin * lineSegments[i + 2] - cos * lineSegments[i + 3];
			renderContext.lineTo(x + scale * rotatedX, y + scale * rotatedY);
		}
		renderContext.stroke();

		renderContext.closePath();
	}

	const ASTEROID_SPEED = 64; // Pixels per seconds
	const ASTEROID_SIZE = 16;
	const ASTEROID_DIAMETER = 2 * ASTEROID_SIZE;
	const ASTEROID_COORDS	= new Int8Array([
		  6,-16,
		 16, -6,
		 16,  6,
		  6, 18,
		  2, 14,
		 -6, 16,
		-16,  6,
		-14, -6,
		 -8,-12,
		 -6,-16,
	]);
	function Asteroid(asteroidScale) {
		this.x = 0.0;
		this.y = 0.0;
		this.theta = TAU * Math.random();
		this.scale = asteroidScale ? asteroidScale : 1;

		var radius = this.scale * ASTEROID_SIZE
		this.radiusSquared = radius * radius;

		var direction = TAU * Math.random();
		this.xVel = ASTEROID_SPEED * Math.cos(direction);
		this.yVel = ASTEROID_SPEED * Math.sin(direction);

		if (Math.random() < 0.5) {
			this.x = Math.random() * renderContext.canvas.width;
			if (Math.random() < 0.5) {
				this.y = this.scale * -ASTEROID_SIZE;
			}
			else {
				this.y = renderContext.canvas.height + this.scale * ASTEROID_SIZE;
			}
		}
		else {
			if (Math.random() < 0.5) {
				this.x = this.scale * -ASTEROID_SIZE;
			}
			else {
				this.x = renderContext.canvas.width + this.scale * ASTEROID_SIZE;
			}
			this.y = Math.random() * renderContext.canvas.height;
		}

		this.isAlive = true;

		return this;
	}
	Asteroid.prototype.isPointInside = function(x, y) {
		var xDist = x - this.x;
		var yDist = y - this.y;

		var distSquared = xDist * xDist + yDist * yDist;

		return distSquared < this.radiusSquared;
	};
	Asteroid.prototype.kill = function() {
		this.isAlive = false;
	};
	Asteroid.prototype.process = function(delta) {
		var nextX = this.x + delta * this.xVel;
		var nextY = this.y + delta * this.yVel;

		if (nextX < this.scale * -ASTEROID_SIZE) {
			nextX += renderContext.canvas.width + this.scale * ASTEROID_DIAMETER;
		}
		else if (nextX > renderContext.canvas.width + this.scale * ASTEROID_SIZE) {
			nextX -= renderContext.canvas.width + this.scale * ASTEROID_DIAMETER;
		}

		this.x = nextX;

		if (nextY < this.scale * -ASTEROID_SIZE) {
			nextY += renderContext.canvas.height + this.scale * ASTEROID_DIAMETER;
		}
		else if (nextY > renderContext.canvas.height + this.scale * ASTEROID_SIZE) {
			nextY -= renderContext.canvas.height + this.scale * ASTEROID_DIAMETER;
		}

		this.y = nextY;
	};
	Asteroid.prototype.render = function() {
		drawClosedShape(this.x, this.y, ASTEROID_COORDS, this.theta, this.scale);
	};

	var asteroids = [
		new Asteroid(3)
	];

	function PlasmaBolt(ship) {
		this.x = ship.x;
		this.y = ship.y;
		this.theta = ship.theta;

		this.xVel = ship.xVel + ship.cos * PlasmaBolt.SPEED;
		this.yVel = ship.yVel + ship.sin * PlasmaBolt.SPEED;

		this.life = PlasmaBolt.LIFETIME;
		this.isAlive = true;
	}
	PlasmaBolt.prototype.kill = function() {
		this.isAlive = false;
	};
	PlasmaBolt.prototype.process = function(delta) {
		if (this.isAlive) {
			this.life -= delta;
			if (this.life <= 0) {
				this.isAlive = false;
			}

			var nextX = this.x + delta * this.xVel;
			var nextY = this.y + delta * this.yVel;

			if (nextX < 0) {
				nextX += renderContext.canvas.width;
			}
			else if (nextX > renderContext.canvas.width) {
				nextX -= renderContext.canvas.width;
			}

			this.x = nextX;

			if (nextY < 0) {
				nextY += renderContext.canvas.height;
			}
			else if (nextY > renderContext.canvas.height) {
				nextY -= renderContext.canvas.height;
			}

			this.y = nextY;
		}
	};
	PlasmaBolt.prototype.render = function() {
		drawLineSegments(this.x, this.y, PlasmaBolt.LINES, this.theta);
	};
	PlasmaBolt.FIRE_DELAY = 0.25; // in sec
	PlasmaBolt.LIFETIME = 1.5; // in sec
	PlasmaBolt.LINES = new Int8Array([
		 0, 0,
		-8, 0
	]);
	PlasmaBolt.SPEED = 1024; // in px/ms
	var plasmaBolts = [];

	const SHIP_LINES = new Int8Array([
		 20,  0,
		-20,-12,
		 20,  0,
		-20, 12,
		-10, -8,
		-10,  8
	]);
	function Player() {
		this.reset();
	};
	Player.REVIVE_DELAY = 2500; // in milliseconds
	Player.MIN_SPEED = -512;
	Player.MAX_SPEED = 512;
	Player.THRUST_SPEED = 256;
	Player.TURN_SPEED = 3.0;
	Player.prototype.reset = function() {
		this.x = renderContext.canvas.width / 2;
		this.y = renderContext.canvas.height / 2;
		this.theta = TAU / -4;

		this.cos = Math.cos(this.theta);
		this.sin = Math.sin(this.theta);
		this.turnDirection = 0;

		this.xVel = 0.0;
		this.yVel = 0.0;

		this.fireCountdown = 0.0;
		this.isAlive = true;
	};
	Player.prototype.move = function(delta) {
		if (inputStatus.thrust) {
			this.xVel = Math.min(Player.MAX_SPEED, Math.max(Player.MIN_SPEED, this.xVel + delta * this.cos * Player.THRUST_SPEED));
			this.yVel = Math.min(Player.MAX_SPEED, Math.max(Player.MIN_SPEED, this.yVel + delta * this.sin * Player.THRUST_SPEED));
		}

		var nextX = this.x + delta * this.xVel;
		var nextY = this.y + delta * this.yVel;

		if (nextX < 0) {
			nextX += renderContext.canvas.width;
		}
		else if (nextX > renderContext.canvas.width) {
			nextX -= renderContext.canvas.width;
		}

		this.x = nextX;

		if (nextY < 0) {
			nextY += renderContext.canvas.height;
		}
		else if (nextY > renderContext.canvas.height) {
			nextY -= renderContext.canvas.height;
		}

		this.y = nextY;
	};
	Player.prototype.turn = function(delta) {
		var newTurnDirection = 0;
		if (inputStatus.turnRight) {
			newTurnDirection += 1;
		}
		if (inputStatus.turnLeft) {
			newTurnDirection -= 1;
		}

		if (this.turnDirection != newTurnDirection) {
			this.turnDirection = newTurnDirection;
		}

		this.theta += delta * Player.TURN_SPEED * this.turnDirection;

		if (this.theta < 0) {
			this.theta += TAU;
		}
		else if (this.theta >= TAU) {
			this.theta -= TAU;
		}

		this.sin = Math.sin(this.theta);
		this.cos = Math.cos(this.theta);
	};
	Player.prototype.kill = function() {
		this.isAlive = false;

		setTimeout(this.reset.bind(this), Player.REVIVE_DELAY);
	};
	Player.prototype.handleWeapons = function(delta) {
		if (this.fireCountdown > 0) {
			this.fireCountdown -= delta;

			if (this.fireCountdown < 0) {
				this.fireCountdown = 0.0;
			}
		}

		if (this.fireCountdown === 0 && inputStatus.fire) {
			var bolt = new PlasmaBolt(this);
			plasmaBolts.push(bolt);

			this.fireCountdown = PlasmaBolt.FIRE_DELAY;
		}
	};
	Player.prototype.process = function(delta) {
		if (this.isAlive) {
			this.handleWeapons(delta);
			this.turn(delta);
			this.move(delta);
		}
	};
	Player.prototype.render = function() {
		if (this.isAlive) {
			drawLineSegments(this.x, this.y, SHIP_LINES, this.theta, 0.75);
		}
	};

	var ship = new Player;

	var inputStatus = {
		thrust: false,
		turnRight: false,
		turnLeft: false,
		fire: false
	};
	function handleKeydown(event) {
		if (!event.repeat) {
			switch (event.key) {
				case "w":
					inputStatus.thrust = true;
					break;
				case "d":
					inputStatus.turnRight = true;
					break;
				case "a":
					inputStatus.turnLeft = true;
					break;
				case " ":
					inputStatus.fire = true;
					break;
			}
		}
	}
	function handleKeyup(event) {
		switch (event.key) {
			case "w":
				inputStatus.thrust = false;
				break;
			case "d":
				inputStatus.turnRight = false;
				break;
			case "a":
				inputStatus.turnLeft = false;
				break;
			case " ":
				inputStatus.fire = false;
				break;
		}
	}
	document.addEventListener("keydown", handleKeydown);
	document.addEventListener("keyup", handleKeyup);

	function handleCollisions() {
		for (var i = 0; i < asteroids.length; i++) {
			if (asteroids[i].isAlive) {
				if (ship.isAlive && asteroids[i].isPointInside(ship.x, ship.y)) {
					ship.kill();
					asteroids[i].kill();
				}
				else {
					for (var i = 0; i < plasmaBolts.length; i++) {
						if (plasmaBolts[i].isAlive && asteroids[i].isPointInside(plasmaBolts[i].x, plasmaBolts[i].y)) {
							plasmaBolts[i].kill();
							asteroids[i].kill();
						}
					}
				}
			}
		}
	}

	function process(delta) {
		var asteroidDeleteQueue = [];
		for (var i = 0; i < asteroids.length; i++) {
			if (asteroids[i].isAlive) {
				asteroids[i].process(delta);
			}
			else {
				asteroidDeleteQueue.unshift(i);
			}
		}
		for (var i = 0; i < asteroidDeleteQueue.length; i++) {
			asteroids.splice(asteroidDeleteQueue[i], 1);
		}

		ship.process(delta);

		var boltDeleteQueue = [];
		for (var i = 0; i < plasmaBolts.length; i++) {
			if (plasmaBolts[i].isAlive) {
				plasmaBolts[i].process(delta);
			}
			else {
				boltDeleteQueue.unshift(i);
			}
		}
		for (var i = 0; i < boltDeleteQueue.length; i++) {
			plasmaBolts.splice(boltDeleteQueue[i], 1);
		}

		handleCollisions();
	}
	function render() {
		renderContext.clearRect(0, 0, renderContext.canvas.width, renderContext.canvas.height);

		for (var i = 0; i < asteroids.length; i++) {
			asteroids[i].render();
		}
		ship.render();
		for (var i = 0; i < plasmaBolts.length; i++) {
			plasmaBolts[i].render();
		}
	}

	var previousTimestamp = 0.0;
	function frameStep(timestamp) {
		if (previousTimestamp == 0) {
			previousTimestamp = timestamp;
		}

		var delta = (timestamp - previousTimestamp) / 1000;

		process(delta);
		render();

		previousTimestamp = timestamp;
		window.requestAnimationFrame(frameStep);
	}

	window.requestAnimationFrame(frameStep);
});



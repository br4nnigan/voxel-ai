(function (d) {

	"use strict";

	var Voxel = require("./Voxel");

	// dom
	var divOut = document.getElementById("out");
	var toggle = document.getElementById("toggle");
	var clear = document.getElementById("clear");
	var next = document.getElementById("next");
	var divFps = document.getElementById("fps_out");
	var inputFps = document.getElementById("fps_in");
	var canvas = document.getElementById("c");

	var onDead = "loop"; // reset, loop, stop

	// state
	var running = false;
	var mousedown = false;
	var resizeTimer = 0;
	var fpsMax = -1;
	var canvasScaledX = 0;
	var canvasScaledY = 0;
	var scale = 4;

	var adam = null;
	var voxels = [];

	var frame = 0;
	var time = 0;
	var fps = 0;
	var interval = 0;


	(function initialize() {

		canvas.addEventListener("mousedown", onCanvasMouseDown);
		canvas.addEventListener("mouseup", onCanvasMouseUp);
		canvas.addEventListener("mouseleave", onCanvasMouseLeave);
		canvas.addEventListener("mousemove", onCanvasMouseMove);

		toggle.addEventListener("click", onToggleRequest);
		clear.addEventListener("click", onClearRequest);
		next.addEventListener("click", onNextFrameRequest);

		inputFps.addEventListener("input", onFpsInput);

		window.addEventListener("resize", onWindowResize);

		sizeCanvas();
		genesis();
		setVoxelProperties();

	})();


	function sizeCanvas() {

		canvas.width = window.innerWidth - (parseInt(getComputedStyle(document.body).marginLeft) * 2);
		canvas.height = window.innerHeight - (parseInt(getComputedStyle(document.body).marginTop) * 2) - canvas.offsetTop;

		canvasScaledX = Math.floor(canvas.width / scale);
		canvasScaledY = Math.floor(canvas.height / scale);

		requestAnimationFrame(function () {
			frame = 0;
			renderVoxels(true);
		});
	}


	function genesis() {


		for (var x = 0, col; x < canvasScaledX; x++) {

			voxels[x] = voxels[x] || [];
			col = voxels[x];

			for (var y = 0; y < canvasScaledY; y++) {

				col[y] = col[y] || new Voxel( x, y, canvas );

// 				if ( y == canvasScaledY - 1 && col[y + 1] ) {
// console.log('test');
// 					col.length = canvasScaledY;
// 				}
			}

			// if ( x == canvasScaledX - 1 && voxels[x + 1] ) {

			// 	voxels.length =  canvasScaledX;
			// }
		}
		console.log("genesis", voxels.length, voxels[0].length, canvas.height );

	}

	function setVoxelProperties() {

		for (var x = 0, voxel; x < voxels.length; x++) {

			var r = Math.random();
			var col = voxels[x];

			for (var y = 0, prevCol, nextCol, prev; y < voxels[x].length; y++) {

				voxel = voxels[x][y];

				if ( voxel.x !== null ) {
					continue;
				}

				voxel.x = x;
				voxel.y = y;

				prevCol = voxels[x-1];
				nextCol = voxels[x+1];

				voxel.tl = prevCol ? prevCol[y-1] : undefined;
				voxel.t  = col[y-1] || undefined;
				voxel.tr = nextCol ? nextCol[y-1] : undefined;
				voxel.r  = nextCol ? nextCol[y] : undefined;
				voxel.br = nextCol ? nextCol[y+1] : undefined;
				voxel.b  = col[y+1] || undefined;
				voxel.bl = prevCol ? prevCol[y+1] : undefined;
				voxel.l  = prevCol ? prevCol[y] : undefined;

				voxel.isAlive = false;
				voxel.scale = scale;

				// voxel.isAlive = (y > 50 && y < 60 && x > 50 && x < 60 );
				// voxel.isAlive = (y===3 && x > 1 && x < 5)
				// voxel.isAlive = r * Math.random() > 0.2;

				if ( prev ) {
					prev.next = voxel;
				}

				if ( x === 0 && y === 0 ) {
					adam = voxel;
				}
				prev = voxel;
			}
		}
	}

	function out(str) {
		var row = document.createElement("div");
			row.textContent = str;

		divOut.appendChild(row);
		divOut.scrollTop = divOut.scrollHeight;

		if ( divOut.children.length > 20 ) {
			divOut.removeChild(divOut.children[0]);
		}
	}



	function renderVoxels(force) {

		var voxel = adam;
		var livingVoxels = 0;

		if ( !voxel ) {
			return;
		}

		do {
			if ( voxel.x > canvasScaledX || voxel.y > canvasScaledY ) {
				continue;
			}

			voxel.wasAlive = voxel.isAlive;

			if ( frame > 0 ) {
				voxel.isAlive = voxel.feelsAlive();
			}
			if ( voxel.isAlive ) livingVoxels++;

			voxel.render(force);

		} while ( voxel = voxel.next );

		return livingVoxels;
	}

	function start() {

		out( "started" );

		frame = 0;
		running = true;
		onAnimationFrame();
		interval = setInterval(function () {
			divFps.textContent = fps + " fps";
		}, 200);
	}

	function stop() {

		running = false;
		clearInterval(interval);
		divFps.innerHTML = "&nbsp;";
		out( "stopped" );
	}

	function getVoxel(x, y) {

		x = Math.floor(x / scale);
		y = Math.floor(y / scale);

		var voxel = voxels[x] ? voxels[x][y] : null;
		return voxel;
	}

	function onCanvasMouseDown(event) {

		mousedown = true;

		var x = event.clientX - event.target.offsetLeft;
		var y = event.clientY - event.target.offsetTop;
		var voxel = getVoxel(x, y);

		console.log(x, y, voxel, voxels.length, voxels[0].length);

		if ( voxel ) {
			voxel.isAlive = true;
			voxel.render();
		}
	}

	function onCanvasMouseMove(event) {

		if ( mousedown ) {

			var voxel;
			var x = event.clientX - event.target.offsetLeft;
			var y = event.clientY - event.target.offsetTop;

			voxel = getVoxel(x, y);
			if ( voxel ) {
				voxel.isAlive = true;
				voxel.render();
			}
			voxel = getVoxel(x-1, y);
			if ( voxel ) {
				voxel.isAlive = true;
				voxel.render();
			}
			voxel = getVoxel(x, y-1);
			if ( voxel ) {
				voxel.isAlive = true;
				voxel.render();
			}
			voxel = getVoxel(x+1, y);
			if ( voxel ) {
				voxel.isAlive = true;
				voxel.render();
			}
			voxel = getVoxel(x, y+1);
			if ( voxel ) {
				voxel.isAlive = true;
				voxel.render();
			}
		}
	}

	function onCanvasMouseUp() {
		mousedown = false;
	}

	function onCanvasMouseLeave() {
		mousedown = false;
	}

	function onToggleRequest() {

		if ( running ) {
			stop();
		} else {
			start();
		}
	}

	function onClearRequest() {

		for (var x = 0; x < canvas.width; x++) {
			for (var y = 0, voxel ; y < canvas.height; y++) {
				voxel = voxels[x][y];
				voxel.isAlive = false;
				voxel.wasAlive = false;
				voxel.render();
			}
		}
	}

	function onFpsInput() {

		fpsMax = inputFps.value || -1;
	}

	function onNextFrameRequest() {

		if ( !running ){
			nextFrame();
		}
	}

	function nextFrame() {

		frame++;
		if ( fpsMax === -1 ) {
			window.requestAnimationFrame(onAnimationFrame);
		} else {
			setTimeout(onAnimationFrame, 1000 / fpsMax );
		}
	}

	function onWindowResize() {

		sizeCanvas();

		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(function () {
			genesis();
			setVoxelProperties();
		}, 1000);
	}

	function onAnimationFrame() {

		var now = new Date().getTime();
		fps = Math.round(1000 / (now - time));
		time = now;

		var livingVoxels = renderVoxels();

		if ( livingVoxels === 0 ) {

			switch ( onDead ) {

				case "reset":
					out( "all dead after frame "+frame );
					frame = 0;
					setVoxelProperties();
					break;

				case "stop":
					out( "all dead after frame "+frame );
					stop();
					break;

				case "loop":
					// do nothing
			}
		}

		if ( running ) {
			nextFrame();
		}
	}



})(document);

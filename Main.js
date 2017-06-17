(function (d) {

	"use strict";

	var Voxel = require("./Voxel");

	// dom
	var divOut = d.getElementById("out");
	var toggle = d.getElementById("toggle");
	var clear = d.getElementById("clear");
	var next = d.getElementById("next");
	var divFps = d.getElementById("fps_out");
	var inputFps = d.getElementById("fps_in");
	var inputScale = d.getElementById("scale");
	var canvas = d.getElementById("c");

	// state
	var running = false;
	var mousedown = false;
	var resizeTimer = 0;
	var fpsMax = -1;
	var canvasScaledX = 0;
	var canvasScaledY = 0;
	var scale = 1;

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
		inputScale.addEventListener("input", onScaleInput);

		window.addEventListener("resize", onWindowResize);

		scale = inputScale.value || 1;
		fpsMax = inputFps.value || -1;

		sizeCanvas();
		genesis();
		givePropertiesToVoxels();

	})();


	function sizeCanvas() {

		canvas.width = window.innerWidth - (parseInt(getComputedStyle(d.body).marginLeft) * 2);
		canvas.height = window.innerHeight - (parseInt(getComputedStyle(d.body).marginTop) * 2) - canvas.offsetTop;

		canvasScaledX = Math.floor(canvas.width / scale);
		canvasScaledY = Math.floor(canvas.height / scale);

		// setting canvas width/height clears canvas, so we have to rerender every voxel
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

				if ( x === 0 && y === 0 ) {
					adam = col[y];
				}
// 				if ( y == canvasScaledY - 1 && col[y + 1] ) {
// 					col.length = canvasScaledY;
// 				}
			}

			// if ( x == canvasScaledX - 1 && voxels[x + 1] ) {
			// 	voxels.length =  canvasScaledX;
			// }
		}
		// console.log("genesis, voxels:", voxels.length + "x" + voxels[0].length, "canvas: " + canvas.width + "x" + canvas.height, "adam:", adam );

	}

	function givePropertiesToVoxels() {

		for (var x = 0, voxel; x < canvasScaledX; x++) {
			for (var y = 0, prev, prevCol, currCol, nextCol; y < canvasScaledY; y++) {


				currCol = voxels[x];

				voxel = currCol[y];

				if ( voxel.x !== null ) break;

				prevCol = voxels[x-1];
				nextCol = voxels[x+1];


				voxel.x = x;
				voxel.y = y;

				voxel.scale = scale;

				voxel.tl = prevCol ? prevCol[y-1] : undefined;
				voxel.t  = currCol[y-1] || undefined;
				voxel.tr = nextCol ? nextCol[y-1] : undefined;
				voxel.r  = nextCol ? nextCol[y] : undefined;
				voxel.br = nextCol ? nextCol[y+1] : undefined;
				voxel.b  = currCol[y+1] || undefined;
				voxel.bl = prevCol ? prevCol[y+1] : undefined;
				voxel.l  = prevCol ? prevCol[y] : undefined;

				voxel.isAlive = false;

				if ( prev ) {
					prev.next = voxel;
				}
				prev = voxel;
			}
		}
	}

	function eachVoxel(callbackFn) {

		if ( !adam ) return;
		var voxel = adam;

		do {
			if ( voxel.x <= canvasScaledX && voxel.y <= canvasScaledY ) {
				callbackFn(voxel);
			}
		} while ( voxel = voxel.next );
	}

	// function out(str) {

	// 	var row = d.createElement("div");
	// 		row.textContent = str;

	// 	divOut.appendChild(row);
	// 	divOut.scrollTop = divOut.scrollHeight;

	// 	if ( divOut.children.length > 20 ) {
	// 		divOut.removeChild(divOut.children[0]);
	// 	}
	// }

	function renderVoxels(force) {

		var voxel = adam;
		var livingVoxels = 0;

		if ( !voxel ) {
			return;
		}

		eachVoxel(function (voxel) {

			voxel.wasAlive = voxel.isAlive;

			if ( frame > 0 ) {
				voxel.isAlive = voxel.feelsAlive();
			}
			if ( voxel.isAlive ) livingVoxels++;

			voxel.render(force);
		});

		return livingVoxels;
	}

	function start() {

		// out( "started" );

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
		// out( "stopped" );
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

			var x = event.clientX - event.target.offsetLeft;
			var y = event.clientY - event.target.offsetTop;

			var voxel = getVoxel(x, y);
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

	function onScaleInput() {

		var newValue = inputScale.value || 1;
		var oldValue = scale;

		scale = inputScale.value || 1;

		canvasScaledX = Math.floor(canvas.width / scale);
		canvasScaledY = Math.floor(canvas.height / scale);

		if ( newValue < oldValue ) {
			genesis();
			givePropertiesToVoxels();
		}

		eachVoxel(function (voxel) {
			voxel.scale = scale;
		});
		console.log("onscaleinput", newValue);
		console.log("adam", adam);

		requestAnimationFrame(function () {
			frame = 0;
			renderVoxels(true);
		});
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

		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(function () {

			sizeCanvas();
			genesis();
			givePropertiesToVoxels();
		}, 1000);
	}

	function onAnimationFrame() {

		var now = new Date().getTime();
		fps = Math.round(1000 / (now - time));
		time = now;

		renderVoxels();

		if ( running ) {
			nextFrame();
		}
	}

})(document);

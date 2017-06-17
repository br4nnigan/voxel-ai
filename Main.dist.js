(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (d) {

	"use strict";

	var Voxel = require("./Voxel");

	// dom
	var divOut = document.getElementById("out");
	var toggle = document.getElementById("toggle");
	var clear = document.getElementById("clear");
	var divFps = document.getElementById("fps");
	var canvas = document.getElementById("c");

	var onDead = "loop"; // reset, loop, stop

	// state
	var running = false;
	var mousedown = false;

	var adam = null;
	var voxels = [];

	var frame = 0;
	var time = 0;
	var fps = 0;
	var interval = 0;

	(function initialize() {

		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		canvas.width = 300;
		canvas.height = 200;

		canvas.addEventListener("mousedown", onCanvasMouseDown);
		canvas.addEventListener("mouseup", onCanvasMouseUp);
		canvas.addEventListener("mouseleave", onCanvasMouseLeave);
		canvas.addEventListener("mousemove", onCanvasMouseMove);

		toggle.addEventListener("click", onToggle);
		clear.addEventListener("click", onClear);

		genesis();
		setVoxelProperties();

	})();

	function genesis() {

		for (var x = 0, col; x < canvas.width; x++) {

			col = [];
			voxels[voxels.length] = col;

			for (var y = 0; y < canvas.height; y++) {

				col[col.length] = new Voxel( x, y, canvas );
			}
		}
	}

	function setVoxelProperties() {

		for (var x = 0, voxel; x < canvas.width; x++) {

			var r = Math.random();
			var col = voxels[x];

			for (var y = 0, prevCol, nextCol, prev; y < canvas.height; y++) {

				voxel = voxels[x][y];

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

				// voxel.isAlive = (y > 50 && y < 60 && x > 50 && x < 60 );
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

	function onToggle() {

		if ( running ) {
			stop();
		} else {
			start();
		}
	}

	function onClear() {

		for (var x = 0; x < canvas.width; x++) {
			for (var y = 0, voxel ; y < canvas.height; y++) {
				voxel = voxels[x][y];
				voxel.isAlive = false;
				voxel.render();
			}
		}
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

		var voxel = voxels[x] ? voxels[x][y] : null;
		return voxel;
	}
	function onCanvasMouseDown(event) {
		console.log(event);
		mousedown = true;

		var x = event.clientX - event.target.offsetLeft;
		var y = event.clientY - event.target.offsetTop;
		var voxel = getVoxel(x, y);

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

	function renderVoxels() {

		var voxel = adam;
		var livingVoxels = 0;

		do {
			voxel.wasAlive = voxel.isAlive;
			if ( frame > 0 ) {
				voxel.isAlive = voxel.feelsAlive();
			}
			if ( voxel.isAlive ) livingVoxels++;

			if ( frame%2 === 0 ) {
				voxel.render();
			}
		} while ( voxel = voxel.next );

		return livingVoxels;
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

			frame++;
			window.requestAnimationFrame(onAnimationFrame);
		}
	}



})(document);

},{"./Voxel":2}],2:[function(require,module,exports){
function Voxel( x, y, canvas ) {

	var ctx = canvas.getContext("2d");

	this.tl = null;
	this.t = null;
	this.tr = null;
	this.r = null;
	this.br = null;
	this.b = null;
	this.bl = null;
	this.l = null;


	this.x = null;
	this.y = null;

	this.next = null;
	this.isAlive = false;

	this.feelsAlive = function () {
		var contacts = 0;
		if ( this.tl && this.tl.wasAlive ) {
			contacts++;
		}
		if ( this.t && this.t.wasAlive ) {
			contacts++;
		}
		if ( this.tr && this.tr.wasAlive ) {
			contacts++;
		}
		if ( this.r && this.r.isAlive ) {
			contacts++;
		}
		if ( this.br && this.br.isAlive ) {
			contacts++;
		}
		if ( this.b && this.b.isAlive ) {
			contacts++;
		}
		if ( this.bl && this.b.isAlive ) {
			contacts++;
		}
		if ( this.l && this.l.wasAlive ) {
			contacts++;
		}
		return contacts === 2 || contacts === 1;
	};

	this.render = function () {

		ctx.fillStyle = this.isAlive ? 'black' : 'white';
		ctx.fillRect(x, y, 1, 1);
	}

	if ( !(canvas.width > x && canvas.height > y) ) this.render = function () {
		console.log("emptyrender");
	}
}





module.exports = Voxel;
},{}]},{},[1]);

(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
		if ( this.tl && this.tl.isAlive ) {
			contacts++;
		}
		if ( this.t && this.t.isAlive ) {
			contacts++;
		}
		if ( this.tr && this.tr.isAlive ) {
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
		if ( this.bl && this.bl.isAlive ) {
			contacts++;
		}
		if ( this.l && this.l.isAlive ) {
			contacts++;
		}
		return this.isAlive ? contacts === 3 || contacts === 2 : contacts === 3;
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

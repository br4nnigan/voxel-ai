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
	this.isAlive = null;
	this.wasAlive = null;
	this.scale = 1;

	this.feelsAlive = function () {
		var contacts = 0;
		if ( this.tl && this.tl.wasAlive ) {
			contacts++;
		}
		if ( this.t && this.t.wasAlive ) {
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
		if ( this.bl && this.bl.wasAlive ) {
			contacts++;
		}
		if ( this.l && this.l.wasAlive ) {
			contacts++;
		}
		return this.isAlive ? contacts === 3 || contacts === 2 : contacts === 3;
	};

	this.render = function (force) {

		var s = this.scale;

		if ( this.wasAlive == this.isAlive && !force ) return;

		ctx.fillStyle = this.isAlive ? 'black' : 'white';
		ctx.fillRect(x*s, y*s, 1*s, 1*s);
	};
}





module.exports = Voxel;
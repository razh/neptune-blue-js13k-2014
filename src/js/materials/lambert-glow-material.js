'use strict';

var LambertMaterial = require( './lambert-material' );
var Filter = require( '../math/filter' );

function LambertGlowMaterial( options ) {
  options = options || {};
  LambertMaterial.call( this, options );

  this.blur = options.blur || 0;
  this.filter = new Filter();
}

LambertGlowMaterial.prototype = Object.create( LambertMaterial.prototype );
LambertGlowMaterial.prototype.constructor = LambertGlowMaterial;

LambertGlowMaterial.prototype.draw = function( ctx, color, alpha, intensity ) {
  ctx.shadowBlur = this.blur * intensity;
  LambertMaterial.prototype.draw.call( this, ctx, color, alpha );
};

module.exports = LambertGlowMaterial;

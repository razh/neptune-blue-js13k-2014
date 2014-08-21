'use strict';

var LambertMaterial = require( './lambert-material' );

function LambertGlowMaterial( options ) {
  options = options || {};
  LambertMaterial.call( this, options );
  this.blur = options.blur || 0;
}

LambertGlowMaterial.prototype = Object.create( LambertMaterial.prototype );
LambertGlowMaterial.prototype.constructor = LambertGlowMaterial;

LambertGlowMaterial.prototype.draw = function( ctx, color, intensity ) {
  ctx.shadowBlur = this.blur * intensity;
  LambertMaterial.prototype.draw.call( this, ctx, color );
};

module.exports = LambertGlowMaterial;

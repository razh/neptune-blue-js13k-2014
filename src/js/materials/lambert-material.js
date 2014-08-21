'use strict';

var Color = require( '../math/color' );
var Material = require( './material' );

function LambertMaterial( options ) {
  Material.call( this, options );

  this.ambient = options.ambient || new Color();
  this.diffuse = options.diffuse || new Color();
  this.emissive = options.emissive || new Color();

  this.batch = false;
}

LambertMaterial.prototype = Object.create( Material.prototype );
LambertMaterial.prototype.constructor = LambertMaterial;

LambertMaterial.prototype.draw = function( ctx, color ) {
  color = color.toString();

  ctx.fillStyle = color;
  ctx.strokeStyle = color;

  Material.prototype.draw.call( this, ctx );
};

module.exports = LambertMaterial;

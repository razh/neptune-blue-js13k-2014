'use strict';

var Color = require( '../math/color' );

var FrontSide  = 0,
    BackSide   = 1,
    DoubleSide = 2;

function Material( options ) {
  options = options || {};

  this.batch = ( options.batch !== undefined ) ? options.batch : true;
  this.side = options.side || FrontSide;

  this.color = options.color || new Color();
  this.opacity = ( options.opacity !== undefined ) ? options.opacity : 1;
  this.lineWidth = options.lineWidth || 0;

  this.fillVisible = ( options.fillVisible !== undefined ) ? options.fillVisible : true;
  this.wireframe = ( options.wireframe !== undefined ) ? options.wireframe : true;

  this.shadowColor = options.shadowColor || new Color();
  this.shadowBlur = options.shadowBlur || 0;

  this.blending = options.blending || 'source-over';
}

Material.prototype.set = function( ctx ) {
  var color = this.color.toString();

  ctx.fillStyle = color;
  ctx.strokeStyle = color;

  ctx.globalAlpha = this.opacity;
  ctx.lineWidth = this.lineWidth;

  ctx.shadowColor = this.shadowColor.toString();
  ctx.shadowBlur = this.shadowBlur;

  ctx.globalCompositeOperation = this.blending;
};

Material.prototype.draw = function( ctx ) {
  if ( this.fillVisible ) {
    ctx.fill();
  }

  if ( this.wireframe ) {
    ctx.stroke();
  }
};

Material.FrontSide = FrontSide;
Material.BackSide = BackSide;
Material.DoubleSide = DoubleSide;

module.exports = Material;

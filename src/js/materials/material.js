'use strict';

function Material( options ) {
  options = options || {};

  this.batch = options.batch || false;

  this.alpha = options.alpha || 0;
  this.fill = options.fill || 0;
  this.stroke = options.stroke || 0;
  this.lineWidth = options.lineWidth || 0;

  this.shadowColor = options.shadowColor || 0;
  this.shadowBlur = options.shadowBlur || 0;
}

Material.prototype.set = function( ctx ) {
  ctx.globalAlpha = this.alpha;
  ctx.fillStyle = this.fill;
  ctx.strokeStyle = this.stroke;
  ctx.lineWidth = this.lineWidth;

  ctx.shadowColor = this.shadowColor;
  ctx.shadowBlur = this.shadowBlur;
};

module.exports = Material;

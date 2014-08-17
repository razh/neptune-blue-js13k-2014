/*jshint bitwise:false*/
'use strict';

var lerp = require( './utils' ).lerp;

// RGB values are ints from [0, 255].
function Color( r, g, b ) {
  this.r = r || 0;
  this.g = g || 0;
  this.b = b || 0;
}

Color.prototype.toString = function() {
  return 'rgb(' +
    ( this.r | 0 ) + ', ' +
    ( this.g | 0 ) + ', ' +
    ( this.b | 0 ) +
  ')';
};

Color.prototype.lerp = function( color, alpha ) {
  this.r = lerp( this.r, color.r, alpha );
  this.g = lerp( this.g, color.g, alpha );
  this.b = lerp( this.b, color.b, alpha );
  return this;
};

Color.prototype.copy = function( color ) {
  this.r = color.r;
  this.g = color.g;
  this.b = color.b;
  return this;
};

module.exports = Color;

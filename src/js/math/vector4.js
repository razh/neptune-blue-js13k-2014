'use strict';

function Vector4( x, y, z, w ) {
  this.x = x || 0;
  this.y = y || 0;
  this.z = z || 0;
  this.w = ( w !== undefined ) ? w : 1;
}

Vector4.prototype.set = function( x, y, z, w ) {
  this.x = x;
  this.y = y;
  this.z = z;
  this.w = w;
  return this;
};

Vector4.prototype.copy = function( v ) {
  this.x = v.x;
  this.y = v.y;
  this.z = v.z;
  this.w = ( v.w !== undefined ) ? v.w : 1;
  return this;
};

Vector4.prototype.applyMatrix4 = function( m ) {
  var x = this.x,
      y = this.y,
      z = this.z,
      w = this.w;

  this.x = m[ 0 ] * x + m[ 4 ] * y + m[  8 ] * z + m[ 12 ] * w;
  this.y = m[ 1 ] * x + m[ 5 ] * y + m[  9 ] * z + m[ 13 ] * w;
  this.z = m[ 2 ] * x + m[ 6 ] * y + m[ 10 ] * z + m[ 14 ] * w;
  this.w = m[ 3 ] * x + m[ 7 ] * y + m[ 11 ] * z + m[ 15 ] * w;

  return this;
};

module.exports = Vector4;

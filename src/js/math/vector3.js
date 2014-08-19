'use strict';

/**
 * Based heavily off of the three.js Vector3 class.
 * https://github.com/mrdoob/three.js/blob/master/src/math/Vector3.js
 */
function Vector3( x, y, z ) {
  this.x = x || 0;
  this.y = y || 0;
  this.z = z || 0;
}

Vector3.prototype.set = function( x, y, z ) {
  this.x = x;
  this.y = y;
  this.z = z;
  return this;
};

Vector3.prototype.add = function( v ) {
  this.x += v.x;
  this.y += v.y;
  this.z += v.z;
  return this;
};

Vector3.prototype.subVectors = function( a, b ) {
  this.x = a.x - b.x;
  this.y = a.y - b.y;
  this.z = a.z - b.z;
  return this;
};

Vector3.prototype.multiplyScalar = function( scalar ) {
  this.x *= scalar;
  this.y *= scalar;
  this.z *= scalar;
  return this;
};

Vector3.prototype.min = function( v ) {
  if ( this.x > v.x ) { this.x = v.x; }
  if ( this.y > v.y ) { this.y = v.y; }
  if ( this.z > v.z ) { this.z = v.z; }
  return this;
};

Vector3.prototype.max = function( v ) {
  if ( this.x < v.x ) { this.x = v.x; }
  if ( this.y < v.y ) { this.y = v.y; }
  if ( this.z < v.z ) { this.z = v.z; }
  return this;
};

Vector3.prototype.copy = function( v ) {
  this.x = v.x;
  this.y = v.y;
  this.z = v.y;
  return this;
};

Vector3.prototype.cross = function( v ) {
  var x = this.x,
      y = this.y,
      z = this.z;

  this.x = y * v.z - z * v.y;
  this.y = z * v.x - x * v.z;
  this.z = x * v.y - y * v.x;

  return this;
};

Vector3.prototype.dot = function( v ) {
  return this.x * v.x + this.y * v.y + this.z * v.z;
};

Vector3.prototype.lengthSq = function() {
  return this.x * this.x + this.y * this.y + this.z * this.z;
};

Vector3.prototype.length = function() {
  return Math.sqrt( this.lengthSq() );
};

Vector3.prototype.distanceToSquared = function( v ) {
  var dx = this.x - v.x,
      dy = this.y - v.y,
      dz = this.z - v.z;

  return dx * dx + dy * dy + dz * dz;
};

Vector3.prototype.normalize = function() {
  var length = this.length();
  return this.multiplyScalar( length ? 1 / length : 0 );
};

Vector3.prototype.applyProjection = function( m, near, far ) {
  var x = this.x,
      y = this.y,
      z = this.z;

  // Limit z to near and far plane.
  z = ( z < near ) ? near : ( ( z > far ) ? far : z );

  // Perspective divide.
  var d = 1 / ( m[ 3 ] * x + m[ 7 ] * y + m[ 11 ] * z + m[ 15 ] );

  this.x = ( m[ 0 ] * x + m[ 4 ] * y + m[  8 ] * z + m[ 12 ] ) * d;
  this.y = ( m[ 1 ] * x + m[ 5 ] * y + m[  9 ] * z + m[ 13 ] ) * d;
  this.z = ( m[ 2 ] * x + m[ 6 ] * y + m[ 10 ] * z + m[ 14 ] ) * d;

  return this;
};

Vector3.prototype.setFromMatrixPosition = function( m ) {
  this.x = m[ 12 ];
  this.y = m[ 13 ];
  this.z = m[ 14 ];
  return this;
};

Vector3.X = new Vector3( 1, 0, 0 );
Vector3.Y = new Vector3( 0, 1, 0 );
Vector3.Z = new Vector3( 0, 0, 1 );

module.exports = Vector3;

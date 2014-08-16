'use strict';

var Vector3 = require( '../math/vector3' );
var Face3 = require( './face3' );

// Temporary vector.
var temp = new Vector3();

function Quad( a, b, c, d ) {
  this.a = a;
  this.b = b;
  this.c = c;
  this.d = d;

  this.normal = new Vector3();
}

// WARNING: This assumes all four points are coplanar.
Quad.prototype.computeNormal = Face3.prototype.computeNormal;

Quad.prototype.draw = function( ctx, matrix, near, far ) {
  temp.copy( this.a ).applyProjection( matrix, near, far );

  var x = temp.x,
      y = temp.y;

  ctx.moveTo( x, y );

  temp.copy( this.b ).applyProjection( matrix, near, far );
  ctx.lineTo( temp.x, temp.y );

  temp.copy( this.c ).applyProjection( matrix, near, far );
  ctx.lineTo( temp.x, temp.y );

  temp.copy( this.d ).applyProjection( matrix, near, far );
  ctx.lineTo( temp.x, temp.y );

  // Close path.
  ctx.lineTo( x, y );
};

module.exports = Quad;

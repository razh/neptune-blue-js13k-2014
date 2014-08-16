'use strict';

var Vector3 = require( '../math/vector3' );

// Temporary vector.
var temp = new Vector3();

// Temporary vectors for face normal computation.
var cb = temp,
    ab = new Vector3();

function Face3( a, b, c ) {
  this.a = a;
  this.b = b;
  this.c = c;

  this.normal = new Vector3();
}

Face3.prototype.draw = function( ctx, matrix, near, far ) {
  temp.copy( this.a ).applyProjection( matrix, near, far );

  var x = temp.x,
      y = temp.y;

  ctx.moveTo( x, y );

  temp.copy( this.b ).applyProjection( matrix, near, far );
  ctx.lineTo( temp.x, temp.y );

  temp.copy( this.c ).applyProjection( matrix, near, far );
  ctx.lineTo( temp.x, temp.y );

  // Close path.
  ctx.lineTo( x, y );
};

Face3.prototype.computeNormal = function() {
  cb.subVectors( this.c, this.b );
  ab.subVectors( this.a, this.b );

  cb.cross( ab ).normalize();
  this.normal.copy( cb );

  return this;
};

module.exports = Face3;

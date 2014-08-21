'use strict';

var Object3D = require( './object3d' );
var Vector3 = require( './math/vector3' );
var Matrix4 = require( './math/matrix4' );

var DEG_TO_RAD = Math.PI / 180;

// Temp Matrix4.
var mt = new Matrix4();

function Camera( fov, aspect, near, far ) {
  Object3D.call( this );

  this.fov = fov || 60;
  this.aspect = aspect || 1;
  this.near = near || 0.1;
  this.far = far || 1000;

  this.matrixWorldInverse = new Matrix4();
  this.projectionMatrix = new Matrix4();

  this.updateProjectionMatrix();
}

Camera.prototype = Object.create( Object3D.prototype );
Camera.prototype.constructor = Camera;

Camera.prototype.lookAt = function( vector ) {
  mt.lookAt( this.position, vector, Vector3.Y );
  this.quaternion.setFromRotationMatrix( mt );
};

Camera.prototype.updateProjectionMatrix = function() {
  var near = this.near,
      far  = this.far;

  var top    = near * Math.tan( this.fov * 0.5 * DEG_TO_RAD ),
      bottom = -top,
      left   = bottom * this.aspect,
      right  = top * this.aspect;

  var x = 2 * near / ( right - left ),
      y = 2 * near / ( top - bottom );

  var a = ( right + left ) / ( right - left ),
      b = ( top + bottom ) / ( top - bottom ),
      c = -( far + near ) / ( far - near ),
      d = -2 * far * near / ( far - near );

  var m = this.projectionMatrix.elements;

  m[  0 ] = x;
  m[  1 ] = 0;
  m[  2 ] = 0;
  m[  3 ] = 0;
  m[  4 ] = 0;
  m[  5 ] = y;
  m[  6 ] = 0;
  m[  7 ] = 0;
  m[  8 ] = a;
  m[  9 ] = b;
  m[ 10 ] = c;
  m[ 11 ] = -1;
  m[ 12 ] = 0;
  m[ 13 ] = 0;
  m[ 14 ] = d;
  m[ 15 ] = 0;

  return this;
};

module.exports = Camera;

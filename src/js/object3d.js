'use strict';

var Vector3 = require( './math/vector3' );
var Matrix4 = require( './math/matrix4' );
var Quaternion = require( './math/quaternion' );

// Temp quaternion.
var qt = new Quaternion();

function Object3D() {
  this.position = new Vector3();
  this.quaternion = new Quaternion();
  this.visible = true;

  this.matrix = new Matrix4();
  this.matrixWorld = new Matrix4();
}

Object3D.prototype.updateMatrix = function() {
  this.matrix.makeRotationFromQuaternion( this.quaternion );
  this.matrix.setPosition( this.position );
  return this;
};

Object3D.prototype.rotateOnAxis = function ( axis, angle ) {
  // rotate object on axis in object space
  // axis is assumed to be normalized
  qt.setFromAxisAngle( axis, angle );
  this.quaternion.multiply( qt );
  return this;
};

Object3D.prototype.rotateX = function( angle ) {
  return this.rotateOnAxis( Vector3.X, angle );
};

Object3D.prototype.rotateY = function( angle ) {
  return this.rotateOnAxis( Vector3.Y, angle );
};

Object3D.prototype.rotateZ = function( angle ) {
  return this.rotateOnAxis( Vector3.Z, angle );
};

module.exports = Object3D;

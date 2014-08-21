'use strict';

var Vector3 = require( './math/vector3' );
var Matrix4 = require( './math/matrix4' );
var Quaternion = require( './math/quaternion' );

// Temp Quaternion.
var qt = new Quaternion();

// Temp Matrix4.
var mt = new Matrix4();

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
  this.matrixWorld.copy( this.matrix );
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

Object3D.prototype.lookAt = function( vector ) {
  mt.lookAt( vector, this.position, Vector3.Y );
  this.quaternion.setFromRotationMatrix( mt );
};

module.exports = Object3D;

'use strict';

var Vector3 = require( './math/vector3' );
var Matrix4 = require( './math/matrix4' );

function Object3D() {
  this.position = new Vector3();
  this.visible = true;

  this.matrix = new Matrix4();
  this.matrixWorld = new Matrix4();
}

Object3D.prototype.updateMatrix = function() {
  this.matrix.setPosition( this.position );
};

module.exports = Object3D;

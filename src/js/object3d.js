'use strict';

var Vector3 = require( './math/vector3' );

function Object3D() {
  this.position = new Vector3();
  this.visible = true;
}

module.exports = Object3D;

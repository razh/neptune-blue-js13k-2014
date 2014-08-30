'use strict';

var _ = require( '../utils' );
var Object3D = require( '../object3d' );

function Mesh( geometry, material ) {
  Object3D.call( this );

  this.geometry = geometry;
  this.material = material;
}

_.extends( Mesh, Object3D );

module.exports = Mesh;

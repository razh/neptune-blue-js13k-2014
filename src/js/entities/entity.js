'use strict';

var _ = require( '../utils' );
var Object3D = require( '../object3d' );

function Entity( geometry, material ) {
  Object3D.call( this );

  this.geometry = geometry;
  this.material = material;
}

_.extends( Entity, Object3D );

module.exports = Entity;

'use strict';

var Object3D = require( '../object3d' );

function Entity( geometry, material ) {
  Object3D.call( this );

  this.geometry = geometry;
  this.material = material;
}

Entity.prototype = Object.create( Object3D.prototype.constructor );
Entity.prototype.constructor = Entity;

module.exports = Entity;

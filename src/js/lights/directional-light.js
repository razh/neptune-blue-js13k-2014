'use strict';

var Vector3 = require( '../math/vector3' );
var Object3D = require( '../object3d' );

function DirectionalLight( color, intensity ) {
  Object3D.call( this );

  this.position.set( 0, 1, 0 );
  this.target = new Vector3();

  this.color = color;
  this.intensity = ( intensity !== undefined ) ? intensity : 1;
}

DirectionalLight.prototype = Object.create( Object3D.prototype );
DirectionalLight.prototype.constructor = DirectionalLight;

module.exports = DirectionalLight;

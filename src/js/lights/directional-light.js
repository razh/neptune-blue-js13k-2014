'use strict';

var Object3D = require( '../object3d' );
var Filter = require( '../math/filter' );

function DirectionalLight( color, intensity ) {
  Object3D.call( this );

  this.color = color;
  this.intensity = ( intensity !== undefined ) ? intensity : 1;

  this.filter = new Filter();
}

DirectionalLight.prototype = Object.create( Object3D.prototype );
DirectionalLight.prototype.constructor = DirectionalLight;

module.exports = DirectionalLight;

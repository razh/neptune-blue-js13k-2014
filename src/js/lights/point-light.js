'use strict';

var Object3D = require( '../object3d' );

function PointLight( color, intensity, distance ) {
  Object3D.call( this );
  this.color = color || 0;
  this.intensity = intensity || 0;
  this.distance = distance || 0;
}

PointLight.prototype = Object.create( Object3D.prototype );
PointLight.prototype.constructor = PointLight;

module.exports = PointLight;

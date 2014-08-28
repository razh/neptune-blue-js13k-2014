'use strict';

var DirectionalLight = require( './directional-light' );

function PointLight( color, intensity, distance ) {
  DirectionalLight.call( this, color, intensity );

  this.distance = distance || 0;
}

PointLight.prototype = Object.create( DirectionalLight.prototype );
PointLight.prototype.constructor = PointLight;

module.exports = PointLight;

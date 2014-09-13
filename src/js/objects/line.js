'use strict';

var _ = require( '../utils' );
var Mesh = require( './mesh' );

function Line( geometry, material ) {
  Mesh.call( this, geometry, material );
}

_.extends( Line, Mesh );

module.exports = Line;

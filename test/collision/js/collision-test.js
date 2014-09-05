'use strict';

var Game = require( '../../../src/js/game' );
var Color = require( '../../../src/js/math/color' );
var Geometry = require( '../../../src/js/geometry/geometry' );
var Material = require( '../../../src/js/materials/material' );
var LambertMaterial = require( '../../../src/js/materials/lambert-material' );
var LambertGlowMaterial = require( '../../../src/js/materials/lambert-glow-material' );
var Mesh = require( '../../../src/js/objects/mesh' );
var DirectionalLight = require( '../../../src/js/lights/directional-light' );

var Controls = require( '../../main/controls' );

window.CollisionTest = function() {
  var game = new Game( 568, 320 );
  document.body.appendChild( game.canvas );

  var scene = game.scene;
};

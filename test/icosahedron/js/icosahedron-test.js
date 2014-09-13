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

var createIcosahedronGeometry = require( '../../../src/js/geometry/icosahedron-geometry' );

window.IcosahedronTest = function() {
  var game = new Game( 568, 320 );
  document.body.appendChild( game.canvas );

  var scene = game.scene;

  var geometry = createIcosahedronGeometry( geometry );
  geometry.computeFaceNormals();

  var material = new LambertMaterial({
    color: new Color( 0.9, 0.7, 0.6 ),
    ambient: new Color( 0.3, 0.3, 0.3 ),
    diffuse: new Color( 1, 0.9, 0.8 ),
    overdraw: 0.5
  });

  var mesh = new Mesh( geometry, material );
  scene.add( mesh );

  var light = new DirectionalLight( new Color( 1, 1, 1 ) );
  light.position.set( -10, 0, -5 );
  scene.add( light );

  game.ambient.setRGB( 0.3, 0.3, 0.5 );

  game.camera.position.set( 0, 1, -4 );
  game.camera.lookAt( mesh.position );
  game.camera.updateProjectionMatrix();

  var controls = new Controls( game.camera );

  game.play();
};

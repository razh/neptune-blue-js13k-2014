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

function addIsland( geometry, sides, radius, height, spread ) {
  spread = spread || 0;

  var vertices = [
    0, 0, 0,
    0, -height, 0
  ];

  var faces = [];

  // Reverse order.
  var angle = -2 * Math.PI / sides;
  var offset = 2;

  var r;
  // Current and previous vertex indices.
  var curr, next;
  for ( var i = 0; i < sides; i++ ) {
    r = radius + Math.random() * spread;

    vertices.push( r * Math.sin( i * angle ) );
    vertices.push( 0 );
    vertices.push( r * Math.cos( i * angle ) );

    curr = offset + i;
    next = offset + ( ( i + 1 ) % sides );

    // Top.
    faces.push( [ 0, next, curr ] );
    // Bottom.
    faces.push( [ 1, curr, next ] );
  }

  return geometry.push( vertices, faces );
}

window.IslandTest = function() {
  var game = new Game( 568, 320 );
  document.body.appendChild( game.canvas );

  var scene = game.scene;

  var geometry = new Geometry();
  addIsland( geometry, 12, 1, 2, 1 );
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

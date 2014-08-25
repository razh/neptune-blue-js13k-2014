'use strict';

var Game = require( '../../../src/js/game' );
var Color = require( '../../../src/js/math/color' );
var Vector3 = require( '../../../src/js/math/vector3' );
var Face3 = require( '../../../src/js/geometry/face3');
var Quad = require( '../../../src/js/geometry/quad');
var Geometry = require( '../../../src/js/geometry/geometry' );
var Material = require( '../../../src/js/materials/material' );
var LambertMaterial = require( '../../../src/js/materials/lambert-material' );
var LambertGlowMaterial = require( '../../../src/js/materials/lambert-glow-material' );
var Entity = require( '../../../src/js/entities/entity' );
var DirectionalLight = require( '../../../src/js/lights/directional-light' );

var Controls = require( '../../main/controls' );

function createPlaneGeometry( width, height, widthSegments, heightSegments ) {
  var ix, iz;

  var widthHalf = width / 2;
  var heightHalf = height / 2;

  var gridX = widthSegments || 1;
  var gridZ = heightSegments || 1;

  var gridX1 = gridX + 1;
  var gridZ1 = gridZ + 1;

  var segmentWidth = width / gridX;
  var segmentHeight = height / gridZ;

  var geometry = new Geometry();
  var faces = geometry.faces;

  var x, z;
  for ( iz = 0; iz < gridZ1; iz++ ) {
    z = iz * segmentHeight - heightHalf;

    for ( ix = 0; ix < gridX1; ix++ ) {
      x = ix * segmentWidth - widthHalf;
      geometry.vertices.push( new Vector3( x, 2 * Math.random(), -z ) );
    }
  }

  var a, b, c, d;
  var face;
  for ( iz = 0; iz < gridZ; iz++ ) {
    for ( ix = 0; ix < gridX; ix++ ) {
      a = ix + gridX1 * iz;
      b = ix + gridX1 * ( iz + 1 );
      c = ( ix + 1 ) + gridX1 * ( iz + 1 );
      d = ( ix + 1 ) + gridX1 * iz;

      face = new Face3( a, d, b );
      faces.push( face );

      face = new Face3( b, d, c );
      faces.push( face );
    }
  }

  geometry.computeFaceNormals();

  return geometry;
}

window.WavesTest = function() {
  var game = new Game( 568, 320 );
  document.body.appendChild( game.canvas );

  var planeGeometry = createPlaneGeometry( 32, 16, 16, 8 );
  var material = new LambertMaterial({
    color: new Color( 0.8, 0.6, 0.6 ),
    strokeColor: new Color( 1, 0.9, 0.9 ),
    diffuse: new Color( 0.9, 0.9, 0.9 ),
    ambient: new Color( 0.3, 0.3, 0.3 ),
    wireframe: true,
    lineWidth: 2,
    shadowColor: new Color( 0.5, 0.5, 1 ),
    blur: 50,
    opacity: 0.8
  });

  var entity = new Entity( planeGeometry, material );
  game.entities.push( entity );

  game.ambient.setRGB( 0.5, 0.5, 0.5 );

  game.camera.position.set( 0, 3, -8 );
  game.camera.lookAt( 0, 0, 0 );
  game.camera.updateProjectionMatrix();
  var controls = new Controls( game.camera );

  var light = new DirectionalLight( new Color( 1, 0.5, 0.3 ) );
  light.intensity = 2;
  light.position.set( -4, 2, 0 );
  light.updateMatrix();
  game.lights.push( light );

  game.play();
};

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

window.BuildingTest = function() {
  var game = new Game( 568, 320 );
  document.body.appendChild( game.canvas );

  var entities = game.entities;

  // Generate building geometry.
  // Origin is at the center of the bottom face.
  function createBox( width, height, depth ) {
    var geometry = new Geometry();

    var halfWidth = width / 2,
        halfDepth = depth / 2;

    geometry.vertices = [
      // Counterclockwise from far left.
      // Top.
      new Vector3( -halfWidth, -height, -halfDepth ),
      new Vector3( -halfWidth, -height,  halfDepth ),
      new Vector3(  halfWidth, -height,  halfDepth ),
      new Vector3(  halfWidth, -height, -halfDepth ),
      // Bottom.
      new Vector3( -halfWidth, 0, -halfDepth ),
      new Vector3( -halfWidth, 0,  halfDepth ),
      new Vector3(  halfWidth, 0,  halfDepth ),
      new Vector3(  halfWidth, 0, -halfDepth )
    ];

    geometry.faces = [
      // Sides.
      new Quad( 0, 1, 5, 4 ),
      new Quad( 1, 2, 6, 5 ),
      new Quad( 2, 3, 7, 6 ),
      new Quad( 3, 0, 4, 7 ),

      // Top.
      new Quad( 0, 3, 2, 1 ),
    ];

    geometry.computeFaceNormals();

    return geometry;
  }

  var boxGeometry = createBox( 1, 2.5, 1 );

  var material = new LambertMaterial({
    color: new Color( 0.5, 0.5, 0.5 ),
    ambient: new Color( 0.5, 0.5, 0.5 ),
    diffuse: new Color( 0.5, 0.5, 0.5 )
  });

  var entity = new Entity( boxGeometry, material );
  entities.push( entity );

  var light = new DirectionalLight( new Color( 0.5, 0.5, 0.5 ) );
  light.position.set( -10, 0, 5 );
  light.updateMatrix();
  game.lights.push( light );

  var light2 = new DirectionalLight( new Color( 0.8, 0.8, 0.8 ) );
  light2.position.set( 0, -10, 0 );
  light2.updateMatrix();
  game.lights.push( light2 );

  game.ambient.setRGB( 0.2, 0.2, 0.2 );

  game.camera.position.set( 0, 0, -4 );
  game.camera.lookAt( entity.position );
  game.camera.updateProjectionMatrix();

  var controls = new Controls( game.camera );

  game.play();
};

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

  var scene = game.scene;

  // Generate building geometry.
  // Origin is at the center of the bottom face.
  function addBox( geometry, width, height, depth, dx, dy, dz ) {
    dx = dx || 0;
    dy = dy || 0;
    dz = dz || 0;

    var halfWidth = width / 2,
        halfDepth = depth / 2;

    var vertices = [
      // Counterclockwise from far left.
      // Bottom.
      -halfWidth, 0, -halfDepth,
      -halfWidth, 0,  halfDepth,
      halfWidth,  0,  halfDepth,
      halfWidth,  0, -halfDepth,
      // Top.
      -halfWidth, height, -halfDepth,
      -halfWidth, height,  halfDepth,
      halfWidth,  height,  halfDepth,
      halfWidth,  height, -halfDepth
    ];

    var offset = geometry.vertices.length;
    var i, il;
    for ( i = 0, il = vertices.length; i < il; i += 3 ) {
      geometry.vertices.push(
         new Vector3(
           vertices[ i     ] + dx,
           vertices[ i + 1 ] + dy,
           vertices[ i + 2 ] + dz
         )
      );
    }

    var indices = [
      // Sides.
      0, 1, 5, 4,
      1, 2, 6, 5,
      2, 3, 7, 6,
      3, 0, 4, 7,

      // Top.
      4, 5, 6, 7,
    ];

    for ( i = 0, il = indices.length; i < il; i += 4 ) {
      geometry.faces.push(
        new Quad(
          offset + indices[ i     ],
          offset + indices[ i + 1 ],
          offset + indices[ i + 2 ],
          offset + indices[ i + 3 ]
        )
      );
    }

    return geometry;
  }


  var boxGeometry = new Geometry();
  addBox( boxGeometry, 1, 2.5, 1 );
  addBox( boxGeometry, 1, 3, 1, 2, 0, 0 );
  addBox( boxGeometry, 1.5, 2, 1, -2, 0, 0 );
  addBox( boxGeometry, 4, 1.5, 1, 0, 0, 2 );
  boxGeometry.computeFaceNormals();

  var material = new LambertGlowMaterial({
    color: new Color( 0.9, 0.9, 0.9 ),
    ambient: new Color( 0.5, 0.5, 0.5 ),
    diffuse: new Color( 0.5, 0.5, 0.5 ),
    shadowColor: new Color( 1, 1, 1 ),
    blur: 16
  });

  var entity = new Entity( boxGeometry, material );
  scene.push( entity );

  var light = new DirectionalLight( new Color( 0.5, 0.5, 0.5 ) );
  light.position.set( -10, 0, 5 );
  light.filter.maskBits = 0;
  game.scene.push( light );

  var light2 = new DirectionalLight( new Color( 1, 1, 1 ) );
  light2.position.set( 0, 10, 0 );
  game.scene.push( light2 );

  game.ambient.setRGB( 0.2, 0.2, 0.2 );

  game.camera.position.set( -2, 5, -4 );
  game.camera.lookAt( entity.position );
  game.camera.updateProjectionMatrix();

  var controls = new Controls( game.camera );

  game.play();
};

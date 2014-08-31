'use strict';

var Game = require( '../../../src/js/game' );
var Color = require( '../../../src/js/math/color' );
var Vector3 = require( '../../../src/js/math/vector3' );
var Geometry = require( '../../../src/js/geometry/geometry' );
var Material = require( '../../../src/js/materials/material' );
var LambertMaterial = require( '../../../src/js/materials/lambert-material' );
var LambertGlowMaterial = require( '../../../src/js/materials/lambert-glow-material' );
var Mesh = require( '../../../src/js/objects/mesh' );
var DirectionalLight = require( '../../../src/js/lights/directional-light' );

var Controls = require( '../../main/controls' );

function createTrackGeometry( radius, length, spacing ) {
  var height = radius * Math.sin( Math.PI / 3 );

  var geometry = new Geometry().push(
    // Vertices.
    [
      // Left panel.
      radius / 2 + spacing, 0, 0,
      radius + spacing, height, 0,
      radius + spacing, height, -length,
      radius / 2 + spacing, 0, -length,

      // Center panel.
      -( radius / 2 ), 0, 0,
       ( radius / 2 ), 0, 0,
       ( radius / 2 ), 0, -length,
      -( radius / 2 ), 0, -length,

      // Right panel.
      -( radius + spacing ), height, 0,
      -( radius / 2 + spacing ), 0, 0,
      -( radius / 2 + spacing ), 0, -length,
      -( radius + spacing ), height, -length
    ],
    // Faces.
    [
      [ 0, 1, 2, 3 ],
      [ 4, 5, 6, 7 ],
      [ 8, 9, 10, 11 ]
    ]
  );

  geometry.computeFaceNormals();

  return geometry;
}

/*
  An exploded half-hexagonal prism.

  Cross-section.

            radius + spacing
              |---------|
    \                  /
     \                /
      \   ________   /


  Top-down view of a section.

    |----- length -----|

    +------------------+
    |                  |
    +------------------+  ---
                           | Spacing.
    +------------------+  ---
    |                  |
    |                  |  ---
    |                  |   |
    +------------------+   |
                           | Radius.
    +------------------+   |
    |                  |   |
    +------------------+  ---

 */
function createTrackMeshes( count, radius, length, spacing, meshSpacing ) {
  count = count || 0;
  radius = radius || 5;
  length = length || 3;
  spacing = spacing || 0.5;
  meshSpacing = meshSpacing || 0.5;

  var geometry = createTrackGeometry( radius, length, spacing );

  var material = new Material({
    color: new Color( 1, 0.8, 0.75 ),
    strokeColor: new Color( 1, 0.7, 0.3 ),
    wireframe: true,
    lineWidth: 2,
    shadowColor: new Color( 1, 0.7, 0.3 ),
    shadowBlur: 32
  });

  var meshes = [];

  var mesh;
  for ( var i = 0; i < count; i++ ) {
    mesh = new Mesh( geometry, material );
    mesh.position.z = i * ( length + meshSpacing );
    meshes.push( mesh );
  }

  return meshes;
}

window.TrackTest = function() {
  var game = new Game( 568, 320 );
  document.body.appendChild( game.canvas );

  var meshes = createTrackMeshes( 5 );
  for ( var i = 0, il = meshes.length; i < il; i++ ) {
    game.scene.add( meshes[i] );
  }

  game.camera.position.set( 0, 2, -4 );

  var lastMesh = meshes[ meshes.length - 1 ];
  var controls = new Controls( game.camera );
  var target = new Vector3().copy( lastMesh.position );
  target.y = 2;
  controls.target = target;
  game.camera.lookAt( target );
  game.camera.updateProjectionMatrix();

  game.play();
};

exports.createTrackGeometry = createTrackGeometry;
exports.createTrackMeshes = createTrackMeshes;

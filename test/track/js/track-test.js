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

function createTrackGeometry( radius, length, panelSpacing ) {
  var geometry = new Geometry();

  var height = radius * Math.sin( Math.PI / 3 );

  geometry.vertices = [
    // Left panel.
    new Vector3( radius + panelSpacing, -height, -length ),
    new Vector3( radius + panelSpacing, -height, 0 ),
    new Vector3( radius / 2 + panelSpacing, 0, 0 ),
    new Vector3( radius / 2 + panelSpacing, 0, -length ),

    // Center panel.
    new Vector3(  ( radius / 2 ), 0, -length ),
    new Vector3(  ( radius / 2 ), 0, 0 ),
    new Vector3( -( radius / 2 ), 0, 0 ),
    new Vector3( -( radius / 2 ), 0, -length ),

    // Right panel.
    new Vector3( -( radius + panelSpacing ), -height, 0 ),
    new Vector3( -( radius + panelSpacing ), -height, -length ),
    new Vector3( -( radius / 2 + panelSpacing ), 0, -length ),
    new Vector3( -( radius / 2 + panelSpacing ), 0, 0 )
  ];

  geometry.faces = [
    new Quad( 0, 1, 2, 3 ),
    new Quad( 4, 5, 6, 7 ),
    new Quad( 8, 9, 10, 11 )
  ];

  geometry.computeFaceNormals();

  return geometry;
}

/*
  An exploded half-hexagonal prism.

  Cross-section.

            radius + panelSpacing
              |---------|
    \                  /
     \                /
      \   ________   /


  Top-down view of a section.

    |----- length -----|

    +------------------+
    |                  |
    +------------------+  ---
                           | Panel spacing.
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
function createTrackEntities( options ) {
  options = options || {};

  var count = options.count || 0;
  var radius = options.radius || 5;
  var length = options.length || 3;
  var sectionSpacing = options.sectionSpacing || 0.5;
  var panelSpacing = options.panelSpacing || 0.5;

  var geometry = createTrackGeometry( radius, length, panelSpacing );

  var material = new Material({
    color: new Color( 1, 0.8, 0.75 ),
    strokeColor: new Color( 1, 0.7, 0.3 ),
    wireframe: true,
    lineWidth: 2,
    shadowColor: new Color( 1, 0.7, 0.3 ),
    shadowBlur: 32
  });

  var entities = [];

  var entity;
  for ( var i = 0; i < count; i++ ) {
    entity = new Entity( geometry, material );
    entity.position.z = i * ( length + sectionSpacing );
    entities.push( entity );
  }

  return entities;
}

window.TrackTest = function() {
  var game = new Game( 568, 320 );
  document.body.appendChild( game.canvas );

  game.entities = game.entities.concat(createTrackEntities({
    count: 5
  }));

  game.camera.position.set( 0, 0, -4 );
  game.camera.lookAt( game.entities[0].position );
  game.camera.updateProjectionMatrix();

  var controls = new Controls( game.camera );

  game.play();
};

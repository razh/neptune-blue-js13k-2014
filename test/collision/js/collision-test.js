'use strict';

var Game = require( '../../../src/js/game' );
var Color = require( '../../../src/js/math/color' );
var Box3 = require( '../../../src/js/math/box3' );
var Geometry = require( '../../../src/js/geometry/geometry' );
var Material = require( '../../../src/js/materials/material' );
var LambertMaterial = require( '../../../src/js/materials/lambert-material' );
var LambertGlowMaterial = require( '../../../src/js/materials/lambert-glow-material' );
var Mesh = require( '../../../src/js/objects/mesh' );
var DirectionalLight = require( '../../../src/js/lights/directional-light' );

var Controls = require( '../../main/controls' );

var _ = require( '../../../src/js/utils' );

function createBoxGeometry( width, height, depth ) {
  var geometry = new Geometry();

  var halfWidth = width / 2,
      halfHeight = height / 2,
      halfDepth = depth / 2;

  var vertices = [
    // Counterclockwise from far left.
    // Bottom.
    -halfWidth, -halfHeight, -halfDepth,
    -halfWidth, -halfHeight,  halfDepth,
    halfWidth,  -halfHeight,  halfDepth,
    halfWidth,  -halfHeight, -halfDepth,
    // Top.
    -halfWidth, halfHeight, -halfDepth,
    -halfWidth, halfHeight,  halfDepth,
    halfWidth,  halfHeight,  halfDepth,
    halfWidth,  halfHeight, -halfDepth
  ];


  var faces = [
    // Sides.
    [ 0, 1, 5, 4 ],
    [ 1, 2, 6, 5 ],
    [ 2, 3, 7, 6 ],
    [ 3, 0, 4, 7 ],

    // Bottom.
    [ 0, 3, 2, 1 ],
    // Top.
    [ 4, 5, 6, 7 ]
  ];

  return geometry.push( vertices, faces );
}

window.CollisionTest = function() {
  var game = new Game( 568, 320 );
  document.body.appendChild( game.canvas );

  var scene = game.scene;

  var sceneWidth = 20,
      sceneDepth = 60;

  var halfSceneWidth = sceneWidth / 2,
      halfSceneDepth = sceneDepth / 2;

  var boxGeometry = createBoxGeometry( 2, 2, 2 );

  function createMaterial() {
    return new Material({
      color: new Color( 1, 1, 1 ),
      fillVisible: false,
      wireframe: true
    });
  }

  var mesh = new Mesh( boxGeometry, createMaterial() );
  scene.add( mesh );

  var boxMeshes = [];
  var boxMesh;
  var i, il;
  for ( i = 0; i < 16; i++ ) {
    boxMesh = new Mesh( boxGeometry, createMaterial() );
    boxMesh.position.x = _.randFloatSpread( sceneWidth );
    boxMesh.position.z = _.randFloatSpread( sceneDepth );
    boxMeshes.push( boxMesh );
    scene.add( boxMesh );
  }

  scene.fogDensity = 0.05;

  game.camera.position.set( 0, 5, -4 );
  game.camera.lookAt( mesh.position );
  game.camera.updateProjectionMatrix();

  var controls = new Controls( game.camera );

  var boundingBox = new Box3();
  var bt = new Box3();

  var keys = [];

  document.addEventListener( 'keydown', function( event ) {
    keys[ event.keyCode ] = true;
  });

  document.addEventListener( 'keyup', function( event ) {
    keys[ event.keyCode ] = false;
  });

  mesh.update = function( dt ) {
    var position = mesh.position;

    // Right arrow. D.
    if ( keys[ 39 ] || keys[ 68 ] ) {
      if ( position.x > -halfSceneWidth ) {
        position.x -= 1.2 * sceneWidth * dt;
      }
    }

    // Left arrow. A.
    if ( keys[ 37 ] || keys[ 68 ] ) {
      if ( position.x < halfSceneWidth ) {
        position.x += 1.2 * sceneWidth * dt;
      }
    }

    // Matrix ends up calculated twice per frame.
    mesh.updateMatrix();
    boundingBox.setFromObject( mesh );

    var boxMesh;
    for ( i = 0, il = boxMeshes.length; i < il; i++ ) {
      boxMesh = boxMeshes[i];

      position = boxMesh.position;
      position.z -= 0.5 * sceneDepth * dt;
      if ( position.z < -0.5 * halfSceneDepth ) {
        position.z = 1.5 * halfSceneDepth;
        position.x = _.randFloatSpread( sceneWidth );
      }

      boxMesh.updateMatrix();
      bt.setFromObject( boxMesh );
      if ( boundingBox.isIntersectionBox( bt ) ) {
        boxMesh.material.color.setRGB( 1, 0, 0 );
        boxMesh.material.fillVisible = true;
        boxMesh.material.opacity = 0.5;
      } else {
        boxMesh.material.color.setRGB( 0, 1, 0 );
        boxMesh.material.fillVisible = false;
        boxMesh.material.opacity = 1;
      }
    }
  };

  game.play();
};

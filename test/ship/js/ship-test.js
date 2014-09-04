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

var DEG_TO_RAD = Math.PI / 180;
var HALF_PI = Math.PI / 2;

function addFuselageGeometry( geometry, forward, aft, width, height ) {
  forward = forward || 3;
  aft = aft || 1;
  width = width || 1;
  height = height || 0.5;

  var halfWidth = width / 2,
      halfHeight = height / 2;

  return geometry.push(
    // Vertices.
    [
      // Left vertex. :: 0
      halfWidth, 0, 0,
      // Right vertex. :: 1
      -halfWidth, 0, 0,

      // Top. :: 2
      0, halfHeight, 0,
      // Bottom. :: 3
      0, -halfHeight, 0,

      // Front. :: 4
      0, 0, forward,
      // Back. :: 5
      0, 0, -aft
    ],
    // Faces.
    [
      // Left faces.
      // Left top front.
      [ 0, 2, 4 ],
      // Left top back.
      [ 0, 5, 2 ],
      // Left bottom front.
      [ 0, 4, 3 ],
      // Left bottom back.
      [ 0, 3, 5 ],

      // Right faces.
      // Right top front.
      [ 1, 4, 2 ],
      // Right top back.
      [ 1, 2, 5 ],
      // Right bottom front.
      [ 1, 3, 4 ],
      // Right bottom back.
      [ 1, 5, 3 ]
    ]
  );
}

function addWingGeometry( geometry, offsetX, width, height, length, shear, forwardOffsetX, scaleX ) {
  var halfHeight = height / 2;

  var vertices = [
    // Wing tip. :: 0
    width, 0, -Math.tan( shear ) * width,

    // Fuselage connection top. :: 1
    0, halfHeight, 0,
    // Fuselage connection bottom. :: 2
    0, -halfHeight, 0,

    // Forward vertex. :: 3
    forwardOffsetX, 0, length
  ];

  var indices = [
    // Top.
    [ 0, 1, 3 ],
    // Bottom.
    [ 0, 3, 2 ],
    // Connection.
    [ 1, 2, 3 ],
    // Back.
    [ 1, 0, 2 ]
  ];

  for ( var i = 0, il = vertices.length; i < il; i += 3 ) {
    vertices[ i ] = scaleX * ( vertices[ i ] + offsetX );
    vertices[ i + 1 ] *= scaleX;
  }

  return geometry.push( vertices, indices );
}

function createShipGeometry() {
  var geometry = new Geometry();

  var fuselageForward = 3;
  var fuselageAft = 0.8;
  var fuselageWidth = 0.8;
  var fuselageHeight = 0.6;

  // Body.
  addFuselageGeometry(
    geometry,
    fuselageForward, fuselageAft,
    fuselageWidth, fuselageHeight
  );

  var wingOffsetX = 0.8;
  var wingWidth = 0.8;
  var wingHeight = 0.2;
  var wingLength = 1.2;
  var wingShear = Math.PI / 4;
  var wingForwardOffsetX = -0.2;

  // Wing.
  addWingGeometry(
    geometry,
    wingOffsetX,
    wingWidth,
    wingHeight,
    wingLength,
    wingShear,
    wingForwardOffsetX,
    1
  );

  addWingGeometry(
    geometry,
    wingOffsetX,
    wingWidth,
    wingHeight,
    wingLength,
    wingShear,
    wingForwardOffsetX,
    -1
  );

  geometry.computeFaceNormals();
  return geometry;
}

var keys = [];
document.addEventListener( 'keydown', function( event ) {
  keys[ event.which ] = true;
});

document.addEventListener( 'keyup', function( event ) {
  keys[ event.which ] = false;
});

document.addEventListener( 'touchstart', function() { keys[ 32 ] = true;  });
document.addEventListener( 'touchend',   function() { keys[ 32 ] = false; });

window.ShipTest = function() {
  var game = new Game( 568, 320 );
  var scene = game.scene;
  document.body.appendChild( game.canvas );

  var shipGeometry = createShipGeometry();
  var material = new LambertMaterial({
    color: new Color( 0.6, 0.6, 0.65 ),
    strokeColor: new Color( 0.3, 0.3, 0.3 ),
    diffuse: new Color( 1, 1, 1 ),
    ambient: new Color( 0.3, 0.3, 0.3 ),
    wireframe: true,
    lineWidth: 1
  });

  var mesh = new Mesh( shipGeometry, material );
  scene.add( mesh );

  game.ambient.setRGB( 0.4, 0.4, 0.4 );

  game.camera.position.set( 0, 4, -6 );
  var controls = new Controls( game.camera );
  controls.target.set( 0, 3, 8 );
  controls.update();

  var light = new DirectionalLight( new Color( 1, 1, 1 ) );
  light.position.set( -5, 10, 0 );
  scene.add( light );

  var speed = 24;
  var limit = 6;
  var turnRate = 180 * DEG_TO_RAD;

  var time = 0;
  var prev = 0;
  var rotateZ = 0;
  mesh.update = function( dt ) {
    // Space.
    if ( keys[ 32 ] ) {
      // Undo previous rotation.
      mesh.rotateZ( -prev );

      time += dt;
      rotateZ = Math.sin( time );
      mesh.rotateZ( rotateZ );
      prev = rotateZ;

      mesh.position.x = 4 * Math.sin( time );
      return;
    }

    var position = mesh.position;
    var rotation = mesh.rotation;
    // Right arrow. D.
    if ( keys[ 39 ] || keys[ 68 ] ) {
      if ( position.x > -limit ) {
        position.x -= speed * dt;
        rotation.z = Math.max( rotation.z - turnRate * dt, -HALF_PI );
      }
    }

    // Left arrow. A.
    if ( keys[ 37 ] || keys[ 65 ] ) {
      if ( position.x < limit ) {
        position.x += speed * dt;
        rotation.z = Math.min( rotation.z + turnRate * dt, HALF_PI );
      }
    }

    rotation.z -= 4 * rotation.z * dt;

    if ( Math.abs( rotation.z ) < 1e-2 ) {
      rotation.z = 0;
    }

    mesh.updateQuaternion();
  };

  game.play();
};

exports.addFuselageGeometry = addFuselageGeometry;
exports.addWingGeometry = addWingGeometry;
exports.createShipGeometry = createShipGeometry;

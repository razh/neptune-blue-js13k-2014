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

function addFuselageGeometry( geometry, forward, aft, width, height ) {
  forward = forward || 3;
  aft = aft || 1;
  width = width || 1;
  height = height || 0.5;

  var halfWidth = width / 2,
      halfHeight = height / 2;

  var vertices = [
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
  ];

  var offset = geometry.vertices.length;
  var i, il;
  for ( i = 0, il = vertices.length; i < il; i += 3 ) {
    geometry.vertices.push(
      new Vector3(
        vertices[ i     ],
        vertices[ i + 1 ],
        vertices[ i + 2 ]
      )
    );
  }

  var indices = [
    // Left faces.
    // Left top front.
    0, 2, 4,
    // Left top back.
    0, 5, 2,
    // Left bottom front.
    0, 4, 3,
    // Left bottom back.
    0, 3, 5,

    // Right faces.
    // Right top front.
    1, 4, 2,
    // Right top back.
    1, 2, 5,
    // Right bottom front.
    1, 3, 4,
    // Right bottom back.
    1, 5, 3
  ];

  for ( i = 0, il = indices.length; i < il; i += 3 ) {
    geometry.faces.push(
      new Face3(
        offset + indices[ i     ],
        offset + indices[ i + 1 ],
        offset + indices[ i + 2 ]
      )
    );
  }

  return geometry;
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
    0, 1, 3,
    // Bottom.
    0, 3, 2,
    // Connection.
    1, 2, 3,
    // Back.
    1, 0, 2
  ];

  var offset = geometry.vertices.length;
  var i, il;
  for ( i = 0, il = vertices.length; i < il; i += 3 ) {
    geometry.vertices.push(
      new Vector3(
        scaleX * ( vertices[ i ] + offsetX ),
        scaleX * vertices[ i + 1 ],
        vertices[ i + 2 ]
      )
    );
  }

  for ( i = 0, il = indices.length; i < il; i += 3 ) {
    geometry.faces.push(
      new Face3(
        offset + indices[ i     ],
        offset + indices[ i + 1 ],
        offset + indices[ i + 2 ]
      )
    );
  }
}

function createShipGeometry() {
  var geometry = new Geometry();

  var fuselageForward = 4;
  var fuselageAft = 1;
  var fuselageWidth = 0.8;
  var fuselageHeight = 0.8;

  // Body.
  addFuselageGeometry(
    geometry,
    fuselageForward, fuselageAft,
    fuselageWidth, fuselageHeight
  );

  var wingOffsetX = 0.7;
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

var movement = false;
document.addEventListener( 'keydown', function( event ) {
  if ( event.which === 32 ) {
    movement = true;
  }
});

document.addEventListener( 'keyup', function( event ) {
  if ( event.which === 32 ) {
    movement = false;
  }
});

document.addEventListener( 'touchstart', function() { movement = true;  });
document.addEventListener( 'touchend',   function() { movement = false; });

window.ShipTest = function() {
  var game = new Game( 568, 320 );
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

  var entity = new Entity( shipGeometry, material );
  game.entities.push( entity );

  game.ambient.setRGB( 0.4, 0.4, 0.4 );

  game.camera.position.set( 0, 1.8, -5 );
  game.camera.lookAt( 0, 0, 0 );
  game.camera.fov = 60;
  game.camera.updateProjectionMatrix();
  var controls = new Controls( game.camera );

  var light = new DirectionalLight( new Color( 1, 1, 1 ) );
  light.position.set( -5, 10, 0 );
  light.updateMatrix();
  game.lights.push( light );

  var time = 0;
  var prev = 0;
  var rotateZ = 0;
  entity.update = function( dt ) {
    if ( !movement ) {
      return;
    }

    time += dt;
    entity.rotateZ( -prev );
    rotateZ = Math.sin( time );
    entity.rotateZ( rotateZ );
    prev = rotateZ;
    entity.position.x = 3 * Math.sin( time );
  };

  game.play();
};

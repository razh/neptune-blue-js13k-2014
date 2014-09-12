/*jshint bitwise:false*/
'use strict';

var Game = require( './game' );
var Object3D = require( './object3d' );
var Color = require( './math/color' );
var Vector3 = require( './math/vector3' );
var Box3 = require( './math/box3' );
var Face3 = require( './geometry/face3' );
var Geometry = require( './geometry/geometry' );
var Material = require( './materials/material' );
var LambertMaterial = require( './materials/lambert-material' );
var LambertGlowMaterial = require( './materials/lambert-glow-material' );
var Mesh = require( './objects/mesh' );
var DirectionalLight = require( './lights/directional-light' );

var _ = require( './utils' );

var DEG_TO_RAD = Math.PI / 180;
var HALF_PI = Math.PI / 2;

var $ = document.querySelector.bind( document );

function on( el, type, listener ) {
  el.addEventListener( type, listener );
}

function off( el, type, listener ) {
  el.removeEventListener( type, listener );
}

function create( type ) {
  return document.createElement( type || 'div' );
}

function append( parent, el ) {
  parent.appendChild( el );
}

function prepend( parent, el ) {
  parent.insertBefore( el, parent.firstChild );
}

function remove( el ) {
  if ( el.parentNode ) {
    el.parentNode.removeChild( el );
  }
}

function textContent( el, text ) {
  el.textContent = text;
}

function addClass( el, className ) {
  el.classList.add( className );
}

function removeClass( el, className ) {
  el.classList.remove( className );
}


var game = new Game(
  Math.min( window.innerWidth, 852 ),
  Math.min( window.innerHeight, 480 )
);

var _vector3 = new Vector3();

var container = $( '#g' );
container.appendChild( game.canvas );

var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext = new AudioContext();
var sampleRate = audioContext.sampleRate;

function toFreq( note ) {
  // A4 is 69.
  return Math.pow( 2, ( note - 69 ) / 12 ) * 440;
}

// Notes.
var E1 = toFreq( 28 );
var E3 = toFreq( 52 );
var CS3 = toFreq( 49 );
var DS3 = toFreq( 51 );
var GS3 = toFreq( 56 );
var FS3 = toFreq( 54 );

// Delay is in seconds.
function playSound( sound, delay ) {
  var source = audioContext.createBufferSource();
  source.buffer = sound;
  source.connect( audioContext.destination );
  source.start( delay ? audioContext.currentTime + delay : 0 );
}

function generateAudioBuffer( freq, fn, duration, volume ) {
  // duration is in seconds.
  var length = duration * sampleRate;

  var buffer = audioContext.createBuffer( 1, length, sampleRate );
  var channel = buffer.getChannelData(0);
  for ( var i = 0; i < length; i++ ) {
    channel[i] = fn( freq * i / sampleRate, i / length ) * volume;
  }

  return buffer;
}

function sine( sample ) {
  return Math.sin( sample * 2 * Math.PI );
}

function waveformFn( noise, decay ) {
  return function waveform( sample, time ) {
    var wave = _.clamp( sine( sample ) + _.randFloatSpread( noise ), -1, 1 );
    var env = Math.exp( -time * decay );
    return wave * env;
  };
}

// Waveforms.
var kick = waveformFn( 0.05, 24 );
var snare = waveformFn( 0.8, 16 );

function bass( sample, time ) {
  var wave = 0.5 * ( sine( sample ) + sine( 0.5 * sample ) );
  var env = Math.exp( -time * 4 );
  return wave * env;
}

var BPM = 140;
var NOTE = 2 * 60 / BPM * 1000;

// Note duration values (s).
var _n2 = 1e-3 * NOTE / 2;
var _n4 = _n2 / 2;
var _n8 = _n4 / 2;

// Sounds.
var snarenote = generateAudioBuffer( E3, snare, _n4, 0.2 );
var snarenote2 = generateAudioBuffer( E3, snare, _n4, 0.1 );
var snarenote3 = generateAudioBuffer( E3, snare, _n4 + _n8, 0.3 );

var kicknote = generateAudioBuffer( E1, kick, _n2 + _n8, 1 );
var kicknote2 = generateAudioBuffer( E1, kick, _n2 + _n8, 0.6 );

var gs3bass = generateAudioBuffer( GS3, bass, _n2, 0.2 );
var gs3bass2 = generateAudioBuffer( GS3, bass, _n2, 0.1 );
var gs3bass3 = generateAudioBuffer( GS3, bass, _n2 + _n8, 0.1 );

var fs3bass = generateAudioBuffer( FS3, bass, _n2, 0.2 );
var fs3bass2 = generateAudioBuffer( FS3, bass, _n2, 0.1 );
var fs3bass3 = generateAudioBuffer( FS3, bass, _n2 + _n8, 0.1 );

var e3bass = generateAudioBuffer( E3, bass, _n2, 0.2 );
var e3bass2 = generateAudioBuffer( E3, bass, _n2, 0.1 );
var e3bass3 = generateAudioBuffer( E3, bass, _n2 + _n8, 0.1 );

var ds3bass = generateAudioBuffer( DS3, bass, _n2, 0.2 );
var ds3bass2 = generateAudioBuffer( DS3, bass, _n2, 0.1 );
var ds3bass3 = generateAudioBuffer( DS3, bass, _n2 + _n8, 0.1 );

var cs3bass = generateAudioBuffer( CS3, bass, _n2, 0.2 );
var cs3bass2 = generateAudioBuffer( CS3, bass, _n2, 0.1 );
var cs3bass3 = generateAudioBuffer( CS3, bass, _n2 + _n8, 0.1 );

var explosion = generateAudioBuffer( E1, waveformFn( 0.2, 16 ), 6 * _n2, 1 );

function bassline( b0, b1, b2 ) {
  playSound( b0 );
  playSound( b1, _n4 );
  playSound( b2, _n2 );
}

var audioBar;

function playAll() {
  if ( audioBar % 2 < 1 ) {
    playSound( kicknote );
    if ( audioBar % 16 >= 12 ) {
      playSound( kicknote2, _n4 + _n8 );
    }

    playSound( snarenote, _n2 );
    playSound( kicknote2, _n2 + _n4 + _n8 );

  } else if ( audioBar % 4 < 2 ) {
    playSound( kicknote, _n4 );
    playSound( snarenote, _n2 );
    playSound( kicknote2, _n2 + _n4 + _n8 );

  } else if ( audioBar % 8 < 4 ){
    playSound( kicknote, _n4 );
    playSound( snarenote, _n2 );
    playSound( kicknote2, _n2 + _n4 );

  } else if ( audioBar % 16 < 8 ) {
    playSound( kicknote, _n4 );
    playSound( snarenote, _n2 );
    playSound( kicknote2, _n2 + _n4 );
    playSound( kicknote2, _n2 + _n4 + _n8 );

  } else {
    playSound( kicknote, _n4 );
    playSound( snarenote, _n2 );
    playSound( kicknote2, _n2 + _n8 );
    playSound( snarenote2, _n2 + _n4 );
    playSound( snarenote3, _n2 + _n4 + _n8 );

  }

  var bassIndex = audioBar % 32;

  if ( bassIndex < 4 ) {
    bassline( gs3bass, gs3bass2, gs3bass3 );
  } else if ( bassIndex < 8 ) {
    bassline( fs3bass, fs3bass2, fs3bass3 );
  } else if ( bassIndex < 12 ) {
    bassline( e3bass, e3bass2, e3bass3 );
  } else if ( bassIndex < 16 ) {
    bassline( ds3bass, ds3bass2, ds3bass3 );
  } else if ( bassIndex < 20 ) {
    bassline( cs3bass, cs3bass2, cs3bass3 );
  } else if ( bassIndex < 24 ) {
    bassline( e3bass, e3bass2, e3bass3 );
  } else if ( bassIndex < 28 ) {
    bassline( fs3bass, fs3bass2, fs3bass3 );
  } else {
    bassline( gs3bass, gs3bass2, gs3bass3 );
  }

  audioBar++;
}

function playExplosion() {
  playSound( explosion );
  playSound( kicknote );
  playSound( explosion, 0.1 * Math.random() );
  playSound( kicknote, 0.2 * Math.random() );
  playSound( explosion, 0.4 * Math.random() );
}

/**
 * Scene geometry.
 */
var scene;

/**
 * Box geometry.
 */
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

function createBoxMaterial() {
  return new LambertMaterial({
    color: new Color( 1, 1, 1 ),
    diffuse: new Color( 0.5, 0.5, 0.5 ),
    ambient: new Color( 0.5, 0.5, 0.5 ),
    // Bump up opacity to better handle fog.
    opacity: 10
  });
}

var boxGeometry = createBoxGeometry( 2, 2, 2 );
boxGeometry.computeFaceNormals();

var boxMeshes;

function randomBoxPosition() {
  return _vector3.set(
    // x is from +/-[2, 18] to avoid camera intersections.
    ( Math.random() < 0.5 ? -1 : 1 ) * ( 2 + _.randFloat( 0, 16 ) ),
    _.randFloat( -1, 6 ),
    _.randFloat( 30, 60 )
  );
}

/**
 * Ship geometry.
 */
function addFuselageGeometry( geometry, forward, aft, width, height ) {
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
  var wingWidth = 1;
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

var shipGeometry = createShipGeometry();
var shipMaterial = new LambertGlowMaterial({
  color: new Color( 0.6, 0.6, 0.65 ),
  strokeColor: new Color( 1, 1, 1 ),
  diffuse: new Color( 1, 1, 1 ),
  ambient: new Color( 0.3, 0.3, 0.3 ),
  shadowColor: new Color( 1, 1, 1 ),
  shadowBlur: 8,
  wireframe: true,
  lineWidth: 0.5
});

var shipMesh;


/**
 * Plane geometry.
 */
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
  var vertices = geometry.vertices;
  var faces = geometry.faces;

  var x, z;
  for ( iz = 0; iz < gridZ1; iz++ ) {
    z = iz * segmentHeight - heightHalf;

    for ( ix = 0; ix < gridX1; ix++ ) {
      x = ix * segmentWidth - widthHalf;
      vertices.push( new Vector3( x, 0, -z ) );
    }
  }

  var a, b, c, d;
  for ( iz = 0; iz < gridZ; iz++ ) {
    for ( ix = 0; ix < gridX; ix++ ) {
      a = ix + gridX1 * iz;
      b = ix + gridX1 * ( iz + 1 );
      c = ( ix + 1 ) + gridX1 * ( iz + 1 );
      d = ( ix + 1 ) + gridX1 * iz;

      faces.push( new Face3( a, d, b ) );
      faces.push( new Face3( b, d, c ) );
    }
  }

  geometry.computeFaceNormals();

  return geometry;
}

var planeWidth = 56;
var planeHeight = 16;
var planeWidthSegments = 16;
var planeHeightSegments = 8;
var planeSegmentWidth = planeWidth / planeWidthSegments;

var planeGeometry = createPlaneGeometry(
  planeWidth, planeHeight,
  planeWidthSegments, planeHeightSegments
);

var planeMaterial = new LambertMaterial({
  color: new Color( 0.5, 0.5, 0.6 ),
  strokeColor: new Color( 0.9, 0.9, 1 ),
  diffuse: new Color( 0.6, 0.6, 1 ),
  ambient: new Color( 0.3, 0.3, 0.3 ),
  wireframe: true,
  lineWidth: 1,
  opacity: 0.3
});

var wavesMesh = new Mesh( planeGeometry, planeMaterial );
var wavesMesh2 = new Mesh( planeGeometry, planeMaterial );

game.ambient.setRGB( 0.3, 0.3, 0.3 );

/**
 * Lights, camera, action.
 */
var light = new DirectionalLight( new Color( 1, 1, 1 ) );
light.intensity = 2;

var camera = game.camera;
var cameraY = 3.5;
var cameraOffsetZ = -5;

var alive;
var vz = 24;
var vx = 30;
var limit = 6;
var turnRate = 240 * DEG_TO_RAD;

// State variables.
var time;
var audioTime;
var planeOffset;

var score;
var highScore = 0;

function reset() {
  alive = true;

  score = 0;
  time = 0;
  planeOffset = 0;
  // Start playing immediately.
  audioBar = 0;
  audioTime = NOTE;

  scene = game.scene = new Object3D();

  // Collision test meshes.
  boxMeshes = [];
  var boxMesh;
  for ( var i = 0; i < 12; i++ ) {
    boxMesh = new Mesh( boxGeometry, createBoxMaterial() );
    boxMesh.position.copy( randomBoxPosition() );
    boxMeshes.push( boxMesh );
    scene.add( boxMesh );
  }

  shipMesh = new Mesh( shipGeometry, shipMaterial );
  scene.add( shipMesh );

  // Waves meshes.
  wavesMesh.position.z = 0;
  wavesMesh.position.y = -2;
  scene.add( wavesMesh );

  wavesMesh2.position.x = -2 * planeSegmentWidth;
  wavesMesh2.position.y = wavesMesh.position.y;
  wavesMesh2.position.z = planeHeight;
  scene.add( wavesMesh2 );

  // Light.
  light.position.set( -4, 2, 0 );
  scene.add( light );

  scene.fogDensity = 0.08;

  camera.position.set( 0, cameraY, cameraOffsetZ );
  camera.lookAt( new Vector3( 0, 3, 0 ) );
  camera.updateProjectionMatrix();
}

function createButton( el, id, text, action ) {
  var button = create( 'button' );
  button.id = id;
  textContent( button, text );
  on( button, 'click', action );
  prepend( el, button );
  return button;
}

// Create menu.
var menu = create();
menu.id = 'm';
addClass( menu, 'c' );
append( container, menu );

// Score-tracking.
var scoreEl = create();
scoreEl.id = 's';
append( container, scoreEl );

var highScoreEl = create();
highScoreEl.id = 'hs';
append( container, highScoreEl );

function play() {
  game.play();
  addClass( menu, 'h' );
}

// Begin button.
var playButton = createButton( menu, 'p', 'PLAY', play );

function pause() {
  if ( game.running ) {
    game.pause();
    textContent( playButton, 'RESUME' );
    removeClass( menu, 'h' );
  }
}

on( window, 'blur', pause );

function end() {
  game.pause();
  reset();
  textContent( playButton, 'Again?' );
  removeClass( menu, 'h' );
}

// Key listeners.
var keys = {};

on( document, 'keydown', function( event ) {
  keys[ event.keyCode ] = true;
});

on( document, 'keyup', function( event ) {
  keys[ event.keyCode ] = false;

  // Space. Resume.
  if ( event.keyCode === 32 && !game.running ) {
    play();
  }
});

reset();

// Collision detection.
var boundingBox = new Box3();
var bt = new Box3();

// Global update function.
game.onUpdate = function( dt ) {
  // Update music.
  audioTime += dt * 1e3;
  if ( alive && audioTime > NOTE ) {
    playAll();
    audioTime = 0;
  }

  // Slow down time on collision.
  if ( !alive ) {
    dt *= 0.1;
    camera.position.x = _.randFloatSpread(1);
    camera.position.y = cameraY + _.randFloatSpread(1);
  }

  var position = shipMesh.position;
  var rotation = shipMesh.rotation;

  // Right arrow. D.
  if ( keys[ 39 ] || keys[ 68 ] ) {
    if ( position.x > -limit ) {
      position.x -= vx * dt;
      rotation.z = Math.max( rotation.z - turnRate * dt, -HALF_PI );
    }
  }

  // Left arrow. A.
  if ( keys[ 37 ] || keys[ 65 ] ) {
    if ( position.x < limit ) {
      position.x += vx * dt;
      rotation.z = Math.min( rotation.z + turnRate * dt, HALF_PI );
    }
  }

  rotation.z -= 4 * rotation.z * dt;

  if ( Math.abs( rotation.z ) < 1e-2 ) {
    rotation.z = 0;
  }

  position.z += vz * dt;
  camera.position.z = position.z + cameraOffsetZ;

  shipMesh.updateQuaternion();
  shipMesh.updateMatrix();
  boundingBox.setFromObject( shipMesh );

  var boxMesh;
  var boxPosition;
  var i, il;
  var scale = 1 + 0.3 * ( 1 + Math.cos( audioTime / NOTE * Math.PI * 4 ) );
  for ( i = 0, il = boxMeshes.length; i < il; i++ ) {
    boxMesh = boxMeshes[i];

    boxPosition = boxMesh.position;
    boxMesh.scale.set( scale, scale, scale );
    if ( boxPosition.z < position.z + cameraOffsetZ ) {
      boxPosition.copy( randomBoxPosition() );
      boxPosition.z += position.z;
    }

    if ( !alive ) {
      continue;
    }

    boxMesh.updateMatrix();
    bt.setFromObject( boxMesh );
    if ( boundingBox.isIntersectionBox( bt ) ) {
      boxMesh.material.color.setRGB( 1, 0, 0 );
      alive = false;
      playExplosion();
      setTimeout( end, 512 );
      break;
    } else {
      boxMesh.material.color.setRGB( 1, 1, 1 );
    }
  }


  // Update waves.
  time += dt;
  var vertices = planeGeometry.vertices;
  var x, z;
  for ( i = 0, il = vertices.length; i < il; i++ ) {
    x = i % il;
    z = Math.floor( i / il );
    vertices[i].y = 0.8 * Math.sin( 10 * time + ( x + z ) );
  }

  // Update wave tiling.
  // The two wave meshes alternate positions to avoid seams.
  function calculatePlaneOffsetX( offset ) {
    offset = offset % 3;

    var x = 2 * planeSegmentWidth;

    if ( offset === 1 ) {
      x = 0;
    } else if ( offset === 2 ) {
      x = -x;
    }

    return x;
  }

  if ( wavesMesh.position.z + 0.5 * planeHeight < position.z ) {
    wavesMesh.position.x = calculatePlaneOffsetX( planeOffset );
    wavesMesh.position.z += 2 * planeHeight;
    planeOffset++;
  }

  if ( wavesMesh2.position.z + 0.5 * planeHeight < position.z ) {
    wavesMesh2.position.x = calculatePlaneOffsetX( planeOffset );
    wavesMesh2.position.z += 2 * planeHeight;
    planeOffset++;
  }

  planeGeometry.computeFaceNormals();

  /**
   * TODO: Calculate collisions.
   */
  // Temporary end condition.
  if ( keys[ 81 ] ) {
    return end();
  }

  // Update score.
  score = 10 * position.z;
  if ( score > highScore ) {
    highScore = score;
  }

  textContent( highScoreEl, 'HIGH SCORE: ' + ( highScore | 0 ) );
  textContent( scoreEl, 'SCORE: ' + ( score | 0 ) );
};

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
var SpriteCanvasMaterial = require( './materials/sprite-canvas-material' );
var Mesh = require( './objects/mesh' );
var Sprite = require( './objects/sprite' );
var DirectionalLight = require( './lights/directional-light' );
var createIcosahedronGeometry = require( './geometry/icosahedron-geometry' );

var _ = require( './utils' );

var noop = function() {};

var DEG_TO_RAD = Math.PI / 180;
var HALF_PI = Math.PI / 2;

var $ = document.querySelector.bind( document );

var WIDTH = 852;
var HEIGHT = 480;

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

function numericSort( a, b ) {
  return a - b;
}

function removeIndices( array, indices ) {
  indices.sort( numericSort );
  var i = indices.length;
  while ( i-- ) {
    array.splice( indices[i], 1 );
  }
}

var animate = (function() {
  var animations = [];

  function update( dt ) {
    var removedIndices = [];

    /**
     * Animations are stored as a 4-element array:
     *
     *   [ fn, duration, time, done ]
     *
     * Where:
     *   fn - animation callback function. Receives time as a parameter.
     *   duration - animation duration.
     *   time - elapsed time.
     *   done - done callback.
     */
    var animation;
    var doneCallbacks = [];
    var fn, duration, time, done;
    var i, il;
    for ( i = 0, il = animations.length; i < il; i++ ) {
      animation = animations[i];

      fn = animation[0];
      duration = animation[1];
      time = animation[2] += dt;

      if ( time >= duration ) {
        removedIndices.push( i );

        done = animation[3];
        if ( done ) {
          doneCallbacks.push( done );
        }
      }

      animation[0]( _.clamp( time / duration, 0, 1 ) );
    }

    removeIndices( animations, removedIndices );
    for ( i = 0, il = doneCallbacks.length; i < il; i++ ) {
      doneCallbacks[i]();
    }
  }

  function animate( fn, duration, done ) {
    animations.push( [ fn, duration || 0, 0, done ] );
    return animate;
  }

  animate.update = update;

  return animate;
}) ();


var game = new Game(
  Math.min( window.innerWidth,  WIDTH  ),
  Math.min( window.innerHeight, HEIGHT )
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

function playExplosionSound() {
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
 * Enemy geometry.
 */
function createEnemyGeometry() {
  var geometry = createIcosahedronGeometry();
  var vertices = geometry.vertices;

  for ( var i = 0, il = vertices.length; i < il; i++ ) {
    vertices[i].multiplyScalar( _.randFloat( 1, 1.3 ) );
  }

  geometry.computeFaceNormals();
  return geometry;
}

var enemyColor = new Color( 0.6, 0.4, 0.4 );
var enemyHitColor = new Color().copy( enemyColor );
enemyHitColor.r += 0.3;
function createEnemyMaterial() {
  return new LambertMaterial({
    color: new Color().copy( enemyColor ),
    ambient: new Color( 0.5, 0.3, 0.8 ),
    diffuse: new Color( 0.3, 0.2, 0.1 ),
    // Bump up opacity to better handle fog.
    opacity: 10,
    overdraw: 0.5
  });
}

var enemyMeshes;

function randomEnemyPosition() {
  return _vector3.set(
    // x is from +/-[2, 18] to avoid camera intersections.
    _.randSign() * ( 2 + _.randFloat( 0, 16 ) ),
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

/**
 * Explosion sprites.
 */
var explosionGravity = new Vector3( 0, -500, 0 );

var explosionSprites = [];
var explosionVelocities = [];

function drawDiamond( ctx, radius ) {
  // Counter-clockwise from right.
  ctx.beginPath();
  ctx.moveTo( radius, 0 );
  ctx.lineTo( 0, radius );
  ctx.lineTo( -radius, 0 );
  ctx.lineTo( 0, -radius );
  ctx.closePath();
}

function explosionProgram( ctx ) {
  /*jshint validthis:true*/
  drawDiamond( ctx, 1 );
  ctx.fillStyle = 'rgba(240, 120, 80, 0.5)';
  ctx.fill();

  drawDiamond( ctx, 0.4 );
  ctx.fillStyle = this.color.toString();
  ctx.fill();
  /*jshint validthis:false*/
}

// Create explosion sprites.
var sprite, spriteMaterial;
for ( var i = 0; i < 24; i++ ) {
  spriteMaterial = new SpriteCanvasMaterial({
    color: new Color( 1, 1, 1 ),
    blending: 'lighter',
    opacity: 0.5
  });
  spriteMaterial.program = explosionProgram;

  sprite = new Sprite( spriteMaterial );
  explosionSprites.push( sprite );

  explosionVelocities.push( new Vector3() );
}

function resetExplosionSprites() {
  for ( var i = 0, il = explosionSprites.length; i < il; i++ ) {
    sprite = explosionSprites[i];
    sprite.visible = false;
    sprite.scale.set( 1, 1, 1 );

    explosionVelocities[i].set(
      _.randSign() * _.randFloatSpread( 48 ),
      24 + Math.random() * 24,
      Math.random() * -16
    );
  }
}

function addExplosion( v ) {
  for ( var i = 0, il = explosionSprites.length; i < il; i++ ) {
    sprite = explosionSprites[i];
    sprite.visible = true;
    sprite.position.set(
      _.randFloatSpread( 2 ),
      _.randFloatSpread( 2 ),
      _.randFloatSpread( 2 )
    ).add( v );
  }
}

/**
 * Star sprites.
 */
var starSprites = [];
var starOffsetZ = 50;
var starSpawnOffsetZ = 100;

function starProgram( ctx ) {
  drawDiamond( ctx, 0.5 );
  ctx.fillStyle = '#fff';
  ctx.fill();
}

// Create star sprites.
for ( i = 0; i < 48; i++) {
  spriteMaterial = new SpriteCanvasMaterial({
    blending: 'lighter'
  });

  spriteMaterial.program = starProgram;
  sprite = new Sprite( spriteMaterial );
  starSprites.push( sprite );
}

function randomStarPosition() {
  return _vector3.set(
    _.randSign() * _.randFloatSpread( 400 ),
    _.randFloat( 60, 120 ),
    _.randFloat( 100, 100 + starSpawnOffsetZ )
  );
}

/**
 * Life sprite.
 */
function randomLifePosition() {

}

/**
 * Lights, camera, action.
 */
game.ambient.setRGB( 0.3, 0.3, 0.5 );

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

var lives;
var isHit;

function resetHit() {
  isHit = false;
}

function reset() {
  alive = true;
  lives = 3;
  isHit = false;

  score = 0;
  time = 0;
  planeOffset = 0;
  // Start playing immediately.
  audioBar = 0;
  audioTime = NOTE;

  scene = game.scene = new Object3D();

  // Collision test meshes.
  enemyMeshes = [];
  var enemyMesh;
  var enemyGeometry;
  var i, il;
  for ( i = 0; i < 12; i++ ) {
    enemyGeometry = createEnemyGeometry();
    enemyMesh = new Mesh( enemyGeometry, createEnemyMaterial() );
    enemyMesh.position.copy( randomEnemyPosition() );
    enemyMeshes.push( enemyMesh );
    scene.add( enemyMesh );
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

  // Explosion sprites.
  resetExplosionSprites();
  for ( i = 0, il = explosionSprites.length; i < il; i++ ) {
    scene.add( explosionSprites[i] );
  }

  // Star sprites.
  for ( i = 0, il = starSprites.length; i < il; i++ ) {
    sprite = starSprites[i];
    sprite.position.copy( randomStarPosition() );
    scene.add( sprite );
  }

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

var livesEl = create();
livesEl.id = 'l';
append( container, livesEl );

// Resize handling.
var expanded = false;

function onResize() {
  game.setSize(
    Math.min( window.innerWidth,  expanded ? Infinity : WIDTH  ),
    Math.min( window.innerHeight, expanded ? Infinity : HEIGHT )
  );
}

// Left-right arrow.
var expandButton = createButton( container, 'fs', '[ \u2194 ]', function() {
  expanded = !expanded;
  textContent( expandButton, expanded ? '\xD7' : '[ \u2194 ]' );
  onResize();
});

on( window, 'resize', onResize );

// Game state controls.
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
  textContent( playButton, 'RETRY' );
  removeClass( menu, 'h' );
}

// Key listeners.
var keys = {};

on( document, 'keydown', function( event ) {
  keys[ event.keyCode ] = true;

  // Space. Prevent button clicks.
  if ( event.keyCode === 32 ) {
    event.preventDefault();
  }
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
  }

  animate.update( dt );

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

  position.z += vz * dt;
  rotation.z -= 4 * rotation.z * dt;

  if ( Math.abs( rotation.z ) < 1e-2 ) {
    rotation.z = 0;
  }

  var cameraX = 0.1 * position.x;
  camera.position.x = cameraX;
  camera.position.z = position.z + cameraOffsetZ;
  camera.lookAt( new Vector3( cameraX, 3, position.z ) );
  camera.rotateZ( 0.1 * cameraX );

  // Camera shake.
  if ( isHit || !alive ) {
    camera.position.x = cameraX + _.randFloatSpread(0.5);
    camera.position.y = cameraY + _.randFloatSpread(0.5);
  }

  shipMesh.updateQuaternion();
  shipMesh.updateMatrix();
  boundingBox.setFromObject( shipMesh ).expandByScalar( -0.2 );

  var enemyMesh;
  var enemyPosition;
  var i, il;
  var scale = 0.7 + 0.2 * ( 1 + Math.cos( audioTime / NOTE * Math.PI * 4 ) );
  for ( i = 0, il = enemyMeshes.length; i < il; i++ ) {
    enemyMesh = enemyMeshes[i];

    enemyPosition = enemyMesh.position;
    if ( enemyPosition.z < position.z + cameraOffsetZ ) {
      enemyPosition.copy( randomEnemyPosition() );
      enemyPosition.z += position.z;
    }

    if ( !alive ) {
      continue;
    }

    enemyMesh.scale.set( scale, scale, scale );
    enemyMesh.updateMatrix();
    bt.setFromObject( enemyMesh ).expandByScalar( -0.1 );
    // Hacky attempt to rotate on a random axis.
    enemyMesh.rotateX( 1.6 * ( i % 7 - 3.5 ) * dt );
    enemyMesh.rotateY( 1.6 * ( i % 6 - 3 ) * dt );
    enemyMesh.rotateZ( 1.6 * ( i % 5 - 2.5 ) * dt );
    if ( boundingBox.isIntersectionBox( bt ) ) {
      enemyMesh.material.color.copy( enemyHitColor );

      // Add explosion sprites.
      resetExplosionSprites();
      addExplosion(
        _vector3.copy( shipMesh.position )
          .add( enemyMesh.position )
          .multiplyScalar( 0.5 )
      );

      if ( !isHit ) {
        isHit = true;
        playExplosionSound();
        // 0.6 is roughly around how long the explosion sound lasts.
        animate(noop, 0.6, resetHit );

        lives--;
        if ( lives <= 0 ) {
          alive = false;
          setTimeout( end, 1024 );
        }
      }
      break;
    } else {
      enemyMesh.material.color.copy( enemyColor );
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

  // Update explosion sprites.
  var explosionDrag = 1 - 0.05 * dt;
  var velocity;
  for ( i = 0, il = explosionSprites.length; i < il; i++ ) {
    sprite = explosionSprites[i];
    if ( !sprite.visible ) {
      continue;
    }

    velocity = explosionVelocities[i];
    sprite.position.add( _vector3.copy( velocity ).multiplyScalar( dt ) );

    sprite.scale.multiplyScalar( explosionDrag );
    velocity.multiplyScalar( explosionDrag );
    velocity.add( _vector3.copy( explosionGravity ).multiplyScalar( dt ) );
  }

  // Update stars.
  var spritePosition;
  var spriteDepth;
  for ( i = 0, il = starSprites.length; i < il; i++ ) {
    sprite = starSprites[i];
    spritePosition = sprite.position;
    spritePosition.z -= 40 * dt;
    if ( spritePosition.z < position.z + starOffsetZ ) {
      spritePosition.copy( randomStarPosition() );
      spritePosition.z += position.z + starSpawnOffsetZ;
    }

    spriteDepth = spritePosition.z - position.z;
    sprite.material.opacity = _.clamp( -spriteDepth / 400 + 1, 0, 1 );
  }

  // Add life powerup.


  // Update score.
  score = 10 * position.z;
  if ( score > highScore ) {
    highScore = score;
  }

  textContent( highScoreEl, 'HIGH SCORE: ' + ( highScore | 0 ) );
  textContent( scoreEl, 'SCORE: ' + ( score | 0 ) );
  textContent( livesEl, 'LIVES: ' + ( lives | 0 ) );
};

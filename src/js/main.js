'use strict';

var Game = require( './game' );
var Color = require( './math/color' );
var Vector3 = require( './math/vector3' );
var Geometry = require( './geometry/geometry' );
var Material = require( './materials/material' );
var LambertMaterial = require( './materials/lambert-material' );
var LambertGlowMaterial = require( './materials/lambert-glow-material' );
var Mesh = require( './objects/mesh' );
var DirectionalLight = require( './lights/directional-light' );

var $ = document.querySelector.bind( document );

function on( el, type, listener ) {
  el.addEventListener( type, listener );
}

function off( el, type, listener ) {
  el.removeEventListener( type, listener );
}

function create( type ) {
  return document.createElement( type );
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
  Math.min( window.innerWidth, 568 ),
  Math.min( window.innerHeight, 320 )
);


var container = $( '#g' );
container.appendChild( game.canvas );

var scene = game.scene;

var geometry = new Geometry();

geometry.push(
  [
    -2, 0, -2,
    -2, 0,  2,
    2,  0,  2,
    2,  0, -2,
    // Top.
    -2, 4, -2,
    -2, 4,  2,
    2,  4,  2,
    2,  4, -2
  ],
  [
    // Sides.
    [ 0, 1, 5, 4 ],
    [ 1, 2, 6, 5 ],
    [ 2, 3, 7, 6 ],
    [ 3, 0, 4, 7 ],
    // Top.
    [ 4, 5, 6, 7 ]
  ]
);

geometry.computeFaceNormals();

var material = new LambertMaterial({
  color: new Color( 1, 1, 1 ),
  diffuse: new Color( 0.5, 0.5, 0.5 ),
  ambient: new Color( 0.5, 0.5, 0.5 )
});

var mesh = new Mesh( geometry, material );
scene.add( mesh );

var light = new DirectionalLight( new Color( 1, 1, 1 ) );
light.position.set( -10, 0, -5 );
scene.add( light );

scene.fogDensity = 0.05;
game.ambient.setRGB( 0.3, 0.3, 0.3 );

var camera = game.camera;
camera.position.set( 0, 0, -10 );
camera.lookAt( new Vector3( 0, 0, 0 ) );
camera.updateProjectionMatrix();

function createButton( el, id, text, action ) {
  var button = create( 'button' );
  button.id = id;
  textContent( button, text );
  on( button, 'click', action );
  prepend( el, button );
  return button;
}

// Create menu.
var menu = create( 'div' );
menu.id = 'm';
addClass( menu, 'c' );
append( container, menu );

// Begin button
var playButton = createButton( menu, 'p', 'PLAY', function() {
  game.play();
  addClass( menu, 'h' );
});

on( window, 'blur', function() {
  if ( game.running ) {
    game.pause();
    playButton.textContent = 'RESUME';
    removeClass( menu, 'h' );
  }
});

var keys = {};

on( document, 'keydown', function( event ) {
  keys[ event.keyCode ] = true;
});

on( document, 'keyup', function( event ) {
  keys[ event.keyCode ] = false;
});

var speed = 20;

mesh.update = function( dt ) {
  // Left arrow. A.
  if ( keys[ 37 ] || keys[ 65 ] ) {
    camera.translateX( -speed * dt );
  }

  // Right arrow. D.
  if ( keys[ 39 ] || keys[ 68 ] ) {
    camera.translateX( speed * dt );
  }

  // Up arrow. W.
  if ( keys[ 38 ] || keys[ 87 ] ) {
    camera.translateZ( -speed * dt );
  }

  // Down arrow. S.
  if ( keys[ 40 ] || keys[ 83 ] ) {
    camera.translateZ( speed * dt );
  }

  camera.updateMatrix();
};

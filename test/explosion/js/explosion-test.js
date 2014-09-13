'use strict';

var Game = require( '../../../src/js/game' );
var Color = require( '../../../src/js/math/color' );
var Vector3 = require( '../../../src/js/math/vector3' );
var SpriteCanvasMaterial = require( '../../../src/js/materials/sprite-canvas-material' );
var Sprite = require( '../../../src/js/objects/sprite' );

var Controls = require( '../../main/controls' );

var _ = require( '../../../src/js/utils' );

function randomSign() {
  return Math.random() < 0.5 ? -1 : 1;
}

function rotatedSquare( ctx, size ) {
  var halfSize = size / 2;

  // Counter-clockwise from right.
  ctx.moveTo( halfSize, 0 );
  ctx.lineTo( 0, halfSize );
  ctx.lineTo( -halfSize, 0 );
  ctx.lineTo( 0, -halfSize );
  ctx.lineTo( halfSize, 0 );
}

var gravity = new Vector3( 0, -50, 0 );

window.ExplosionTest = function() {
  var game = new Game(
    Math.min( window.innerWidth, 568 ),
    Math.min( window.innerHeight, 320 )
  );

  document.body.appendChild( game.canvas );

  var scene = game.scene;

  game.camera.position.set( 0, 0, -5 );

  var controls = new Controls( game.camera );
  controls.update();

  function materialProgram( ctx ) {
    /*jshint validthis:true*/
    ctx.moveTo( 0, 0 );

    rotatedSquare( ctx, 3 );
    ctx.fillStyle = 'rgba(240, 120, 80, 0.5)';
    ctx.fill();

    ctx.beginPath();
    rotatedSquare( ctx, 1.5 );
    // ctx.arc( 0, 0, 0.5, 0, 2 * Math.PI );
    ctx.fillStyle = this.color.toString();
    ctx.fill();
    /*jshint validthis:false*/
  }

  var sprites = [];
  var velocities = [];
  var sprite;
  var material;
  var i, il;
  for ( i = 0; i < 50; i++ ) {
    material = new SpriteCanvasMaterial({
      color: new Color( 1, 1, 1 ),
      blending: 'lighter',
      opacity: 0.5
    });
    material.program = materialProgram;

    sprite = new Sprite( material );
    sprites.push( sprite );
    scene.add( sprite );

    velocities.push( new Vector3() );
  }

  function reset() {
    for ( i = 0, il = sprites.length; i < il; i++ ) {
      sprite = sprites[i];
      sprite.position.set(
        _.randFloatSpread( 1 ),
        _.randFloatSpread( 1 ),
        _.randFloatSpread( 1 )
      );
      sprite.scale.set( 1, 1, 1 );

      velocities[i].set(
        randomSign() * _.randFloatSpread( 50 ),
        12 + Math.random() * 20,
        Math.random() * 20
      );
    }
  }

  reset();

  var _vector3 = new Vector3();
  var time = 0;
  game.onUpdate = function( dt ) {
    time += dt;

    if ( time > 3 ) {
      reset();
      time = 0;
    }

    var drag = 1 - 0.01 * dt;
    for ( i = 0, il = sprites.length; i < il; i++ ) {
      sprite = sprites[i];
      sprite.position.add(
        _vector3.copy( velocities[i] )
          .multiplyScalar( dt )
      );

      sprite.scale.multiplyScalar( drag );
      velocities[i].multiplyScalar( drag );
      velocities[i].add( _vector3.copy( gravity ).multiplyScalar( dt ) );
    }
  };

  game.play();
};

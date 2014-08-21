/*global requestAnimationFrame*/
'use strict';

var Color = require( './math/color' );
var Camera = require( './camera' );
var DirectionalLight = require( './lights/directional-light' );
var Renderer = require( './renderer/renderer' );

function Game( width, height ) {
  width  = width  || window.innerWidth;
  height = height || window.innerHeight;

  this.canvas = document.createElement( 'canvas' );
  this.ctx = this.canvas.getContext( '2d' );

  this.running = false;
  this.prevTime = 0;
  this.currTime = 0;

  this.fov = 90;
  this.camera = new Camera( this.fov );
  this.setSize( width, height );

  this.entities = [];

  this.light = new DirectionalLight();
  this.ambient = new Color();

  this.renderer = new Renderer({
    ctx: this.ctx,
    light: this.light,
    ambient: this.ambient
  });

  this.tick = this.tick.bind( this );
}

Game.prototype.tick = function() {
  if ( !this.running ) {
    return;
  }

  this.update();
  this.draw();
  requestAnimationFrame( this.tick );
};

Game.prototype.update = function() {
  this.currTime = Date.now();
  var dt = this.currTime - this.prevTime;
  this.prevTime = this.currTime;

  if ( dt > 1e2 ) {
    dt = 1e2;
  }

  dt *= 1e-3;

  this.entities.forEach(function( entity ) {
    entity.update( dt );
  });
};

Game.prototype.draw = function() {
  this.renderer.render( this.entities, this.camera );
};

Game.prototype.play = function() {
  this.running = true;
  this.prevTime = Date.now();
  requestAnimationFrame( this.tick );
};

Game.prototype.pause = function() {
  this.running = false;
};

Game.prototype.setSize = function( width, height ) {
  this.canvas.width  = width;
  this.canvas.height = height;
  this.camera.aspect = width / height;
  this.camera.updateProjectionMatrix();
};

module.exports = Game;
